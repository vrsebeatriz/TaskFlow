# TaskFlow Pro

TaskFlow Pro e um monorepo para gerenciamento de tarefas com tres frentes principais:

- uma interface web moderna para uso diario
- uma API local para persistencia e regras de negocio
- uma CLI para operacoes rapidas pelo terminal

O projeto foi pensado como uma base de produtividade full stack, reunindo autenticacao, CRUD de tasks, dashboard com metricas, quadro Kanban e timer Pomodoro em um unico repositorio.

## Visao geral

Com o TaskFlow Pro voce pode:

- cadastrar e autenticar usuarios
- criar, editar, concluir e remover tasks
- organizar trabalho por prioridade, categoria e prazo
- acompanhar indicadores no dashboard
- mover tasks entre colunas no board Kanban
- usar a CLI para operacoes essenciais sem abrir a interface
- executar sessoes de foco com Pomodoro

## Estrutura do projeto

```text
task-manager-pro/
|-- package.json
|-- README.md
`-- packages/
    |-- api/
    |   |-- server.js
    |   `-- db.json
    |-- cli/
    |   `-- cli.js
    |-- shared/
    `-- web/
        |-- src/
        |-- package.json
        `-- vite.config.ts
```

## Stack

### Web

- React 19
- TypeScript
- Vite
- Lucide React
- drag and drop com `@hello-pangea/dnd`

### API

- Node.js
- Express
- LowDB
- CORS

### CLI

- Commander
- Axios
- Chalk
- Ora

## Como rodar localmente

### Requisitos

- Node.js 18 ou superior
- npm 9 ou superior

### Instalacao

```bash
npm install
```

### Desenvolvimento

Em um terminal, inicie a API:

```bash
npm run dev:api
```

Em outro terminal, inicie o frontend:

```bash
npm run dev:web
```

Depois disso:

- frontend: `http://localhost:5173`
- API: `http://localhost:3001`
- health check: `http://localhost:3001/api/health`

### Observacoes importantes

- Durante o desenvolvimento, o Vite faz proxy de `/api` para `http://127.0.0.1:3001`.
- Os dados sao persistidos localmente em `packages/api/db.json`.
- O projeto nao depende de banco externo para rodar localmente.

## Scripts da raiz

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o frontend com Vite |
| `npm run dev:web` | Inicia o frontend com Vite |
| `npm run dev:api` | Inicia a API local |
| `npm run build` | Gera o build do frontend |
| `npm run preview` | Publica localmente o build do frontend |
| `npm run start` | Inicia a API sem modo watch |

## Pacotes

### `packages/web`

Aplicacao principal do projeto. Reune:

- autenticacao de usuario
- dashboard com estatisticas
- criacao e edicao de tasks
- board Kanban com drag and drop
- timer Pomodoro
- feedback visual com toasts e modais

### `packages/api`

API REST local em Express responsavel por:

- cadastro e login
- operacoes de task por usuario
- estatisticas e metricas de produtividade
- persistencia em arquivo JSON com LowDB

### `packages/cli`

Cliente de linha de comando para interagir com a API. Hoje cobre operacoes como:

- listar tasks
- adicionar task
- concluir task
- deletar task
- consultar estatisticas

## Exemplos de uso da CLI

Com a API rodando, voce pode usar:

```bash
node packages/cli/cli.js --user-id 1 list
node packages/cli/cli.js --user-id 1 add "Preparar apresentacao" --priority high --due 2026-03-30
node packages/cli/cli.js --user-id 1 complete 3
node packages/cli/cli.js --user-id 1 delete 3
node packages/cli/cli.js --user-id 1 stats
```

## Endpoints principais

| Metodo | Rota | Descricao |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Cria um novo usuario |
| `POST` | `/api/auth/login` | Faz login |
| `GET` | `/api/auth/me` | Retorna o usuario atual em modo simplificado |
| `GET` | `/api/tasks?userId=1` | Lista tasks do usuario |
| `POST` | `/api/tasks` | Cria uma nova task |
| `PUT` | `/api/tasks/:id` | Atualiza uma task |
| `PUT` | `/api/tasks/:id/complete` | Marca uma task como concluida |
| `DELETE` | `/api/tasks/:id` | Remove uma task |
| `GET` | `/api/stats?userId=1` | Retorna estatisticas do usuario |
| `GET` | `/api/efficiency?userId=1` | Calcula tempo medio de conclusao |
| `GET` | `/api/health` | Health check da API |

## Fluxo de uso

1. Inicie a API e o frontend.
2. Acesse a interface web em `http://localhost:5173`.
3. Crie uma conta ou faca login.
4. Cadastre suas tasks com descricao, prioridade, categoria e vencimento.
5. Acompanhe o desempenho no dashboard.
6. Organize o trabalho no quadro Kanban.
7. Use a aba de foco para executar sessoes Pomodoro.

## Estado atual do projeto

O TaskFlow Pro esta funcional para desenvolvimento local e demonstracao de produto. Ainda assim, alguns pontos foram mantidos simples para acelerar a evolucao do projeto:

- persistencia local em arquivo JSON
- autenticacao simplificada no frontend
- usuario atual armazenado em `localStorage`
- endpoint `/api/auth/me` ainda retorna um usuario de demonstracao
- senhas ainda nao estao protegidas com hash no fluxo atual
- nao ha suite automatizada de testes configurada na raiz

## Proximos passos sugeridos

- implementar autenticacao real com JWT
- aplicar hash de senha com seguranca adequada
- adicionar testes para frontend e API
- externalizar configuracoes para variaveis de ambiente
- substituir persistencia local por banco de dados de producao
- criar um comando unico para subir web e API em paralelo

## Documentacao complementar

- Frontend: [packages/web/README.md](packages/web/README.md)
