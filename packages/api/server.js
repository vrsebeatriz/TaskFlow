import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_secret_key_123';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
console.log("🚀 IA configurada. Chave iniciada em:", GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 7) : "NULA", "Comprimento:", GEMINI_API_KEY?.length);

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'db.json');
const adapter = new JSONFile(dbPath);
const defaultData = { 
  users: [], 
  tasks: [], 
  habits: [], 
  habitLogs: [], 
  goals: [], 
  transactions: [], 
  workouts: [], 
  meals: [],
  idCounter: 1 
};
const db = new Low(adapter, defaultData);
await db.read();
if (!db.data) {
  db.data = defaultData;
  await db.write();
} else {
  db.data.habits = db.data.habits || [];
  db.data.habitLogs = db.data.habitLogs || [];
  db.data.goals = db.data.goals || [];
  db.data.transactions = db.data.transactions || [];
  db.data.workouts = db.data.workouts || [];
  db.data.meals = db.data.meals || [];
  await db.write();
}

// Middleware para verificar o Token JWT [CITE: 1]
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registrar novo usuário com Hash [CITE: 1]
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }

    await db.read();
    const users = db.data?.users || [];
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ success: false, error: 'Usuário já existe' });
    }

    // Criar Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: db.data.idCounter++,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.data.users.push(user);
    await db.write();

    res.status(201).json({ success: true, message: 'Usuário criado!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Login com verificação de Hash e geração de JWT [CITE: 1]
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    await db.read();
    
    const user = db.data?.users.find(u => u.email === email.toLowerCase());
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, error: 'Credenciais inválidas' });
    }

    // Gerar Token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Verificar usuário atual (Protegida)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  await db.read();
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ==================== ROTAS DE TASKS (PROTEGIDAS) ====================

app.get('/api/tasks', authenticateToken, async (req, res) => {
  console.log(`📋 Buscando tarefas para o usuário: ${req.user.id}`);
  await db.read();
  const userTasks = (db.data?.tasks || []).filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { description, priority, category } = req.body;
  console.log(`🆕 Criando tarefa para o usuário ${req.user.id}:`, { description, priority, category });
  await db.read();
  
  const task = {
    id: db.data.idCounter++,
    description,
    priority: priority || 'medium',
    category: category || 'work',
    status: 'pending',
    userId: req.user.id,
    createdAt: new Date().toISOString()
  };
  
  db.data.tasks.push(task);
  await db.write();
  res.status(201).json(task);
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = Number(req.params.id);
  const updates = req.body ?? {};

  await db.read();

  const task = db.data.tasks.find(
    currentTask => currentTask.id === taskId && currentTask.userId === req.user.id
  );

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  const allowedFields = ['description', 'priority', 'category', 'dueDate', 'status'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      task[field] = updates[field];
    }
  }

  if (updates.status === 'completed') {
    task.completedAt = task.completedAt || new Date().toISOString();
  } else if (updates.status !== undefined) {
    task.completedAt = null;
  }

  await db.write();
  res.json(task);
});

