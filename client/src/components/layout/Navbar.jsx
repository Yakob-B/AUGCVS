import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import Logo from '../common/Logo'
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
  MdPersonAdd,
  MdLightMode,
  MdDarkMode,
  MdInfo
} from 'react-icons/md'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
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
    <nav className="bg-gradient-to-r from-purple-900 via-purple-800 to-black border-b border-purple-700/30 sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="medium" animated={true} />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/')
                ? 'bg-purple-600 text-white'
                : 'text-white hover:bg-purple-600/20'
                }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/about')
                ? 'bg-purple-600 text-white'
                : 'text-white hover:bg-purple-600/20'
                }`}
            >
              About
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname.startsWith(getDashboardPath())
                    ? 'bg-purple-600 text-white'
                    : 'text-white hover:bg-purple-600/20'
                    }`}
                >
                  <MdDashboard className="inline mr-2" />
                  Dashboard
                </Link>

                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/graduates"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname.includes('/graduates')
                        ? 'bg-purple-600 text-white'
                        : 'text-white hover:bg-purple-600/20'
                        }`}
                    >
                      <MdSchool className="inline mr-2" />
                      Graduates
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname.includes('/users')
                        ? 'bg-purple-600 text-white'
                        : 'text-white hover:bg-purple-600/20'
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
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${location.pathname.includes('/verifications')
                      ? 'bg-purple-600 text-white'
                      : 'text-white hover:bg-purple-600/20'
                      }`}
                  >
                    <MdVerifiedUser className="inline mr-2" />
                    Verifications
                  </Link>
                )}

                <div className="ml-4 px-4 py-2 text-white/70">
                  {user.firstName} {user.lastName} ({user.role})
                </div>

                <button
                  onClick={toggleTheme}
                  className="ml-2 px-4 py-2 rounded-lg text-white hover:bg-purple-600/20 transition-all duration-200"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <MdLightMode className="inline" size={20} /> : <MdDarkMode className="inline" size={20} />}
                </button>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-lg text-white hover:bg-red-500/20 transition-all duration-200"
                >
                  <MdLogout className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-lg dark:text-yellow-400 light:text-yellow-600 hover:dark:bg-yellow-500/10 hover:light:bg-yellow-500/20 transition-all duration-200"
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
                </button>
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/login')
                    ? 'bg-purple-600 text-white'
                    : 'text-white hover:bg-purple-600/20'
                    }`}
                >
                  <MdLogin className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${isActive('/register')
                    ? 'bg-purple-600 text-white'
                    : 'text-white hover:bg-purple-600/20'
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
            className="md:hidden p-2 text-white hover:bg-purple-600/20 rounded-lg transition-all"
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
              className={`block px-4 py-2 rounded-lg ${isActive('/') ? 'bg-purple-600 text-white' : 'text-white hover:bg-purple-600/20'
                }`}
            >
              <MdHome className="inline mr-2" />
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg ${isActive('/about') ? 'bg-purple-600 text-white' : 'text-white hover:bg-purple-600/20'
                }`}
            >
              <MdInfo className="inline mr-2" />
              About
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                >
                  <MdDashboard className="inline mr-2" />
                  Dashboard
                </Link>
                {user.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/graduates"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                    >
                      <MdSchool className="inline mr-2" />
                      Graduates
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
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
                    className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                  >
                    <MdVerifiedUser className="inline mr-2" />
                    Verifications
                  </Link>
                )}
                <button
                  onClick={() => {
                    toggleTheme()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                >
                  {isDark ? <><MdLightMode className="inline mr-2" /> Light Mode</> : <><MdDarkMode className="inline mr-2" /> Dark Mode</>}
                </button>
                <div className="px-4 py-2 text-white/70 text-sm">
                  {user.firstName} {user.lastName} ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-red-500/20"
                >
                  <MdLogout className="inline mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    toggleTheme()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                >
                  {isDark ? <><MdLightMode className="inline mr-2" /> Light Mode</> : <><MdDarkMode className="inline mr-2" /> Dark Mode</>}
                </button>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
                >
                  <MdLogin className="inline mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-white hover:bg-purple-600/20"
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
