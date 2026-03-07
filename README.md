# Task Manager Pro

TaskFlow Pro é um monorepo para gerenciamento de tarefas com interface web, API local e uma CLI em Node.js. O projeto foi organizado para demonstrar um fluxo completo de produtividade: cadastro de usuario, criacao de tasks, dashboard com metricas, quadro Kanban e timer Pomodoro.

## Visao Geral

- `packages/web`: frontend em React + TypeScript + Vite.
- `packages/api`: API REST em Express com persistencia local via LowDB.
- `packages/cli`: interface de linha de comando para operacoes com tasks.

## Funcionalidades

- Cadastro e login de usuarios.
- CRUD de tasks separado por usuario.
- Dashboard com indicadores de produtividade.
- Quadro Kanban com drag and drop.
- Organizacao por prioridade, categoria e data de vencimento.
- Timer Pomodoro com configuracoes personalizaveis.

## Stack

- React 19
- TypeScript
- Vite
- Express
- LowDB
- Node.js
- Commander, Chalk e Ora na CLI

## Estrutura Do Projeto

```text
task-manager-pro/
|-- package.json
|-- packages/
|   |-- api/
|   |   |-- server.js
|   |   `-- db.json
|   |-- cli/
|   |   `-- cli.js
|   `-- web/
|       |-- src/
|       `-- vite.config.ts
```

## Pre-Requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Como Rodar

1. Instale as dependencias na raiz:

```bash
npm install
```

2. Inicie a API em um terminal:

```bash
npm run dev:api
```

3. Inicie o frontend em outro terminal:

```bash
npm run dev:web
```

4. Acesse a aplicacao em `http://localhost:5173`.

## Scripts Da Raiz

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o frontend Vite |
| `npm run dev:web` | Inicia o frontend Vite |
| `npm run build` | Gera o build do frontend |
| `npm run preview` | Publica localmente o build do frontend |
| `npm run start` | Inicia a API em modo normal |
| `npm run dev:api` | Inicia a API em modo desenvolvimento |

## Fluxo De Uso

1. Abra a interface web.
2. Crie uma conta ou faca login.
3. Adicione tasks com descricao, prioridade, categoria e vencimento.
4. Acompanhe os numeros no dashboard.
5. Organize o trabalho no Kanban.
6. Use a aba de foco para executar sessoes Pomodoro.

## Endpoints Principais

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Cadastra um novo usuario |
| `POST` | `/api/auth/login` | Realiza login |
| `GET` | `/api/auth/me` | Retorna o usuario atual em modo simplificado |
| `GET` | `/api/tasks?userId=1` | Lista tasks do usuario |
| `POST` | `/api/tasks` | Cria task |
| `PUT` | `/api/tasks/:id` | Atualiza task |
| `PUT` | `/api/tasks/:id/complete` | Marca task como concluida |
| `DELETE` | `/api/tasks/:id` | Remove task |
| `GET` | `/api/stats?userId=1` | Retorna estatisticas |
| `GET` | `/api/efficiency?userId=1` | Calcula tempo medio de conclusao |
| `GET` | `/api/health` | Health check da API |

## Modelo Basico De Task

```json
{
  "id": 1,
  "description": "Preparar apresentacao",
  "priority": "high",
  "status": "pending",
  "dueDate": "2026-03-10",
  "category": "work",
  "userId": 1,
  "createdAt": "2026-03-07T12:00:00.000Z",
  "completedAt": null
}
```

## Pacotes

### Web

Aplicacao principal para uso diario. Concentra autenticacao, dashboard, board Kanban, criacao de tasks e Pomodoro.

### API

Servico local em Express que salva dados em `packages/api/db.json`. A API foi pensada para desenvolvimento local e prototipacao rapida.

### CLI

Existe um pacote de linha de comando com comandos de listagem, adicao, conclusao, exclusao e estatisticas. No estado atual, ele ainda nao acompanha completamente o contrato mais recente da API baseado em `userId`, entao deve ser tratado como experimental.

## Limitacoes Atuais

- A persistencia e feita em arquivo JSON local, sem banco relacional ou NoSQL dedicado.
- A autenticacao e simplificada e o frontend guarda o usuario em `localStorage`.
- O endpoint `/api/auth/me` retorna um usuario fixo de demonstracao.
- As senhas sao armazenadas em texto puro no banco atual; isso nao e adequado para producao.
- Nao ha suite automatizada de testes configurada no repositorio.

## Melhorias Sugeridas

- Adicionar hash de senha e autenticacao real com token.
- Sincronizar a CLI com o contrato atual da API.
- Criar testes para API e frontend.
- Externalizar configuracoes como URL da API para variaveis de ambiente.

## Documentacao Dos Pacotes

- Frontend: [packages/web/README.md](packages/web/README.md)