app.put('/api/tasks/:id/complete', authenticateToken, async (req, res) => {
  const taskId = Number(req.params.id);

  await db.read();

  const task = db.data.tasks.find(
    currentTask => currentTask.id === taskId && currentTask.userId === req.user.id
  );

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();

  await db.write();
  res.json(task);
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = Number(req.params.id);

  await db.read();

  const taskIndex = db.data.tasks.findIndex(
    currentTask => currentTask.id === taskId && currentTask.userId === req.user.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  db.data.tasks.splice(taskIndex, 1);
  await db.write();

  res.status(204).send();
});

// ==================== ROTAS DE HABITOS ====================

app.get('/api/habits', authenticateToken, async (req, res) => {
  await db.read();
  const habits = (db.data?.habits || []).filter(h => h.userId === req.user.id);
  res.json(habits);
});

app.post('/api/habits', authenticateToken, async (req, res) => {
  const { title, frequency, emoji } = req.body;
  await db.read();
  const habit = {
    id: db.data.idCounter++,
    userId: req.user.id,
    title,
    frequency: frequency || 'daily',
    emoji: emoji || '🎯',
    createdAt: new Date().toISOString(),
  };
  db.data.habits.push(habit);
  await db.write();
  res.status(201).json(habit);
});

app.delete('/api/habits/:id', authenticateToken, async (req, res) => {
  const habitId = Number(req.params.id);
  await db.read();
  const index = db.data.habits.findIndex(h => h.id === habitId && h.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Hábito não encontrado' });
  db.data.habits.splice(index, 1);
  await db.write();
  res.status(204).send();
});

// Logs de hábitos (Streak)
app.get('/api/habitLogs', authenticateToken, async (req, res) => {
  await db.read();
  const logs = (db.data?.habitLogs || []).filter(l => l.userId === req.user.id);
  res.json(logs);
});

app.post('/api/habitLogs', authenticateToken, async (req, res) => {
  const { habitId, date, completed } = req.body; // date format YYYY-MM-DD
  await db.read();
  
  const existingLogIndex = db.data.habitLogs.findIndex(
    l => l.habitId === habitId && l.date === date && l.userId === req.user.id
  );

  let log;
  if (existingLogIndex >= 0) {
    db.data.habitLogs[existingLogIndex].completed = completed;
    log = db.data.habitLogs[existingLogIndex];
  } else {
    log = {
      id: db.data.idCounter++,
      userId: req.user.id,
      habitId,
      date,
      completed
    };
    db.data.habitLogs.push(log);
  }
  await db.write();
  res.json(log);
});

// ==================== ROTAS DE TREINOS ====================

app.get('/api/workouts', authenticateToken, async (req, res) => {
  await db.read();
  const workouts = (db.data?.workouts || []).filter(w => w.userId === req.user.id);
  res.json(workouts);
});

app.post('/api/workouts', authenticateToken, async (req, res) => {
  const { name, exercises, date } = req.body;
  await db.read();
  const workout = {
    id: db.data.idCounter++,
    userId: req.user.id,
    name,
    exercises: exercises || [], // { name: '', sets: [{ weight: 0, reps: 0 }] }
    date: date || new Date().toISOString(),
  };
  db.data.workouts.push(workout);
  await db.write();
  res.status(201).json(workout);
});

app.put('/api/workouts/:id', authenticateToken, async (req, res) => {
  const workoutId = Number(req.params.id);
  await db.read();
  const workout = db.data.workouts.find(w => w.id === workoutId && w.userId === req.user.id);
  if (!workout) return res.status(404).json({ error: 'Treino não encontrado' });

  if (req.body.name) workout.name = req.body.name;
  if (req.body.exercises) workout.exercises = req.body.exercises;
  
  await db.write();
  res.json(workout);
});

app.delete('/api/workouts/:id', authenticateToken, async (req, res) => {
  const workoutId = Number(req.params.id);
  await db.read();
  const index = db.data.workouts.findIndex(w => w.id === workoutId && w.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Treino não encontrado' });
  db.data.workouts.splice(index, 1);
  await db.write();
  res.status(204).send();
});

// ==================== ROTAS DE METAS ====================

app.get('/api/goals', authenticateToken, async (req, res) => {
  await db.read();
  const goals = (db.data?.goals || []).filter(g => g.userId === req.user.id);
  res.json(goals);
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  const { title, category, targetValue, currentValue, deadline } = req.body;
  await db.read();
  const goal = {
    id: db.data.idCounter++,
    userId: req.user.id,
    title,
    category: category || 'General',
    targetValue: Number(targetValue) || 0,
    currentValue: Number(currentValue) || 0,
    deadline,
    createdAt: new Date().toISOString(),
  };
  db.data.goals.push(goal);
  await db.write();
  res.status(201).json(goal);
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  const goalId = Number(req.params.id);
  await db.read();
  const goal = db.data.goals.find(g => g.id === goalId && g.userId === req.user.id);
  if (!goal) return res.status(404).json({ error: 'Meta não encontrada' });

  if (req.body.title !== undefined) goal.title = req.body.title;
  if (req.body.category !== undefined) goal.category = req.body.category;
  if (req.body.targetValue !== undefined) goal.targetValue = Number(req.body.targetValue);
  if (req.body.currentValue !== undefined) goal.currentValue = Number(req.body.currentValue);
  if (req.body.deadline !== undefined) goal.deadline = req.body.deadline;
  
  await db.write();
  res.json(goal);
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
  const goalId = Number(req.params.id);
  await db.read();
  const index = db.data.goals.findIndex(g => g.id === goalId && g.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Meta não encontrada' });
  db.data.goals.splice(index, 1);
  await db.write();
  res.status(204).send();
});

// ==================== ROTAS DE FINANÇAS ====================

app.get('/api/transactions', authenticateToken, async (req, res) => {
  await db.read();
  const transactions = (db.data?.transactions || []).filter(t => t.userId === req.user.id);
  res.json(transactions);
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { description, amount, type, date } = req.body;
  await db.read();
  const transaction = {
    id: db.data.idCounter++,
    userId: req.user.id,
    description,
    amount: Number(amount) || 0,
    type: type || 'expense', // 'income' or 'expense'
    date: date || new Date().toISOString(),
  };
  db.data.transactions.push(transaction);
  await db.write();
  res.status(201).json(transaction);
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  const transId = Number(req.params.id);
  await db.read();
  const index = db.data.transactions.findIndex(t => t.id === transId && t.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Transação não encontrada' });
  db.data.transactions.splice(index, 1);
  await db.write();
  res.status(204).send();
});

app.post('/api/finances/analyze', authenticateToken, async (req, res) => {
  const { history, prompt } = req.body;

  if (!genAI) {
    // Fallback se não houver chave de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return res.json({
      success: true,
      insight: "Integração com Gemini configurada! Adicione sua GEMINI_API_KEY ao arquivo .env para receber análises reais. Por enquanto, notei que você pode economizar em alimentação fora de casa."
    });
  }

  try {
    // Usa o modelo mais robusto suportado pela chave
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Preparar o contexto financeiro para a IA
    await db.read();
    const userTransactions = (db.data?.transactions || []).filter(t => t.userId === req.user.id);
    const userGoals = (db.data?.goals || []).filter(g => g.userId === req.user.id);
    
    const userPrompt = prompt || req.body.text;

    const context = `
      Você é um assistente financeiro pessoal de elite. O usuário está no "Life OS".
      Dados atuais:
      - Transações: ${JSON.stringify(userTransactions.slice(-20))}
      - Metas: ${JSON.stringify(userGoals)}
      
      Instrução: Seja direto (máximo 3 frases), motivador e dê 1 ação prática. Responda em Português.
      Pergunta: ${userPrompt}
    `;

    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      insight: text
    });
  } catch (error) {
    console.error("ERRO GEMINI DETALHADO:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error.response || error
    });
    
    // Se falhar, vamos dar uma resposta de "IA Simulada" para não quebrar a experiência
    const fallbackInsights = [
      "Notei que você teve várias movimentações este mês. Que tal categorizá-las melhor para eu te dar dicas precisas?",
      "Seu saldo atual permite um pequeno investimento em educação ou lazer. Já pensou nisso?",
      "Economizar 10% logo no início do mês é a melhor estratégia para atingir suas metas mais rápido."
    ];
    const randomInsight = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)];

    res.json({ 
      success: true, 
      insight: `(Modo Offline) ${randomInsight} \n\n[Nota: Verifique sua GEMINI_API_KEY no arquivo .env para ativar a inteligência real]` 
    });
  }
});

