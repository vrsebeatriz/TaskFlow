# 🚀 TaskFlow Pro

O **TaskFlow** é um ecossistema de produtividade moderno projetado para desenvolvedores e entusiastas de organização. Esta versão "Pro" foca em **segurança de nível industrial**, **performance fluida** e uma **interface futurista**.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-cyan?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)

---

## ✨ O que há de novo?

### 🛡️ Segurança Reforçada

* **Autenticação JWT (JSON Web Tokens):** Sessões seguras e persistentes que protegem suas rotas.
* **Criptografia Bcrypt:** Senhas nunca são armazenadas em texto puro; utilizamos hashing de alta complexidade.
* **Middlewares de Proteção:** Rotas de tarefas isoladas por usuário (você só vê o que é seu).

### 🎨 Interface Moderna (Glassmorphism)

* **Design Translúcido:** Efeito de vidro com desfoque de fundo (*backdrop-blur*) inspirado em sistemas operacionais modernos.
* **Micro-interações:** Animações fluidas de layout e transições de cards utilizando **Framer Motion**.
* **Dark Mode Nativo:** Otimizado para longas horas de foco.

### ⚙️ Funcionalidades Core

* **Kanban Board:** Organize tarefas visualmente com arrastar e soltar.
* **Dashboard de Estatísticas:** Visualize seu progresso em tempo real.
* **Pomodoro Timer:** Técnica de foco integrada para máxima produtividade.

---

## 🛠️ Stack Tecnológica

| Frontend | Backend | Utilitários |
| :--- | :--- | :--- |
| React + TypeScript | Node.js (Express) | Framer Motion |
| Tailwind CSS | LowDB (JSON Persistence) | Lucide React |
| Axios | JWT + Bcrypt | Vite |

---

## 🚀 Como Executar

### Pré-requisitos

* Node.js (v18 ou superior)
* NPM ou Yarn

### 1. Clonar e Instalar

```bash
git clone https://github.com/vrsebeatriz/taskflow.git
cd taskflow
npm install
```

---

### 2. Configurar e Iniciar a API (Backend)

```bash
cd packages/api
npm install
node server.js
```

---

### 3. Iniciar o Web App (Frontend)

```bash
# Abre um novo terminal
cd packages/web
npm install
npm run dev
```

O App estará disponível em http://localhost:5173.

---

## 🗺️ Roadmap de Evolução

- [x] Implementar Autenticação JWT e Hash de Passwords.
- [x] Modernizar UI com Glassmorphism e Framer Motion.
- [x] Implementar persistência de Drag and Drop no base de dados.
- [ ] Adicionar suporte a Dark/Light Mode dinâmico.
- [ ] Criar aplicação Mobile com React Native.

---

## 👩‍💻 Autora

Ana Beatriz Araújo - Software Developer  
GitHub: @vrsebeatriz

---
