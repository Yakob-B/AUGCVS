import React from 'react'

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    default: 'h-12 w-12 border-t-2 border-b-2',
    large: 'h-16 w-16 border-t-3 border-b-3',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className={`${sizeClasses[size]} border-purple-500 rounded-full animate-spin ${className}`}
        />
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse-purple" />
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner

