# Axovion.io - AI Automation Agency

A premium dark-luxury AI automation agency website with full public site + admin dashboard.

## Tech Stack

- **Frontend:** React 19 + Tailwind CSS + shadcn/ui + GSAP + Framer Motion
- **Backend:** FastAPI + MongoDB + AI integrations (Groq, Kimi, Resend, Vapi, Retell)
- **Database:** MongoDB (Atlas for production)

## Features

- **Public Site:** Premium dark-luxury design with fluid animations
- **AI Chatbot:** 24/7 AI assistant powered by Groq
- **AI Audit:** Automated business analysis with ROI reports
- **Admin Dashboard:** Manage audits, chats, bookings, tasks, analytics
- **Email Automation:** Resend integration for automated sequences
- **AI Calling:** Vapi + Retell integration for lead follow-up

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or Atlas)

### 1. Clone and Setup

```bash
git clone https://github.com/YOUR_USERNAME/axovion.git
cd axovion
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start server
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **API Docs:** http://localhost:8000/docs

## Deployment

### Recommended Stack
- **Frontend:** [Vercel](https://vercel.com) (Free)
- **Backend:** [Render](https://render.com) (Free)
- **Database:** [MongoDB Atlas](https://mongodb.com/atlas) (Free tier)
- **Domain:** [Cloudflare](https://cloudflare.com) (Free DNS + CDN)

### Step-by-Step Deployment Guide

See [deploy.md](deploy.md) for detailed deployment instructions.

### Quick Deploy

#### 1. Setup MongoDB Atlas
- Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
- Create database user
- Whitelist all IPs (0.0.0.0/0) or specific IPs
- Get connection string

#### 2. Deploy Backend to Render
- Connect GitHub repo to [Render](https://render.com)
- Use `render.yaml` configuration
- Add environment variables
- Deploy

#### 3. Deploy Frontend to Vercel
- Connect GitHub repo to [Vercel](https://vercel.com)
- Set root directory to `frontend`
- Add `REACT_APP_API_URL` environment variable (your Render URL + /api)
- Deploy

#### 4. Update CORS
- Update `CORS_ORIGINS` in Render environment variables with your Vercel URL

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend.onrender.com/api
REACT_APP_SITE_URL=https://your-frontend.vercel.app
```

### Backend (.env)
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/axovion
JWT_SECRET=your-secure-secret
ADMIN_EMAIL=admin@axovion.io
ADMIN_PASSWORD=secure-password
GROQ_API_KEY=your-groq-key
RESEND_API_KEY=your-resend-key
CORS_ORIGINS=https://your-frontend.vercel.app
```

## Admin Access

- **URL:** https://your-frontend.vercel.app/admin/login
- **Default Email:** admin@axovion.io
- **Default Password:** (set in ADMIN_PASSWORD env var)

## Project Structure

```
axovion/
├── frontend/          # React frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── build/        # Production build
├── backend/           # FastAPI backend
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   └── server.py     # Main app
├── mongodb/           # MongoDB binaries (local dev)
├── deploy.md          # Detailed deployment guide
└── README.md          # This file
```

## API Endpoints

### Public
- `POST /api/chat` - Send message to AI chatbot
- `POST /api/audit` - Submit AI audit
- `GET /api/audit/report/{id}` - Get audit report
- `POST /api/booking` - Create booking
- `POST /api/newsletter` - Newsletter signup

### Admin (requires auth)
- `POST /api/auth/login` - Admin login
- `GET /api/audits` - List all audits
- `GET /api/chats` - List all chats
- `GET /api/bookings` - List all bookings
- `GET /api/analytics/dashboard` - Dashboard analytics

See full API documentation at `/docs` when running backend locally.

## Security

- JWT authentication for admin routes
- Bcrypt password hashing
- CORS protection
- Input validation with Pydantic
- Rate limiting ready (add middleware)
- Environment variables for secrets

## Performance

- Code splitting enabled
- Gzip compression ready
- MongoDB indexing configured
- Async operations throughout
- CDN ready (Cloudflare/Vercel Edge)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use for your own projects!

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ by Axovion.io
