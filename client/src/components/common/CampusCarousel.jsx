import React, { useState, useEffect } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const CampusCarousel = ({ images, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const images_list = images || [
    {
      src: '/images/campus-entrance.jpg',
      alt: 'Ambo University Main Entrance with Equestrian Statue',
      title: 'Grand Entrance',
      description: 'The iconic main entrance featuring our historical equestrian statue'
    },
    {
      src: '/images/campus-aerial.jpg',
      alt: 'Aerial View of Ambo University Campus',
      title: 'Campus Overview',
      description: 'A panoramic view of our sprawling campus set against beautiful mountains'
    },
    {
      src: '/images/campus-archway.jpg',
      alt: 'Colorful Archway Entrance to Ambo University',
      title: 'Welcome Archway',
      description: 'The vibrant archway welcoming students and visitors to our campus'
    },
    {
      src: '/images/campus-buildings.jpg',
      alt: 'Modern Buildings of Ambo University',
      title: 'Modern Facilities',
      description: 'State-of-the-art academic and administrative buildings'
    }
  ]

  useEffect(() => {
    if (!autoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images_list.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, images_list.length])

  const nextSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images_list.length)
      setIsTransitioning(false)
    }, 300)
  }

  const prevSlide = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images_list.length) % images_list.length)
      setIsTransitioning(false)
    }, 300)
  }

  const goToSlide = (index) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      {/* Main Image Container */}
      <div className="relative w-full h-full">
        {images_list.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Image Info */}
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-2xl font-heading font-bold text-white mb-2 animate-slide-up">
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-white/80 text-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {image.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Previous image"
      >
        <MdChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Next image"
      >
        <MdChevronRight size={28} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {images_list.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 bg-purple-500'
                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Loading State */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/20 z-40 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export default CampusCarousel

