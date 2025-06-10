# temuCerita Backend API

RESTful API backend untuk aplikasi temuCerita menggunakan Hapi.js framework dengan PostgreSQL database dan JWT authentication.

## 🚀 Fitur Utama

- **RESTful API**: API yang mengikuti standar REST
- **JWT Authentication**: Sistem autentikasi yang aman menggunakan JSON Web Token
- **PostgreSQL Database**: Database relasional dengan Sequelize ORM
- **File Upload**: Handling file upload dengan Formidable
- **Input Validation**: Validasi input menggunakan Joi
- **Password Hashing**: Enkripsi password dengan bcrypt
- **URL Slugification**: Automatic URL slug generation
- **Cloud Database**: Support untuk Neon PostgreSQL cloud database

## 🛠️ Tech Stack

### Backend Framework
- **Hapi.js 21.4** - Node.js web framework
- **Node.js** - JavaScript runtime

### Database
- **PostgreSQL** - Relational database
- **Sequelize 6.37** - ORM untuk PostgreSQL
- **Sequelize CLI** - Command line interface untuk Sequelize

### Authentication & Security
- **JWT (@hapi/jwt)** - JSON Web Token untuk Hapi.js
- **bcrypt** - Password hashing
- **Joi** - Schema validation

### Utilities
- **dotenv** - Environment variables management
- **formidable** - File upload handling
- **slugify** - URL slug generation
- **nodemon** - Development server auto-reload

## 📦 Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd temu-cerita-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Buat file `.env` di root project:
   ```env
   # Database Configuration
   DB_USER=xxx
   DB_PASSWORD=xxx
   DB_NAME=xxx
   DB_HOST=xxxxx
   DB_PORT=xxx
   
   # Alternative Local Database (uncomment if needed)
   # DB_USER=postgres
   # DB_PASSWORD=admin123
   # DB_NAME=db_artikel
   # DB_HOST=localhost
   # DB_PORT=5432
   
   # Server Configuration
   PORT=3001
   HOST=0.0.0.0
   
   # JWT Secret
   JWT_SECRET=kunci_rahasia_super_aman_untuk_jwt_anda_disini
   ```

4. **Database setup**
   ```bash
   # Create database
   npm run db:create
   
   # Run migrations
   npm run db:migrate
   ```

## 🚀 Getting Started

### Development
```bash
npm run start-dev
```
Server akan berjalan di `http://localhost:3001` dengan auto-reload menggunakan nodemon.

### Production
```bash
node server.js
```

## 📁 Struktur Project

```
temu-cerita-be/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route handlers
├── middleware/              # Custom middleware
├── migrations/              # Database migrations
├── models/                  # Sequelize models
├── routes/                  # API routes
├── utils/                   # Utility functions
├── uploads/                 # File upload directory
├── server.js               # Main server file
├── package.json
└── .env                    # Environment variables
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start-dev` | Start development server dengan nodemon |
| `npm run db:create` | Create database |
| `npm run db:migrate` | Run database migrations |
| `npm test` | Run tests (belum dikonfigurasi) |

## 🗃️ Database Configuration

### Neon PostgreSQL (Production)
```env
DB_HOST=ep-tight-mountain-a1oxjc3h-pooler.ap-southeast-1.aws.neon.tech
DB_PORT=5432
DB_NAME=db_artikel
DB_USER=neondb_owner
DB_PASSWORD=npg_4XAZOBI8qjWk
```

### Local PostgreSQL (Development)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=db_artikel
DB_USER=postgres
DB_PASSWORD=admin123
```

## 🔐 Authentication

API menggunakan JWT (JSON Web Token) untuk autentikasi:

### Login Flow
1. User mengirim credentials (username/email + password)
2. Server memverifikasi credentials
3. Jika valid, server mengembalikan JWT token
4. Client menyimpan token dan mengirimkannya di header untuk request selanjutnya

### Header Format
```
Authorization: Bearer <jwt_token>
```

## 🛡️ Security Features

- **Password Hashing**: Menggunakan bcrypt untuk hash password
- **JWT Authentication**: Token-based authentication
- **Input Validation**: Joi schema validation untuk semua input
- **Environment Variables**: Sensitive data disimpan di environment variables
- **CORS**: Cross-origin resource sharing configuration

## 📝 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Refresh token
```

### Articles/Stories
```
GET    /api/articles        # Get all articles
GET    /api/articles/:id    # Get article by ID
POST   /api/articles        # Create new article
PUT    /api/articles/:id    # Update article
DELETE /api/articles/:id    # Delete article
```

### Users
```
GET    /api/users/profile   # Get user profile
PUT    /api/users/profile   # Update user profile
POST   /api/users/upload    # Upload user avatar
```

## 🔍 Validation Schema

Menggunakan Joi untuk validasi input:

```javascript
// Contoh validasi artikel
const articleSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  content: Joi.string().min(10).required(),
  category: Joi.string().valid('tech', 'lifestyle', 'travel').required(),
  tags: Joi.array().items(Joi.string()).optional()
});
```

## 📤 File Upload

Menggunakan Formidable untuk handling file upload:

- **Supported formats**: JPG, PNG, GIF, PDF
- **Max file size**: 10MB
- **Upload directory**: `./uploads/`
- **Automatic filename**: UUID + original extension

## 🌐 CORS Configuration

API dikonfigurasi untuk menerima request dari:
- Frontend development: `http://localhost:3000`
- Frontend production: `https://your-domain.com`

## 🔧 Database Migrations

### Create Migration
```bash
npx sequelize-cli migration:generate --name create-articles
```

### Run Migrations
```bash
npm run db:migrate
```

### Rollback Migration
```bash
npx sequelize-cli db:migrate:undo
```

## 📊 Logging

Server menggunakan Hapi.js built-in logging:
- **Request logging**: Semua HTTP requests
- **Error logging**: Application errors
- **Database logging**: Sequelize queries (development only)

## 🚀 Deployment

### Environment Setup
1. Setup PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Start server

### Recommended Deployment Platforms
- **Railway**: Easy deployment dengan PostgreSQL
- **Heroku**: Cloud platform dengan PostgreSQL add-on
- **DigitalOcean**: VPS dengan managed PostgreSQL
- **AWS**: EC2 + RDS PostgreSQL

## 🔄 Development Workflow

1. **Setup local environment**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Database setup**
   ```bash
   npm run db:create
   npm run db:migrate
   ```

3. **Start development server**
   ```bash
   npm run start-dev
   ```

4. **Make changes and test**
   - Server auto-reloads dengan nodemon
   - Test API endpoints dengan Postman/Insomnia

## 📈 Performance Optimization

- **Connection Pooling**: Sequelize connection pool
- **Query Optimization**: Efficient database queries
- **Caching**: Response caching untuk data statis
- **Compression**: Response compression untuk production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Periksa environment variables
   - Pastikan PostgreSQL service berjalan
   - Check network connectivity untuk cloud database

2. **JWT Token Error**
   - Periksa JWT_SECRET di environment
   - Pastikan token format benar di header

3. **File Upload Error**
   - Periksa permissions folder `uploads/`
   - Check file size limits
   - Validate file types

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

Untuk bantuan dan pertanyaan:
1. Check existing issues di GitHub
2. Create new issue dengan detail lengkap
3. Hubungi tim development

---

**temuCerita Backend API** - Powering the story sharing platform! 🚀📚