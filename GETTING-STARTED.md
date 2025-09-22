# Getting Started with OutdoorSpot

Welcome to OutdoorSpot! This guide will help you get the project up and running on your local machine.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Redis** (v6 or higher) - [Download here](https://redis.io/download)
- **Git** - [Download here](https://git-scm.com/)

### Option 1: Using Docker (Recommended)

The easiest way to get started is using Docker, which handles all the dependencies for you.

```bash
# Clone the repository
git clone https://github.com/yourusername/outdoor-spot.git
cd outdoor-spot

# Copy environment files
cp env.example .env

# Start all services with Docker
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Option 2: Local Development Setup

If you prefer to run everything locally without Docker:

```bash
# Clone the repository
git clone https://github.com/yourusername/outdoor-spot.git
cd outdoor-spot

docker-compose up -d

# Install dependencies and setup environment
npm run setup

# Start PostgreSQL and Redis services
# (Make sure they're running on your system)

# Start the development servers
npm run dev
```

## 🔧 Detailed Setup Instructions

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL=postgresql://outdoor_spot_user:outdoor_spot_password@localhost:5432/outdoor_spot

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# External APIs (get these from respective services)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
WEATHER_API_KEY=your_weather_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Database Setup

#### Using Docker (Recommended)
```bash
docker-compose up -d postgres redis
```

#### Manual Setup
```bash
# Create PostgreSQL database
createdb outdoor_spot

# Run database migrations
cd backend
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 3. Frontend Environment

Copy the frontend environment template:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

## 🔑 Required API Keys

You'll need to obtain API keys from these services:

### Google Maps API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API and Places API
4. Create credentials (API Key)
5. Restrict the key to your domain for security

### Weather API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api) or [WeatherAPI](https://www.weatherapi.com/)
2. Get your free API key
3. Add it to your environment variables

### Cloudinary (Image Upload)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your environment variables

### Email Service (Optional)
1. Sign up at [SendGrid](https://sendgrid.com/) or [Mailgun](https://www.mailgun.com/)
2. Get your API key
3. Add it to your environment variables

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run setup` | Complete setup (install deps, env, db) |
| `npm run dev` | Start development servers |
| `npm run build` | Build for production |
| `npm run test` | Run all tests |
| `npm run lint` | Run linter |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:reset` | Reset database |
| `npm run clean` | Clean build artifacts |

## 📁 Project Structure

```
outdoor-spot/
├── frontend/          # Next.js React application
├── backend/           # Express.js API server
├── shared/           # Shared types and utilities
├── docs/             # Documentation
├── scripts/          # Utility scripts
└── docker-compose.yml # Docker configuration
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill processes using ports 3000 or 3001
npx kill-port 3000 3001
```

**Database connection errors**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
```

**Redis connection errors**
```bash
# Make sure Redis is running
brew services start redis       # macOS
sudo service redis-server start # Linux
```

**Permission errors**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Getting Help

1. Check the [documentation](./docs/) folder
2. Look at existing [GitHub issues](https://github.com/yourusername/outdoor-spot/issues)
3. Create a new issue if you can't find a solution

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables
3. Configure build and start commands
4. Deploy automatically

### Database (PlanetScale/Supabase)

1. Create a new database instance
2. Run migrations in production
3. Update DATABASE_URL in your deployment platform

## 📚 Next Steps

1. **Explore the codebase**: Start with the README files in each folder
2. **Read the documentation**: Check out the `/docs` folder
3. **Run the application**: Follow the setup instructions above
4. **Make your first contribution**: Look for issues labeled "good first issue"
5. **Join the community**: Join our Discord server for discussions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style and standards
- How to submit pull requests
- How to report bugs
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Happy coding! 🏕️✨**
