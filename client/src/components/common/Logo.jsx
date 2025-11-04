import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdSchool } from 'react-icons/md'

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  animated = true, 
  className = '',
  onClick,
  linkTo = '/'
}) => {
  const [logoError, setLogoError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const sizeClasses = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-16',
    xl: 'h-20',
    '2xl': 'h-24'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  }

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {/* Logo Image with Creative Effects */}
      <div className="relative">
        {!logoError ? (
          <>
            {/* Glow Effect Container */}
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow" />
            
            {/* Main Logo Image */}
            <img 
              src="/images/logo.png" 
              alt="Ambo University Logo" 
              className={`${sizeClasses[size]} w-auto object-contain transition-all duration-500 ${
                animated ? 'animate-float' : ''
              } ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} group-hover:scale-110 group-hover:rotate-3 transform-gpu filter drop-shadow-lg hover:drop-shadow-2xl`}
              onError={() => setLogoError(true)}
              onLoad={() => setImageLoaded(true)}
              style={{
                filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))',
              }}
            />
            
            {/* Animated Border Glow */}
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-purple-500/0 group-hover:border-purple-500/50 transition-all duration-500 blur-sm group-hover:blur-none`} />
          </>
        ) : (
          <div className={`${sizeClasses[size]} ${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${animated ? 'animate-float' : ''}`}>
            <MdSchool className="text-white text-2xl" />
          </div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`${textSizeClasses[size]} font-heading font-bold text-purple-300 group-hover:text-purple-200 transition-colors duration-300 ${logoError ? '' : 'hidden md:block'}`}>
          Ambo Portal
        </span>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg">
        <LogoContent />
      </button>
    )
  }

  return (
    <Link to={linkTo} className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg">
      <LogoContent />
    </Link>
  )
}

export default Logo

