import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../common/Logo'
import {
  MdEmail,
  MdLocationOn,
  MdPhone,
  MdFacebook,
  MdArrowUpward
} from 'react-icons/md'
import { FaLinkedin, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  const { isAuthenticated } = useAuth()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fade-in animation
  useEffect(() => {
    const footer = document.querySelector('footer')
    footer.classList.add('opacity-0', 'translate-y-4')
    setTimeout(() => {
      footer.classList.remove('opacity-0', 'translate-y-4')
      footer.classList.add('opacity-100', 'translate-y-0', 'transition-all', 'duration-700', 'ease-out')
    }, 100)
  }, [])

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    ...(isAuthenticated
      ? []
      : [
          { name: 'Login', path: '/login' },
          { name: 'Register', path: '/register' }
        ])
  ]

  const resources = [
    { name: 'Documentation', path: '/about' },
    { name: 'Support', path: '/about' },
    { name: 'Privacy Policy', path: '/about' },
    { name: 'Terms of Service', path: '/about' }
  ]

  return (
    <footer className="relative mt-20 border-t border-gray-700/50 bg-gradient-to-b from-gray-900/50 to-black opacity-0 translate-y-4">
      {/* Decorative Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo size="medium" animated={false} />
            <p className="text-white/70 text-sm leading-relaxed">
              Ambo University Graduation Credential Verification System — secure, efficient, and reliable platform.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-white/70 hover:text-purple-400 hover:border-purple-500/50 transition-all duration-300 hover:scale-110"
              >
                <MdFacebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-white/70 hover:text-purple-400 hover:border-purple-500/50 transition-all duration-300 hover:scale-110"
              >
                <FaTwitter size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 bg-gray-800/50 border border-gray-700/50 rounded-lg flex items-center justify-center text-white/70 hover:text-purple-400 hover:border-purple-500/50 transition-all duration-300 hover:scale-110"
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-purple-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Resources</h3>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.path}>
                  <Link
                    to={resource.path}
                    className="text-white/70 hover:text-purple-400 transition-colors duration-200 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-purple-400 mr-0 group-hover:mr-2 transition-all duration-200" />
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-white/70">
                <MdLocationOn className="text-purple-400 mt-1 flex-shrink-0" size={20} />
                <span className="text-sm">
                  Ambo University, Hachalu Hundessa Campus, Ambo, Ethiopia
                </span>
              </li>
              <li className="flex items-center space-x-3 text-white/70">
                <MdEmail className="text-purple-400 flex-shrink-0" size={20} />
                <a
                  href="mailto:support@augcvs.edu.et"
                  className="hover:text-purple-400 transition-colors"
                >
                  support@augcvs.edu.et
                </a>
              </li>
              <li className="flex items-center space-x-3 text-white/70">
                <MdPhone className="text-purple-400 flex-shrink-0" size={20} />
                <a
                  href="tel:+251112345678"
                  className="hover:text-purple-400 transition-colors"
                >
                  +251 11 234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white/70 text-sm text-center md:text-left">
              <p>© {new Date().getFullYear()} Ambo University. All rights reserved.</p>
              <p className="mt-1">Graduation Credential Verification System</p>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/30"
              aria-label="Scroll to top"
            >
              <span className="text-sm font-medium">Back to Top</span>
              <MdArrowUpward size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Animated Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </footer>
  )
}

export default Footer;
