import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import ora from 'ora';

const API_BASE = 'http://localhost:3001/api';
const program = new Command();

const api = axios.create({
  baseURL: API_BASE
});

const getUserId = () => {
  const rawUserId = program.opts().userId ?? process.env.TASKFLOW_USER_ID ?? '1';
  const userId = Number(rawUserId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Informe um userId numérico válido com --user-id ou TASKFLOW_USER_ID.');
  }

  return userId;
};

program
  .version('1.0.0')
  .option('-u, --user-id <id>', 'ID do usuário usado nas operações da API', process.env.TASKFLOW_USER_ID || '1')
  .description('Task Manager CLI - Gerencie suas tasks pelo terminal');

program
  .command('list')
  .description('Listar todas as tasks')
  .option('-s, --status <status>', 'Filtrar por status (pending, completed)')
  .action(async (options) => {
    const spinner = ora('Carregando tasks...').start();

    try {
      const response = await api.get('/tasks', { params: { userId: getUserId() } });
      let tasks = response.data;

      if (options.status) {
        tasks = tasks.filter(task => task.status === options.status);
      }

      spinner.succeed('Tasks carregadas!');

      if (tasks.length === 0) {
        console.log(chalk.yellow('Nenhuma task encontrada.'));
        return;
      }

      console.log('\n' + chalk.blue.bold('📋 Suas Tasks:\n'));

      tasks.forEach(task => {
        const statusIcon = task.status === 'completed' ? '✅' : '⏳';
        const statusColor = task.status === 'completed' ? chalk.green : chalk.yellow;

        const priorityColors = {
          low: chalk.green,
          medium: chalk.yellow,
          high: chalk.red
        };

        console.log(`${statusColor(statusIcon)} ${chalk.bold(`#${task.id}`)} ${task.description}`);
        console.log(`   📊 Prioridade: ${priorityColors[task.priority](task.priority)}`);
        console.log(`   📅 Criada: ${new Date(task.createdAt).toLocaleDateString('pt-BR')}`);
        if (task.dueDate) {
          console.log(`   ⏰ Vencimento: ${new Date(task.dueDate).toLocaleDateString('pt-BR')}`);
        }
        console.log('');
      });

    } catch (error) {
      spinner.fail('Erro ao carregar tasks');
      console.log(chalk.red(error.message || 'Certifique-se de que a API está rodando: npm run dev:api'));
    }
  });

program
  .command('add <description>')
  .description('Adicionar nova task')
  .option('-p, --priority <level>', 'Prioridade (low, medium, high)', 'medium')
  .option('-d, --due <date>', 'Data de vencimento (YYYY-MM-DD)')
  .action(async (description, options) => {
    const spinner = ora('Adicionando task...').start();

    try {
      const response = await api.post('/tasks', {
        description,
        priority: options.priority,
        dueDate: options.due,
        userId: getUserId()
      });

      spinner.succeed('Task adicionada com sucesso!');
      console.log(chalk.green(`✅ #${response.data.id} - ${response.data.description}`));

    } catch (error) {
      spinner.fail('Erro ao adicionar task');
      console.log(chalk.red(error.message || 'Certifique-se de que a API está rodando'));
    }
  });

program
  .command('complete <id>')
  .description('Marcar task como concluída')
  .action(async (id) => {
    const spinner = ora('Completando task...').start();

    try {
      await api.put(`/tasks/${id}/complete`, { userId: getUserId() });
      spinner.succeed(`Task #${id} marcada como concluída!`);

    } catch (error) {
      spinner.fail('Erro ao completar task');
      console.log(chalk.red(error.message || 'Task não encontrada ou API offline'));
    }
  });

program
  .command('delete <id>')
  .description('Deletar uma task')
  .action(async (id) => {
    const spinner = ora('Deletando task...').start();

    try {
      await api.delete(`/tasks/${id}`, { data: { userId: getUserId() } });
      spinner.succeed(`Task #${id} deletada com sucesso!`);

    } catch (error) {
      spinner.fail('Erro ao deletar task');
      console.log(chalk.red(error.message || 'Task não encontrada ou API offline'));
    }
  });

program
  .command('stats')
  .description('Mostrar estatísticas')
  .action(async () => {
    const spinner = ora('Carregando estatísticas...').start();

    try {
      const response = await api.get('/stats', { params: { userId: getUserId() } });
      const stats = response.data;

      spinner.succeed('Estatísticas carregadas!');

      console.log('\n' + chalk.blue.bold('📊 Estatísticas:\n'));
      console.log(`Total: ${chalk.white(stats.total)}`);
      console.log(`Concluídas: ${chalk.green(stats.completed)}`);
      console.log(`Pendentes: ${chalk.yellow(stats.pending)}`);

      if (stats.total > 0) {
        const progress = Math.round((stats.completed / stats.total) * 100);
        console.log(`Progresso: ${chalk.cyan(progress + '%')}`);

        const barLength = 20;
        const completedBars = Math.round((stats.completed / stats.total) * barLength);
        const bar = '█'.repeat(completedBars) + '░'.repeat(barLength - completedBars);
        console.log(`[${chalk.green(bar)}]`);
      }

    } catch (error) {
      spinner.fail('Erro ao carregar estatísticas');
      console.log(chalk.red(error.message || 'Certifique-se de que a API está rodando'));
    }
  });

if (process.argv.length === 2) {
  program.outputHelp();
}

program.parse(process.argv);
