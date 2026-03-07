# Web App

Frontend do Task Manager Pro construido com React, TypeScript e Vite. Esta aplicacao e a interface principal do projeto e concentra autenticacao, criacao de tasks, dashboard, board Kanban e Pomodoro.

## Executar

Na raiz do repositorio:

```bash
npm run dev:web
```

Ou dentro deste pacote:

```bash
npm run dev
```

O frontend sobe por padrao em `http://localhost:5173`.

## Scripts

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila TypeScript e gera o build |
| `npm run preview` | Publica o build localmente |
| `npm run lint` | Executa o ESLint |

## Funcionalidades Da Interface

- Cadastro e login de usuarios.
- Dashboard com cards de produtividade e visao geral das tasks.
- Criacao de task em modal com descricao, prioridade, categoria e vencimento.
- Board Kanban com drag and drop.
- Timer Pomodoro com configuracoes de foco e pausas.
- Toasts e feedback visual para as acoes principais.

## Integracao Com A API

- Base URL atual: `http://localhost:3001/api`
- O arquivo de integracao principal esta em `src/services/api.js`
- O usuario autenticado e lido do `localStorage` para enviar `userId` nas operacoes de task

## Observacoes

- A documentacao geral do monorepo esta em [../../README.md](../../README.md).
- O proxy do Vite aponta `/api` para `http://localhost:3001`, mas o frontend hoje usa a URL completa definida no servico.
