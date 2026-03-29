import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'taskflow_secret_key_123'; // Em produção, use variáveis de ambiente

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
const db = new Low(adapter, { users: [], tasks: [], idCounter: 1 });
await db.read();

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
  await db.read();
  const userTasks = (db.data?.tasks || []).filter(t => t.userId === req.user.id);
  res.json(userTasks);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { description, priority, category } = req.body;
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

app.listen(PORT, () => console.log(`🚀 API TaskFlow Pro Segura na porta ${PORT}`));
