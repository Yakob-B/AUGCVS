import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MdSchool, 
  MdVerifiedUser, 
  MdSecurity, 
  MdSpeed, 
  MdPeople,
  MdDashboard,
  MdArrowForward
} from 'react-icons/md'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: <MdVerifiedUser className="text-4xl" />,
      title: 'Credential Verification',
      description: 'Secure and efficient verification of graduation certificates',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <MdSecurity className="text-4xl" />,
      title: 'Secure System',
      description: 'Role-based access control with JWT authentication',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <MdSpeed className="text-4xl" />,
      title: 'Fast Processing',
      description: 'Quick verification requests with real-time notifications',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <MdPeople className="text-4xl" />,
      title: 'User Management',
      description: 'Comprehensive user and graduate record management',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse-slow">
              <MdSchool className="text-white text-5xl" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4 animate-slide-down">
            Ambo University
          </h1>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-500 mb-6 animate-slide-up">
            Credential Verification System
          </h2>
          <p className="text-xl text-dark-muted mb-8 max-w-2xl mx-auto animate-fade-in">
            Digitize and streamline the process of verifying graduation credentials with our secure, 
            efficient, and user-friendly platform.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Sign In
                <MdArrowForward className="ml-2" />
              </Link>
              <Link
                to="/register"
                className="btn-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                Get Started
                <MdArrowForward className="ml-2" />
              </Link>
            </div>
          ) : (
            <div className="flex justify-center animate-scale-in">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'registrar' ? '/registrar' : '/external'}
                className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                <MdDashboard className="mr-2" />
                Go to Dashboard
                <MdArrowForward className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-heading font-bold text-center text-white mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 text-white transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-dark-surface">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="text-4xl font-heading font-bold text-primary-500 mb-2">100%</div>
              <div className="text-dark-muted">Secure</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-heading font-bold text-primary-500 mb-2">24/7</div>
              <div className="text-dark-muted">Available</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl font-heading font-bold text-primary-500 mb-2">Fast</div>
              <div className="text-dark-muted">Processing</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
