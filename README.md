# AUGCVS
# Web-Based Graduation Credential Verification System – Ambo University

This project is a MERN stack-based web application developed to digitize and streamline the process of verifying graduation credentials at Ambo University.

## 🔧 Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **UI Design**: Figma (Dark Theme, Responsive, Animated)

## 🎯 Key Features
- Secure login with role-based access (Admin, Registrar, External User)
- Graduate data management: add, edit, delete, search
- Credential verification request submission by graduates and organizations
- Registrar approval workflow
- Automated email notification of verification result
- Activity logging and user feedback messages

## 👥 System Roles
- **Admin**: Manages user accounts and graduate records  
- **Registrar**: Reviews and processes verification requests  
- **External User**: Submits verification requests and views results

## 🚀 Project Structure Guidance
- Use MVC architecture for backend: `models/`, `controllers/`, `routes/`
- Secure APIs with middleware (JWT authentication, role authorization)
- Frontend should have modular components based on user roles
- Store configuration in `.env` (MongoDB URI, JWT secret, etc.)

## 🔁 Development Approach
The project follows the **Iterative Software Development Model**, allowing regular feedback and incremental improvements through repeated cycles of analysis, design, implementation, testing, and evaluation.

## 📦 Deployment Considerations
- Deployable on local server or secure university cloud infrastructure
- Email service setup required for sending verification results

---

> Designed and built to support digital transformation in academic credential verification at Ambo University.
