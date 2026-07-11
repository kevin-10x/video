# AfroToon AI - African Cartoon Video Generator

An AI-powered platform for creating authentic African-themed cartoon videos and converting real videos to cartoons.

## 🎬 Features

### Video to Cartoon
- Transform any video into cartoon animation
- 15+ styles: Anime, Comic, Pixar, Disney, African Cartoon, Manga, Chibi, Ghibli, Cyberpunk, Fantasy, Watercolor, Oil Painting, Pencil Sketch, Claymation, Lego
- Automatic lip-sync with multilingual voice support
- Background replacement with African landscapes
- Up to 4K export

### African Cartoon Generator
- Create from text prompts
- 50+ authentic African characters (Maasai, Yoruba, Zulu, Modern Youth, Griot, Fulani)
- 20+ African backgrounds (Savanna, Village, Market, City, Rainforest, Coast, Desert, Mountains)
- Traditional clothing library (Shuka, Ankara, Dashiki, Kente, Boubou, Modern Afro)
- Accessories (Beaded jewelry, Headwraps, Drums, Kora, Shields)
- African music styles (Afrobeat, Highlife, Amapiano, Kwaito, Traditional Drums, Mbira)
- 20+ African languages support

## 🏗️ Architecture

```
adamae/
├── client/          # Next.js 14 Frontend
├── server/          # Express.js + TypeScript Backend
├── ai/              # FastAPI AI Service (Python)
├── docker/          # Docker Compose & Configs
├── database/        # SQL Init Scripts
└── docs/            # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (for AI models)
- 20GB+ disk space

### 1. Clone & Configure
```bash
git clone <repo-url>
cd adamae

# Configure server
cp server/.env.example server/.env
# Edit server/.env with your values

# Configure AI service
cp ai/.env.example ai/.env
```

### 2. Start with Docker
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### 3. Initialize Database
```bash
docker-compose -f docker/docker-compose.yml exec server npx prisma migrate dev
docker-compose -f docker/docker-compose.yml exec server npx prisma db seed
```

### 4. Access
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **AI Health**: http://localhost:8000/health
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## 💻 Local Development

### Backend
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### AI Service
```bash
cd ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🔧 Configuration

### Server (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| REDIS_URL | Redis connection string | redis://localhost:6379 |
| JWT_SECRET | JWT signing secret (32+ chars) | Required |
| MINIO_ENDPOINT | MinIO endpoint | localhost:9000 |
| AI_SERVICE_URL | AI service URL | http://localhost:8000 |
| GOOGLE_CLIENT_ID | Google OAuth client ID | Optional |
| SMTP_HOST | SMTP server for emails | smtp.mailtrap.io |

### AI Service (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DEVICE | Compute device (cpu/cuda/mps) | cpu |
| MAX_CONCURRENT_JOBS | Parallel job limit | 2 |
| ANIMEGAN_MODEL | Cartoon style model | animegan2 |

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register     # Register
POST   /api/auth/login        # Login
POST   /api/auth/refresh      # Refresh token
POST   /api/auth/logout       # Logout
GET    /api/auth/me           # Current user
PATCH  /api/auth/me           # Update profile
```

### Projects
```
GET    /api/projects          # List projects
POST   /api/projects          # Create project
GET    /api/projects/:id      # Get project
PATCH  /api/projects/:id      # Update project
DELETE /api/projects/:id      # Delete project
POST   /api/projects/:id/start # Start processing
```

### Jobs
```
GET    /api/jobs              # List jobs
GET    /api/jobs/:id          # Get job status
POST   /api/jobs/:id/cancel   # Cancel job
POST   /api/jobs/:id/retry    # Retry failed job
```

### Assets
```
GET    /api/assets                    # List assets
POST   /api/assets                    # Register asset
POST   /api/assets/upload-url         # Get presigned upload URL
GET    /api/assets/african/library    # African asset library
```

### Exports
```
GET    /api/exports         # List exports
POST   /api/exports         # Create export
GET    /api/exports/:id     # Get export
GET    /api/exports/:id/download # Download export
```

## 🎨 African Styles

| Style | Region | Description |
|-------|--------|-------------|
| AFRICAN_CARTOON | Pan-African | Bold outlines, vibrant colors, cultural patterns |
| MAASAI_STYLE | East Africa | Red/blue palette, geometric beadwork |
| YORUBA_STYLE | West Africa | Earth tones, adire patterns, royal motifs |
| ZULU_STYLE | Southern Africa | Black/white contrast, shield patterns |
| KENTE_STYLE | Ghana | Woven geometric patterns, gold/green/red |
| ANKARA_STYLE | Nigeria | Bold wax prints, vibrant florals |

## 🌍 Supported Languages

**African Languages:**
- Swahili (Kiswahili)
- Yoruba
- Igbo
- Hausa
- Zulu
- Xhosa
- Amharic
- Somali
- Kinyarwanda
- Luganda
- Shona
- Wolof
- Bambara
- Fula
- Twi
- Ewe
- Ga
- Dagaare
- Dagbani
- Krio

**International:**
- English, French, Arabic, Portuguese, Spanish

## 🏗️ Deployment

### Production Docker
```bash
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

### Environment Variables (Production)
- Use strong JWT_SECRET (64+ chars)
- Enable MINIO_USE_SSL=true
- Set up proper SMTP credentials
- Configure OAuth credentials
- Use managed PostgreSQL/Redis
- Set up CDN for MinIO public URL

### Scaling AI Workers
```bash
# Run multiple AI workers
docker-compose up -d --scale ai=3
```

## 📁 Project Structure Details

### Client (Next.js)
```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   └── ...                # Feature components
├── lib/                   # Utilities
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
└── types/                 # TypeScript types
```

### Server (Express)
```
src/
├── config/               # Configuration
├── lib/                  # Prisma, Redis, MinIO clients
├── middleware/           # Auth, validation, errors
├── routes/               # API routes
├── services/             # Business logic
└── index.ts              # Entry point
```

### AI Service (FastAPI)
```
├── main.py               # FastAPI app
├── models/               # Model loaders
├── pipelines/            # Processing pipelines
├── inference/            # Model inference
└── utils/                # Helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- AnimeGANv2 for cartoon style transfer
- Coqui TTS for multilingual text-to-speech
- Real-ESRGAN for upscaling
- African cultural consultants for authenticity
- Open source community

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@adamae.com

---

Built with ❤️ for African storytelling