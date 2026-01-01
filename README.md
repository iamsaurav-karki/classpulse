# ClassPulse - Interactive Educational Platform

ClassPulse is a production-ready, scalable educational platform that connects students and teachers in a collaborative digital learning environment. Built with modern technologies and designed to handle thousands of concurrent users.

## 🚀 Features

### Core Features
- **Q&A System**: Students can ask questions, get answers from peers and teachers. Upload images and files to make questions clearer.
- **Notes & Resources**: Teachers can share PDFs, documents, and learning materials. Download and access resources anytime.
- **Peer Learning**: Students can answer each other's questions. Vote on best answers and build a collaborative community.
- **Support Tickets**: Raise support requests for academic or technical issues. Get help from teachers and admins.
- **Smart Search**: Find questions, notes, and resources quickly with powerful search and filtering system.
- **Real-time Updates**: Get notified instantly when someone answers your question or responds to your support ticket.
- **Dynamic Subjects**: Users can add custom subjects instead of being limited to hardcoded options.

### Role-Based Access Control
- **Students**: Can ask questions, answer questions, create support tickets, and browse resources
- **Teachers**: Can answer questions, upload notes, and respond to support tickets (after admin verification)
- **Admins**: Full system access including user management, teacher verification, content moderation, and analytics

## 🏗️ Architecture

### Technology Stack

#### Backend
- **Node.js** with **Express.js** - RESTful API server
- **TypeScript** - Type-safe development
- **PostgreSQL** - Primary database for persistent data
- **Redis** - Caching layer and distributed rate limiting
- **NATS** - Event-driven messaging and real-time notifications
- **JWT** - Secure authentication
- **Multer** - File upload handling

#### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **Date-fns** - Date formatting
- **React Markdown** - Markdown rendering

#### Infrastructure
- **Docker** & **Docker Compose** - Containerization and orchestration
- **Redis** - Caching and rate limiting
- **NATS** - Message broker for real-time events

### System Architecture

```
┌─────────────┐
│   Frontend  │ (Next.js - Port 3000)
│  (Next.js)  │
└──────┬──────┘
       │ HTTP/REST
       │
┌──────▼─────────────────────────────────────┐
│           Backend API (Express)            │
│              (Port 5000)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │ Questions│  │ Answers  │  │
│  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Notes   │  │ Support  │  │ Notify   │  │
│  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└──────┬──────────┬──────────┬───────────────┘
       │          │          │
       │          │          │
┌──────▼──┐  ┌────▼────┐  ┌──▼────┐
│PostgreSQL│  │ Redis  │  │ NATS  │
│ (Port    │  │(Port   │  │(Port  │
│  5432)   │  │ 6379)  │  │ 4222) │
└──────────┘  └────────┘  └───────┘
```

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Git (for cloning the repository)
- At least 4GB RAM available for Docker containers

## 🚀 Quick Start with Docker (Recommended)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd classpulse
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration values. **Required variables:**

```env
# JWT Configuration (REQUIRED - Generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Database (defaults work for Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/classpulse
DB_HOST=postgres
DB_PORT=5432
DB_NAME=classpulse
DB_USER=postgres
DB_PASSWORD=postgres

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# NATS Configuration
NATS_SERVERS=nats://nats:4222

# Cache TTL (in seconds)
CACHE_TTL_QUESTIONS=300
CACHE_TTL_ANSWERS=300
CACHE_TTL_USER=600
CACHE_TTL_NOTES=600

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend URLs
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### 3. Start All Services

```bash
docker-compose up -d --build
```

This will start:
- **PostgreSQL** database (port 5432)
- **Redis** cache (port 6379)
- **NATS** message broker (ports 4222, 8222, 6222)
- **Backend API** (port 5000)
- **Frontend** (port 3000)

### 4. Verify Services

Check if all services are running:

```bash
docker-compose ps
```

You should see all services with "Up" status.

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **NATS Monitoring**: http://localhost:8222

### 6. Create Admin Account

Admin accounts cannot be created through normal registration. Use one of these methods:

#### Method 1: Using SQL (Quickest)

```bash
# Connect to database
docker exec -it classpulse-postgres-1 psql -U postgres -d classpulse

