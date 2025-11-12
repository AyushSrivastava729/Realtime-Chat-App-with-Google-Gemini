# 💬 RealTime MERN Chat Application with Google Gemini AI

A full-stack real-time chat application built using the **MERN stack** (MongoDB, Express, React, Node.js) integrated with **Google Gemini AI** for intelligent chat responses.  
Users can send, receive, and view messages in real time with Socket.IO — along with Gemini-powered AI assistance inside the chat.

---

## 🚀 Features

- 🔐 **User Authentication** – Secure login/signup with JWT and bcrypt  
- 💬 **Real-Time Chat** – Powered by Socket.IO  
- 🤖 **Google Gemini Integration** – AI chat assistant built into the app  
- 📂 **MongoDB Database** – Stores users, chats, and messages  
- ⚙️ **Express Backend API** – Clean RESTful routes with validation  
- 🎨 **Responsive React UI** – Built using Vite + Tailwind CSS  
- ⚡ **Code/Markdown Highlighting** – Syntax highlighting with `highlight.js`  
- 🌐 **Deployed on Render** – Backend & frontend both hosted on Render  

---

## 🏗️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Socket.IO Client
- Markdown-to-JSX
- Highlight.js

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Google Gemini API (`@google/generative-ai`)
- JWT Authentication
- bcrypt / bcryptjs
- dotenv, cors, morgan

---

## 🧩 Folder Structure

Realtime-MERN-Gemini-ChatApp/
│
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   │
│   ├── /controllers
│   │   ├── ai.controller.js
│   │   ├── project.controller.js
│   │   └── user.controller.js
│   │
│   ├── /db
│   │   └── db.js
│   │
│   ├── /middlewares
│   │   └── auth.middleware.js
│   │
│   ├── /models
│   │   ├── project.model.js
│   │   └── user.model.js
│   │
│   ├── /routes
│   │   ├── ai.routes.js
│   │   ├── project.routes.js
│   │   └── user.routes.js
│   │
│   └── /services
│       ├── ai.service.js
│       ├── project.service.js
│       ├── redis.service.js
│       └── user.service.js
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── .env
│   ├── eslint.config.js
│   │
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       │
│       ├── /assets/
│       │   └── react.svg
│       │
│       ├── /auth/
│       │   └── UserAuth.jsx
│       │
│       ├── /config/
│       │   ├── axios.js
│       │   ├── socket.js
│       │   └── webContainer.js
│       │
│       ├── /context/
│       │   └── user.context.jsx
│       │
│       ├── /routes/
│       │   └── AppRoutes.jsx
│       │
│       ├── /screens/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Project.jsx
│       │   └── Register.jsx
│
├── README.md
└── .gitignore
