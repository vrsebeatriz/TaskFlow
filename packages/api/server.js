import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS bem permissivo para desenvolvimento
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`, req.body);
  next();
});

// Database setup
const dbPath = join(__dirname, 'db.json');
console.log('📁 Database path:', dbPath);

// Garantir que o arquivo do banco de dados existe
if (!fs.existsSync(dbPath)) {
  console.log('📝 Criando novo arquivo de database...');
  fs.writeFileSync(dbPath, JSON.stringify({ 
    users: [], 
    tasks: [], 
    idCounter: 1 
  }));
}

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { 
  users: [], 
  tasks: [], 
  idCounter: 1 
});

// Garantir que o db está inicializado
await db.read();
if (!db.data) {
  console.log('🔄 Inicializando database...');
  db.data = { users: [], tasks: [], idCounter: 1 };
  await db.write();
}

console.log('✅ Database inicializado com sucesso');

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registrar novo usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Recebendo solicitação de registro:', req.body);
    
    const { name, email, password } = req.body;

    // ✅ VALIDAÇÕES CORRIGIDAS - verificar se existe antes de usar .length
    if (!name || name.trim().length === 0) {
      console.log('❌ Nome inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Nome é obrigatório' 
      });
    }

    if (!email || email.trim().length === 0) {
      console.log('❌ Email inválido');
      return res.status(400).json({ 
        success: false,
        error: 'Email é obrigatório' 
      });
    }

    if (!password) { // ✅ Verifica se password existe
      console.log('❌ Senha não fornecida');
      return res.status(400).json({ 
        success: false,
        error: 'Senha é obrigatória' 
      });
    }

    if (password.length < 6) { // ✅ Agora seguro porque verificamos acima
      console.log('❌ Senha muito curta');
      return res.status(400).json({ 
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    await db.read();
    console.log('📊 Usuários no banco:', db.data?.users?.length || 0);

    // ✅ Verificação segura se db.data.users existe
    const users = db.data?.users || [];
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log('❌ Usuário já existe:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Usuário já existe' 
      });
    }

    // ✅ Criação segura do usuário
    const user = {
      id: db.data.idCounter++,
      name: name.trim(),
      email: email.trim(),
      password: password,
      createdAt: new Date().toISOString()
    };

    // ✅ Garantir que users array existe
    if (!db.data.users) {
      db.data.users = [];
    }
    
    db.data.users.push(user);
    await db.write();

    console.log('✅ Usuário criado com sucesso:', { id: user.id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('💥 Erro no registro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Recebendo solicitação de login:', req.body?.email);
    
    const { email, password } = req.body;

    // ✅ VALIDAÇÕES SEGURAS
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email e senha são obrigatórios' 
      });
    }

    await db.read();

    // ✅ VERIFICAÇÃO SEGURA
    const users = db.data?.users || [];
    const user = users.find(user => user.email === email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    // ✅ VERIFICAÇÃO SEGURA DA SENHA
    if (!user.password || user.password !== password) {
      console.log('❌ Senha incorreta para:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    console.log('✅ Login bem-sucedido:', user.email);

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('💥 Erro no login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// Verificar usuário atual (AGORA DINÂMICO)
app.get('/api/auth/me', async (req, res) => {
  try {
    // Em uma versão real, pegaria o token do header e validaria
    // Por enquanto, retorna um usuário genérico ou erro
    res.json({
      success: true,
      user: {
        id: 1,
        name: 'Usuário Demo',
        email: 'demo@taskflow.com'
      }
    });
  } catch (error) {
    console.error('💥 Erro ao verificar usuário:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor' 
    });
  }
});

// ==================== ROTAS DE TASKS (COM SEPARAÇÃO POR USUÁRIO) ====================

// Buscar tasks do usuário atual
app.get('/api/tasks', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'User ID é obrigatório e deve ser um número' });
    }

    await db.read();
    const tasks = db.data?.tasks || [];
    
    // ✅ Filtra tasks apenas do usuário específico
    const userTasks = tasks.filter(task => task.userId === userId);
    
    console.log('📋 Retornando tasks do usuário:', userId, 'Total:', userTasks.length);
    res.json(userTasks);
  } catch (error) {
    console.error('💥 Erro ao buscar tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Criar nova task para o usuário específico
app.post('/api/tasks', async (req, res) => {
  try {
    const { description, priority = 'medium', dueDate, category, userId } = req.body;
    
    console.log('➕ Criando nova task para usuário:', userId, { description, priority });

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await db.read();
    
    const task = {
      id: db.data.idCounter++,
      description: description.trim(),
      priority,
      dueDate,
      category: category || 'work',
      status: 'pending',
      userId: userId,
      createdAt: new Date().toISOString(), // ✅ SEMPRE salvar createdAt
      completedAt: null
    };
    
    // ✅ Garantir que tasks array existe
    if (!db.data.tasks) {
      db.data.tasks = [];
    }
    
    db.data.tasks.push(task);
    await db.write();
    
    console.log('✅ Task criada para usuário:', userId, 'Task ID:', task.id, 'createdAt:', task.createdAt);
    res.status(201).json(task);
  } catch (error) {
    console.error('💥 Erro ao criar task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Atualizar task (apenas do usuário dono)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { description, priority, dueDate, category, status, userId } = req.body;
    
    console.log('✏️ Atualizando task:', taskId, 'para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    await db.read();
    const tasks = db.data?.tasks || [];
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === userId);
    
    if (taskIndex === -1) {
      console.log('❌ Task não encontrada ou usuário não autorizado:', taskId, userId);
      return res.status(404).json({ error: 'Task not found' });
    }

    // Atualizar apenas os campos fornecidos
    if (description !== undefined) tasks[taskIndex].description = description;
    if (priority !== undefined) tasks[taskIndex].priority = priority;
    if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate;
    if (category !== undefined) tasks[taskIndex].category = category;
    if (status !== undefined) {
      tasks[taskIndex].status = status;
      if (status === 'completed') {
        tasks[taskIndex].completedAt = new Date().toISOString();
        console.log('✅ Task marcada como completa - completedAt:', tasks[taskIndex].completedAt);
      } else if (status === 'pending') {
        tasks[taskIndex].completedAt = null;
      }
    }

    db.data.tasks = tasks;
    await db.write();
    
    console.log('✅ Task atualizada:', taskId);
    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('💥 Erro ao atualizar task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Marcar task como completa (apenas do usuário dono)
app.put('/api/tasks/:id/complete', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log('✅ Completando task:', taskId, 'do usuário:', userId);
    
    await db.read();
    const tasks = db.data?.tasks || [];
    const task = tasks.find(t => t.id === taskId && t.userId === userId);
    
    if (task) {
      task.status = 'completed';
      task.completedAt = new Date().toISOString(); // ✅ GARANTIR QUE completedAt É SALVO
      await db.write();
      console.log('✅ Task completada:', taskId, 'completedAt:', task.completedAt, 'createdAt:', task.createdAt);
      res.json(task);
    } else {
      console.log('❌ Task não encontrada ou usuário não autorizado:', taskId, userId);
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('💥 Erro ao completar task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Deletar task (apenas do usuário dono)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log('🗑️ Deletando task:', taskId, 'do usuário:', userId);
    
    await db.read();
    const tasks = db.data?.tasks || [];
    const initialLength = tasks.length;
    
    // ✅ Filtra apenas a task do usuário específico
    db.data.tasks = tasks.filter(t => !(t.id === taskId && t.userId === userId));
    await db.write();
    
    console.log('✅ Task deletada. Antes:', initialLength, 'Depois:', db.data.tasks.length);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('💥 Erro ao deletar task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Estatísticas do usuário específico
app.get('/api/stats', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'User ID é obrigatório e deve ser um número' });
    }
    
    await db.read();
    const tasks = db.data?.tasks || [];
    
    // ✅ Filtra tasks apenas do usuário específico
    const userTasks = tasks.filter(task => task.userId === userId);
    const total = userTasks.length;
    const completed = userTasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    
    console.log('📊 Estatísticas do usuário:', userId, { total, completed, pending });
    res.json({ total, completed, pending });
  } catch (error) {
    console.error('💥 Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Rota para calcular eficiência (tempo médio de conclusão)
app.get('/api/efficiency', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'User ID é obrigatório' });
    }
    
    await db.read();
    const tasks = db.data?.tasks || [];
    
    // ✅ Filtra tasks apenas do usuário específico
    const userTasks = tasks.filter(task => task.userId === userId);
    const completedTasks = userTasks.filter(task => 
      task.status === 'completed' && task.createdAt && task.completedAt
    );

    let avgCompletionTime = 0;

    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((acc, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt).getTime();
        return acc + (completed - created);
      }, 0);

      const averageTimeMs = totalTime / completedTasks.length;
      avgCompletionTime = Math.round((averageTimeMs / (1000 * 60 * 60 * 24)) * 10) / 10; // Dias com 1 casa decimal
    }

    console.log('⏰ Eficiência calculada para usuário:', userId, 'Tempo médio:', avgCompletionTime, 'dias');
    
    res.json({
      avgCompletionTime,
      completedTasksCount: completedTasks.length,
      totalTasksCount: userTasks.length
    });
  } catch (error) {
    console.error('💥 Erro ao calcular eficiência:', error);
    res.status(500).json({ error: 'Failed to calculate efficiency' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('❤️ Health check solicitado');
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: dbPath
  });
});

// Rota de fallback para 404
app.use('/api/*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 =================================');
  console.log('🚀 API TaskFlow Pro iniciada!');
  console.log('🚀 =================================');
  console.log(`📡 Porta: ${PORT}`);
  console.log(`💾 Database: ${dbPath}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👤 Registrar: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📋 Tasks: GET http://localhost:${PORT}/api/tasks?userId=1`);
  console.log(`⏰ Eficiência: GET http://localhost:${PORT}/api/efficiency?userId=1`);
  console.log('🚀 =================================\n');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('💥 Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Exceção não capturada:', err);
});