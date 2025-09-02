# Smart Student Hub - Login System

Simple login/logout system for students and staff.

## Project Structure

```
sih_2025/
├── client/          # React frontend
├── server/          # Node.js backend
├── package.json     # Root package manager
└── README.md
```

## Quick Start

1. **Install all dependencies:**
```bash
npm run install-all
```

2. **Start both client and server:**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

## Demo Accounts

**Student Account:**
- Email: student@example.com
- Password: password123

**Staff Account:**
- Email: staff@example.com
- Password: password123

## Individual Commands

**Backend only:**
```bash
cd server
npm install
npm run dev
```

**Frontend only:**
```bash
cd client
npm install
npm start
```