# Run SQL
INSERT INTO users (email, password_hash, name, role, is_verified, is_active)
VALUES (
    'admin@classpulse.com',
    '$2a$10$NCu1bmueay0i9JlkI56e2uZUPcq8a5YfRx2LcfXQtcDhEwxYCiWZK',
    'System Admin',
    'admin',
    TRUE,
    TRUE
) 
ON CONFLICT (email) DO UPDATE
SET 
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    is_verified = TRUE,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;
```

**Default credentials:**
- Email: `admin@classpulse.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password after first login!

#### Method 2: Using Node.js Script

```bash
# Default admin
node scripts/create-admin.js

# Custom credentials
node scripts/create-admin.js your-email@example.com your-password "Your Name"
```

### 7. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f nats
```

## 🔧 Docker Services

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js application |
| Backend | 5000 | Express API server |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and rate limiting |
| NATS | 4222 | Message broker (client connections) |
| NATS | 8222 | NATS HTTP monitoring |
| NATS | 6222 | NATS cluster routing |

### Common Docker Commands

```bash
# Start services
docker-compose up -d          # Start in background
docker-compose up             # Start in foreground (see logs)

# Stop services
docker-compose stop           # Stop containers (keep data)
docker-compose down           # Stop and remove containers
docker-compose down -v        # Stop and remove containers + volumes (WARNING: deletes data!)

# Rebuild services
docker-compose build          # Rebuild all
docker-compose build backend  # Rebuild specific service
docker-compose up -d --build  # Rebuild and restart

# View logs
docker-compose logs -f        # Follow all logs
docker-compose logs backend   # Backend logs only

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d classpulse
```

## 🛠️ Development Mode

For development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

This will:
- Mount source code as volumes for live reloading
- Use development Dockerfiles
- Enable hot reload for both frontend and backend

## 📁 Project Structure

```
classpulse/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── middlewares/      # Express middlewares
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── questions/    # Q&A system
│   │   │   ├── answers/      # Answers
│   │   │   ├── notes/        # Notes & resources
│   │   │   ├── support/      # Support tickets
│   │   │   ├── subjects/     # Dynamic subjects
│   │   │   ├── admin/        # Admin features
│   │   │   └── notifications/ # Notifications
│   │   ├── services/         # Shared services
│   │   ├── utils/            # Utility functions
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand stores
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── database/
│   ├── schema.sql            # Database schema
│   └── migrations/           # Database migrations
├── scripts/
│   └── create-admin.js       # Admin account creation script
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
└── README.md                 # This file
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Redis-based distributed rate limiting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: express-validator for request validation
- **File Upload Security**: Type and size restrictions
- **SQL Injection Protection**: Parameterized queries
- **Role-Based Access Control**: Teacher verification required for certain operations

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile

### Questions
- `GET /api/questions` - List questions (with filters, pagination)
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create question (auth required)
- `PUT /api/questions/:id` - Update question (auth required)
- `DELETE /api/questions/:id` - Delete question (auth required)

### Answers
- `GET /api/answers/question/:questionId` - Get answers for a question
- `GET /api/answers/:id` - Get answer details
- `POST /api/answers` - Create answer (auth required, verified teacher)
- `POST /api/answers/:id/vote` - Vote on answer (auth required)
- `POST /api/answers/:id/accept` - Accept answer (auth required, question owner)
- `POST /api/answers/:id/pin` - Pin answer (auth required, question owner)

### Notes
- `GET /api/notes` - List notes (with filters, pagination)
- `GET /api/notes/:id` - Get note details
- `GET /api/notes/:id/download` - Download note file
- `POST /api/notes` - Create note (auth required, verified teacher)
- `PUT /api/notes/:id` - Update note (auth required, verified teacher)
- `DELETE /api/notes/:id` - Delete note (auth required, verified teacher)

### Support Tickets
- `GET /api/support` - List tickets (role-based filtering)
- `GET /api/support/:id` - Get ticket details
- `POST /api/support` - Create ticket (auth required)
- `PATCH /api/support/:id/status` - Update ticket status (role-based permissions)
- `POST /api/support/:id/response` - Add response (auth required)
- `POST /api/support/:id/assign` - Assign ticket (admin only)
- `POST /api/support/:id/reassign` - Reassign ticket (admin only)
- `POST /api/support/:id/reopen` - Reopen ticket (student/admin)
- `POST /api/support/:id/escalate` - Escalate ticket (admin only)

