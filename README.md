# AUGCVS - Ambo University Graduate Credential Verification System

A modern, full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) to digitize and streamline the process of verifying graduation credentials at Ambo University.

## 🎨 Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Role-Based Dashboards**: Customized dashboards for Admin, Registrar, and External Users
- **Graduate Management**: Comprehensive CRUD operations for graduate records
- **Verification Workflow**: Streamlined verification request and approval process
- **Real-Time Updates**: Socket.IO integration for instant notifications
- **File Upload**: Secure certificate file upload with validation
- **Audit Logging**: Complete activity tracking for security and compliance
- **Responsive Design**: Beautiful black-themed UI with Tailwind CSS
- **Performance Optimized**: MongoDB indexes and API pagination

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Socket.IO** - Real-time communication
- **Nodemailer** - Email notifications
- **Express Validator** - Input validation

## 📁 Project Structure

```
AUGCVS/
├── server/                 # Backend application
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/             # Utility functions
│   └── uploads/           # Uploaded files
├── client/                # Frontend application
│   ├── src/               # Source files
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── common/    # Shared components
│   │   │   ├── layout/    # Layout components
│   │   │   └── routing/  # Route components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   │   ├── dashboards/# Dashboard pages
│   │   │   └── contexts/  # Page contexts
│   │   └── services/      # API services
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   ├── vite.config.js     # Vite configuration
│   └── index.html         # HTML entry point
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AUGCVS
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb://127.0.0.1:27017/augcvs

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Email Configuration (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FROM_NAME=Ambo University
   FROM_EMAIL=your_email@gmail.com

   # Client URL (for CORS and Socket.IO)
   CLIENT_URL=http://localhost:3000
   ```

   Create a `.env` file in the `client` directory for frontend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   # On Windows, MongoDB usually runs as a service
   # On macOS/Linux:
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   # From the client directory
   cd client
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Register a new account or login with existing credentials

## 👥 User Roles

### Admin
- Full system access
- Manage users (create, update, delete)
- Manage graduates (create, update, delete, search)
- View all verification requests
- System statistics and overview

### Registrar
- Review and process verification requests
- Approve or reject verification requests
- View graduate records
- View verification statistics

### External User
- Submit verification requests
- View own verification requests
- View verification results
- Requires organization field during registration

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email/:token` - Verify email

### Graduates
- `GET /api/graduates` - Get all graduates (paginated)
- `GET /api/graduates/:id` - Get single graduate
- `POST /api/graduates` - Create graduate (admin/registrar)
- `PUT /api/graduates/:id` - Update graduate (admin/registrar)
- `DELETE /api/graduates/:id` - Delete graduate (admin)
- `GET /api/graduates/search?query=...` - Search graduates
- `GET /api/graduates/filters` - Get filter options

### Verifications
- `GET /api/verifications` - Get all verifications (admin/registrar, paginated)
- `GET /api/verifications/my-requests` - Get user's verifications (external)
- `GET /api/verifications/:id` - Get single verification
- `POST /api/verifications` - Create verification request (external)
- `PUT /api/verifications/:id/process` - Process verification (registrar)

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Add user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

## 🎨 UI Theme

The application uses a professional black-themed design with:
- **Primary Color**: Gold/Yellow (`#eab308`)
- **Background**: Dark (`#0a0a0a`)
- **Surface**: Dark gray (`#111111`)
- **Text**: Light gray (`#e5e5e5`)
- **Accents**: Blue, Green, Purple, Orange gradients

## 🚀 Deployment

### Frontend (Vercel)

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel`
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### Backend (Render/Heroku)

1. **Create a new web service on Render**
2. **Set build command**: `cd server && npm install`
3. **Set start command**: `cd server && npm start`
4. **Add environment variables** in Render dashboard:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `CLIENT_URL` (your Vercel frontend URL)
   - Email configuration variables

### MongoDB (MongoDB Atlas)

1. Create a cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in backend environment variables
4. Whitelist your deployment IPs

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (RBAC)
- Input validation with express-validator
- File upload validation (type and size)
- CORS configuration
- Secure HTTP headers
- Audit logging for all actions

## 📊 Performance Optimizations

- MongoDB indexes on frequently queried fields
- API pagination for large datasets
- Efficient database queries with populate
- Optimized React component rendering
- Code splitting with Vite
- Caching strategies

## 🧪 Development

### Backend Scripts
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
```

### Frontend Scripts (from client directory)
```bash
cd client
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 📝 Environment Variables Reference

### Backend (.env in server/)
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://127.0.0.1:27017/augcvs |
| JWT_SECRET | Secret for JWT tokens | - |
| JWT_EXPIRE | JWT expiration time | 30d |
| SMTP_HOST | SMTP server host | - |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_USER | SMTP username | - |
| SMTP_PASS | SMTP password | - |
| CLIENT_URL | Frontend URL for CORS | http://localhost:3000 |

### Frontend (.env in client/)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Developed for Ambo University

## 🙏 Acknowledgments

- Ambo University for the project requirements
- MERN stack community
- All open-source contributors

---

> Designed and built to support digital transformation in academic credential verification at Ambo University.