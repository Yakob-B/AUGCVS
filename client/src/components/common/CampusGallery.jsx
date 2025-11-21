import React, { useState } from 'react'
import { MdClose, MdZoomIn, MdChevronLeft, MdChevronRight } from 'react-icons/md'

const CampusGallery = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(null)

  const images_list = images || [
    {
      src: '/images/campus-entrance.jpg',
      alt: 'Ambo University Main Entrance with Equestrian Statue',
      title: 'Main Entrance',
      category: 'Campus Landmarks'
    },
    {
      src: '/images/campus-aerial.jpg',
      alt: 'Aerial View of Ambo University Campus',
      title: 'Campus Overview',
      category: 'Campus Overview'
    },
    {
      src: '/images/campus-archway.jpg',
      alt: 'Colorful Archway Entrance to Ambo University',
      title: 'Welcome Archway',
      category: 'Campus Landmarks'
    },
    {
      src: '/images/campus-buildings.jpg',
      alt: 'Modern Buildings of Ambo University',
      title: 'Academic Buildings',
      category: 'Facilities'
    }
  ]

  const openModal = (index) => {
    setSelectedIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedIndex(null)
    document.body.style.overflow = 'auto'
  }

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images_list.length)
  }

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images_list.length) % images_list.length)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images_list.map((image, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl border dark:border-dark-border light:border-light-border dark:bg-dark-card light:bg-light-card hover:border-primary-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
            onClick={() => openModal(index)}
          >
            {/* Image Container */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/images/logo.png'
                  e.currentTarget.classList.add('object-contain', 'p-6')
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-3 bg-purple-600/90 rounded-full backdrop-blur-sm transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <MdZoomIn size={32} className="text-white" />
                </div>
              </div>

              {/* Category Badge */}
              {image.category && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-primary-600/80 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
                  {image.category}
                </div>
              )}
            </div>

            {/* Title */}
            {image.title && (
              <div className="p-4">
                <h3 className="dark:text-dark-text light:text-light-text font-semibold group-hover:text-primary-300 transition-colors">
                  {image.title}
                </h3>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Screen Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-50"
            aria-label="Close"
          >
            <MdClose size={24} />
          </button>

          <div
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 z-40"
              aria-label="Previous image"
            >
              <MdChevronLeft size={28} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110 z-40"
              aria-label="Next image"
            >
              <MdChevronRight size={28} />
            </button>

            {/* Image */}
            <img
              src={images_list[selectedIndex].src}
              alt={images_list[selectedIndex].alt}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg'
              }}
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent rounded-b-lg">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                {images_list[selectedIndex].title}
              </h3>
              <p className="text-white/80 text-sm">
                {images_list[selectedIndex].alt}
              </p>
              <p className="text-white/60 text-xs mt-2">
                {selectedIndex + 1} of {images_list.length}
              </p>
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') prevImage()
              if (e.key === 'ArrowRight') nextImage()
              if (e.key === 'Escape') closeModal()
            }}
            tabIndex={0}
            className="absolute inset-0"
          />
        </div>
      )}
    </>
  )
}

export default CampusGallery