### Subjects
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/popular` - Get popular subjects
- `POST /api/subjects` - Create new subject (auth required)

### Admin
- `GET /api/admin/users` - List users (admin only)
- `GET /api/admin/teachers/pending` - List pending teachers (admin only)
- `POST /api/admin/teachers/:id/approve` - Approve teacher (admin only)
- `POST /api/admin/teachers/:id/reject` - Reject teacher (admin only)
- `GET /api/admin/analytics` - Get analytics (admin only)
- `POST /api/admin/questions/:id/lock` - Lock question (admin only)
- `POST /api/admin/questions/:id/unlock` - Unlock question (admin only)

### Notifications
- `GET /api/notifications` - Get notifications (auth required)
- `GET /api/notifications/unread` - Get unread count (auth required)
- `PATCH /api/notifications/:id/read` - Mark as read (auth required)
- `PATCH /api/notifications/read-all` - Mark all as read (auth required)

## 🚀 Production Deployment

### 1. Update Environment Variables

Create `.env` file with production values:

```env
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Build and Start

```bash
docker-compose build
docker-compose up -d
```

### 3. Set Up Reverse Proxy (nginx example)

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Enable HTTPS

Use Let's Encrypt with Certbot or your preferred SSL certificate provider.

## 🐛 Troubleshooting

### Services not starting

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild containers
docker-compose up -d --build
```

### Database connection issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Access database
docker-compose exec postgres psql -U postgres -d classpulse
```

### Redis connection issues

```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### NATS connection issues

```bash
# Check NATS is running
docker-compose ps nats

# Check NATS monitoring
curl http://localhost:8222/healthz
```

### Port already in use

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "5001:5000"  # Backend
  - "5433:5432"  # Database
```

## 💾 Backup and Restore

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres classpulse > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres -d classpulse < backup_20240101.sql
```

### Backup Uploads

```bash
docker cp classpulse-backend:/app/uploads ./backups/uploads-$(date +%Y%m%d)
```

## 📊 Monitoring

### Resource Usage

```bash
docker stats
```

### Service Health

```bash
# Backend health check
curl http://localhost:5000/health

# Check all containers
docker-compose ps
```

## 🔄 Database Migrations

The database schema is automatically initialized from `database/schema.sql` when the PostgreSQL container starts for the first time.

To run migrations manually:

```bash
docker-compose exec postgres psql -U postgres -d classpulse -f /docker-entrypoint-initdb.d/schema.sql
```

## 🎯 Role-Based Access Control

### Student Permissions
- View all questions and answers
- Create questions
- Answer questions
- Create support tickets
- View and reply to own tickets
- Close and reopen own tickets
- Browse notes and resources

### Teacher Permissions (After Admin Verification)
- All student permissions
- Answer questions with attachments
- Upload notes and resources
- View assigned academic support tickets
- Reply to assigned tickets
- Change ticket status (except closed)

### Admin Permissions
- All teacher permissions
- View all tickets
- Assign, reassign, and escalate tickets
- Override any ticket status
- Approve/reject teacher accounts
- Manage users (suspend, activate, change roles)
- Moderate content (lock/unlock questions, delete content)
- View analytics and system configuration

## 📚 Additional Resources

- **Teacher Verification**: Teachers must be approved by an admin before they can answer questions or upload notes
- **Support Ticket RBAC**: Different permissions for students, teachers, and admins
- **Dynamic Subjects**: Users can add custom subjects instead of being limited to predefined options
- **File Uploads**: Supports images (JPG, PNG, WEBP) and documents (PDF, DOC, DOCX) up to 10MB per file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] WebSocket support for real-time updates
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] File storage with S3/Cloud Storage
- [ ] Analytics dashboard enhancements
- [ ] Mobile app (React Native)
- [ ] Video conferencing integration
- [ ] AI-powered question recommendations

---

**Built with ❤️ for education**
