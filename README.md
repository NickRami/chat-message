# WhatsApp Clone - Real-Time Messaging System

This is a professional-grade real-time messaging application, inspired by WhatsApp Web. Built with modern web technologies, this project features robust JWT authentication, real-time bidirectional communication via WebSockets, and a scalable, layered backend architecture.

## 🚀 Features

- **Real-Time Messaging:** Instant message delivery using Socket.io.
- **Robust Authentication:** Secure JWT-based auth system with short-lived access tokens and sliding-window refresh tokens.
- **WhatsApp Web UI:** A clean, responsive interface matching professional chat applications.
- **Message Statuses:** Sent, delivered, and read status indicators.
- **Typing Indicators:** Real-time feedback when other users are typing.
- **Security First:** Passwords and tokens hashed with bcrypt, strict CORS, and environment-based configuration.
- **Scalable Architecture:** Backend built with a strict Controller-Service-Repository pattern.

## 🛠️ Technology Stack

**Frontend (Client)**
- **Framework:** React.js (TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Real-time:** Socket.io-client
- **Routing:** React Router DOM

**Backend (Server)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Real-time:** Socket.io
- **Auth:** JSON Web Tokens (JWT) + Bcrypt

## 🏗️ Architecture

The backend follows a layered architecture to ensure separation of concerns and maintainability:
- **Routes:** Define API endpoints and apply middleware.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain the core business logic (auth, messaging).
- **Repositories:** Manage data access and database operations.

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URL)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/NickRami/chat-message.git
cd chat-message
```

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Update `.env` with your database and JWT secrets.

### 3. Setup Frontend
```bash
cd ../client
npm install
```

### 4. Run the application
**Run Backend:**
```bash
cd server
npm run dev
```

**Run Frontend:**
```bash
cd client
npm run dev
```

## 🔐 Environment Variables

Refer to `server/.env.example` for required environment variables. Never commit the actual `.env` file.

## 🚢 Deployment

- **Frontend:** Ready to be deployed on **Vercel** or **Netlify**.
- **Backend:** Ready to be deployed on **Railway**, **Render**, or **Fly.io** (Ensure environment variables are configured).
- **Database:** Use **MongoDB Atlas** for managed cloud database hosting.

## 👨‍💻 Author

Built as a professional portfolio project focusing on real-time systems, security, and clean architecture.
