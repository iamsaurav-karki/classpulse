# ClassPulse - Interactive Educational Platform

A production-ready educational platform connecting students and teachers with Q&A, notes sharing, and support tickets.

## ✨ Features

### Core Features
- **Q&A System**: Students ask questions, get answers from peers and verified teachers. Upload images and files.
- **Notes & Resources**: Teachers share PDFs, documents, and learning materials. Students can download and access resources.
- **Peer Learning**: Students answer each other's questions. Vote on best answers to build a collaborative community.
- **Support Tickets**: Raise support requests for academic or technical issues. Get help from teachers and admins.
- **Smart Search**: Find questions, notes, and resources with search and filtering.
- **Real-time Notifications**: Get notified when someone answers your question or responds to your support ticket.
- **Dynamic Subjects**: Users can add custom subjects instead of being limited to predefined options.

### Role-Based Access Control
- **Students**: Ask questions, answer questions, create support tickets, browse resources
- **Teachers**: Answer questions, upload notes, respond to support tickets (after admin verification)
- **Admins**: User management, teacher verification, content moderation, analytics, system configuration

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+ and Docker Compose 2.0+
- At least 4GB RAM

### 1. Clone Repository
```bash
git clone <repository-url>
cd classpulse
```

### 2. Configure Environment Variables

Create `.env` file in root directory:

```env
# ============================================
# Required Configuration
# ============================================
NODE_ENV=production
PORT=5000

# JWT (REQUIRED - Generate: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/classpulse
# OR use individual parameters:
DB_HOST=postgres
DB_PORT=5432
DB_NAME=classpulse
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# NATS
NATS_SERVERS=nats://nats:4222

# CORS (IMPORTANT for production!)
# Local: CORS_ORIGIN=http://localhost:3000
# Production: CORS_ORIGIN=https://yourdomain.com
CORS_ORIGIN=http://localhost:3000

# Frontend URLs (REQUIRED for production!)
# Local: 
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# Production:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Bootstrap (creates admin on first startup)
ADMIN_EMAIL=admin@classpulse.com
ADMIN_PASSWORD=your-secure-password-here
ADMIN_NAME=System Admin
ADMIN_ENABLED=true

# ============================================
# Optional Configuration
# ============================================
# File Uploads
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp
ALLOWED_DOC_TYPES=pdf,doc,docx,ppt,pptx

# Storage
STORAGE_TYPE=local

# Cache TTL (seconds)
CACHE_TTL_QUESTIONS=300
CACHE_TTL_ANSWERS=300
CACHE_TTL_USER=600
CACHE_TTL_NOTES=600
```

**Production Environment Variables:**

For production server with domain `yourdomain.com`:

```env
NODE_ENV=production
JWT_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=postgresql://user:password@db-host:5432/classpulse
REDIS_HOST=your-redis-host
REDIS_PASSWORD=strong-redis-password
NATS_SERVERS=nats://your-nats-host:4222
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong-admin-password
```

**Notes:**
- Docker: Use container names (`postgres`, `redis`, `nats`) for hosts
- Local: Use `localhost` for hosts
- Generate JWT secret: `openssl rand -base64 32`
- CORS must match your frontend domain exactly
- Admin is auto-created on first startup if `ADMIN_PASSWORD` is set

### 3. Start Services
```bash
docker-compose up -d --build
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health: http://localhost:5000/health

### 5. Admin Account

Admin is automatically created on first startup using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.

**Manual creation (alternative):**
```bash
docker-compose exec postgres psql -U postgres -d classpulse

# Run SQL (hash is for password 'admin123')
INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
    'admin@classpulse.com',
    '$2a$10$NCu1bmueay0i9JlkI56e2uZUPcq8a5YfRx2LcfXQtcDhEwxYCiWZK',
    'System Admin',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash, role = 'admin', 
    is_verified = TRUE, is_active = TRUE, updated_at = CURRENT_TIMESTAMP;
```

Generate password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(h => console.log(h));"
```

## 🏗️ Tech Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database for persistent data
- **Redis** - Caching layer and distributed rate limiting
- **NATS** - Event-driven messaging and real-time notifications
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **Next.js 14** (App Router) - React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Markdown** - Markdown rendering

### Infrastructure
- **Docker** & **Docker Compose** - Containerization and orchestration
- **PostgreSQL** - Relational database
- **Redis** - In-memory cache and rate limiting
- **NATS** - Message broker for real-time events

## 🔄 Working Flow

### Application Flow
```
┌─────────────┐
│   Frontend  │ (Next.js - Port 3000)
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST API
       │
┌──────▼─────────────────────────────────────┐
│           Backend API (Express)            │
│              (Port 5000)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │   Auth   │  │ Questions│  │ Answers  ││
│  │  Module  │  │  Module  │  │  Module  ││
│  └──────────┘  └──────────┘  └──────────┘│
│  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Notes   │  │ Support  │  │ Notify   ││
│  │  Module  │  │  Module  │  │  Module  ││
│  └──────────┘  └──────────┘  └──────────┘│
└──────┬──────────┬──────────┬───────────────┘
       │          │          │
       │          │          │
┌──────▼──┐  ┌────▼────┐  ┌──▼────┐
│PostgreSQL│  │ Redis  │  │ NATS  │
│ (Port    │  │(Port   │  │(Port  │
│  5432)   │  │ 6379)  │  │ 4222) │
└──────────┘  └────────┘  └───────┘
```

### User Flow
1. **Registration/Login**: Users register or login to get JWT token
2. **Role Assignment**: Users are assigned roles (student, teacher, admin)
3. **Teacher Verification**: Teachers must be verified by admin before they can answer questions or upload notes
4. **Content Creation**: Students ask questions, teachers upload notes
5. **Interaction**: Students answer questions, vote on answers, create support tickets
6. **Notifications**: Real-time notifications via NATS when events occur
7. **Admin Management**: Admins manage users, verify teachers, moderate content

### Data Flow
- **Authentication**: JWT tokens stored in frontend, validated on each request
- **Caching**: Frequently accessed data (questions, answers) cached in Redis
- **Real-time Events**: NATS publishes events (new answer, notification) to subscribers
- **File Storage**: Uploaded files stored locally (configurable for cloud storage)
- **Database**: PostgreSQL stores all persistent data (users, questions, answers, notes, tickets)

## 📝 Common Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U postgres -d classpulse

# Check services
docker-compose ps
```

## 🚀 Production Deployment

1. **Update `.env`** with production values (domain, secrets, passwords)
2. **Build and start:** `docker-compose build && docker-compose up -d`
3. **Set up reverse proxy** (nginx) for HTTPS
4. **Configure firewall** to allow ports 80, 443

## 🔐 Security

- JWT authentication with secure tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting with Redis
- Input validation
- SQL injection protection (parameterized queries)
- Role-based access control


## 🐛 Troubleshooting

**Services not starting:**
```bash
docker-compose logs
docker-compose restart
```

**Database connection:**
- Docker: Use container name `postgres` (not `localhost`)
- Local: Use `localhost`
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/db`

**CORS errors:**
- Ensure `CORS_ORIGIN` matches frontend domain exactly
- Include protocol (`https://`)
- For multiple domains: comma-separated

**Admin not created:**
- Check `ADMIN_ENABLED=true`
- Ensure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set
- Check logs: `docker-compose logs backend`

## 📄 License

MIT License
