import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MdMenu, 
  MdClose, 
  MdHome, 
  MdDashboard, 
  MdPeople, 
  MdSchool, 
  MdVerifiedUser,
  MdLogout,
  MdLogin,
  MdPersonAdd
} from 'react-icons/md'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'registrar':
        return '/registrar'
      case 'external':
        return '/external'
      default:
        return '/login'
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark-surface border-b border-dark-border sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <MdSchool className="text-white text-xl" />
            </div>
            <span className="text-xl font-heading font-bold text-white">
              AU<span className="text-primary-500">GCVS</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive('/')
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-text hover:bg-dark-card'
              }`}
            >
              <MdHome className="inline mr-2" />
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname.startsWith(getDashboardPath())
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-text hover:bg-dark-card'
                  }`}
                >
                  <MdDashboard className="inline mr-2" />
                  Dashboard
                </Link>

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/graduates"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname.includes('/graduates')
                          ? 'bg-primary-500 text-white'
                          : 'text-dark-text hover:bg-dark-card'
                      }`}
                    >
                      <MdSchool className="inline mr-2" />
                      Graduates
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        location.pathname.includes('/users')
                          ? 'bg-primary-500 text-white'
                          : 'text-dark-text hover:bg-dark-card'
                      }`}
                    >
                      <MdPeople className="inline mr-2" />
                      Users
                    </Link>
                  </>
                )}

                {(user.role === 'admin' || user.role === 'registrar') && (
                  <Link
                    to={`/${user.role === 'admin' ? 'admin' : 'registrar'}/verifications`}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname.includes('/verifications')
                        ? 'bg-primary-500 text-white'
                        : 'text-dark-text hover:bg-dark-card'
                    }`}
                  >
                    <MdVerifiedUser className="inline mr-2" />
                    Verifications
                  </Link>
                )}

                <div className="ml-4 px-4 py-2 text-dark-muted">
                  {user.firstName} {user.lastName} ({user.role})
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  <MdLogout className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/login')
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-text hover:bg-dark-card'
                  }`}
                >
                  <MdLogin className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/register')
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-text hover:bg-dark-card'
                  }`}
                >
                  <MdPersonAdd className="inline mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-dark-text hover:bg-dark-card rounded-lg transition-all"
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-slide-down">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg ${
                isActive('/') ? 'bg-primary-500 text-white' : 'text-dark-text hover:bg-dark-card'
              }`}
            >
              <MdHome className="inline mr-2" />
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                >
                  <MdDashboard className="inline mr-2" />
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/graduates"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                    >
                      <MdSchool className="inline mr-2" />
                      Graduates
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                    >
                      <MdPeople className="inline mr-2" />
                      Users
                    </Link>
                  </>
                )}
                {(user.role === 'admin' || user.role === 'registrar') && (
                  <Link
                    to={`/${user.role === 'admin' ? 'admin' : 'registrar'}/verifications`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                  >
                    <MdVerifiedUser className="inline mr-2" />
                    Verifications
                  </Link>
                )}
                <div className="px-4 py-2 text-dark-muted text-sm">
                  {user.firstName} {user.lastName} ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
                >
                  <MdLogout className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                >
                  <MdLogin className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-dark-text hover:bg-dark-card"
                >
                  <MdPersonAdd className="inline mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