// ==================== ROTAS DE TREINOS ====================

app.get('/api/workouts', authenticateToken, async (req, res) => {
  await db.read();
  const workouts = (db.data?.workouts || []).filter(w => w.userId === req.user.id);
  res.json(workouts);
});

app.post('/api/workouts', authenticateToken, async (req, res) => {
  const { name, exercises, date } = req.body;
  await db.read();
  const workout = {
    id: db.data.idCounter++,
    userId: req.user.id,
    name: name || 'Treino',
    exercises: exercises || [],
    date: date || new Date().toISOString(),
  };
  db.data.workouts.push(workout);
  await db.write();
  res.status(201).json(workout);
});

app.put('/api/workouts/:id', authenticateToken, async (req, res) => {
  const workoutId = Number(req.params.id);
  await db.read();
  const index = db.data.workouts.findIndex(w => w.id === workoutId && w.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Treino não encontrado' });
  db.data.workouts[index] = { ...db.data.workouts[index], ...req.body };
  await db.write();
  res.json(db.data.workouts[index]);
});

app.delete('/api/workouts/:id', authenticateToken, async (req, res) => {
  const workoutId = Number(req.params.id);
  await db.read();
  const index = db.data.workouts.findIndex(w => w.id === workoutId && w.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Treino não encontrado' });
  db.data.workouts.splice(index, 1);
  await db.write();
  res.status(204).send();
});

// ==================== ROTAS DE DIETA ====================

app.get('/api/meals', authenticateToken, async (req, res) => {
  await db.read();
  const meals = (db.data?.meals || []).filter(m => m.userId === req.user.id);
  res.json(meals);
});

app.post('/api/meals', authenticateToken, async (req, res) => {
  const { name, calories, protein, carbs, fats, date } = req.body;
  await db.read();
  const meal = {
    id: db.data.idCounter++,
    userId: req.user.id,
    name,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fats: Number(fats) || 0,
    date: date || new Date().toISOString(),
  };
  db.data.meals.push(meal);
  await db.write();
  res.status(201).json(meal);
});

app.delete('/api/meals/:id', authenticateToken, async (req, res) => {
  const mealId = Number(req.params.id);
  await db.read();
  const index = db.data.meals.findIndex(m => m.id === mealId && m.userId === req.user.id);
  if (index === -1) return res.status(404).json({ error: 'Refeição não encontrada' });
  db.data.meals.splice(index, 1);
  await db.write();
  res.status(204).send();
});

app.listen(PORT, () => console.log(`🚀 API TaskFlow Pro Segura na porta ${PORT}`));