import React from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const Pagination = ({ currentPage, totalPages, onPageChange, total, limit }) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i)
        }
      }
    }
    return pages
  }

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm dark:text-dark-muted light:text-light-muted">
        Showing {startItem} to {endItem} of {total} results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border dark:border-dark-border light:border-light-border dark:bg-dark-card light:bg-light-card dark:text-dark-text light:text-light-text hover:dark:bg-dark-surface hover:light:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronLeft size={20} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
              page === currentPage
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'dark:border-dark-border light:border-light-border dark:bg-dark-card light:bg-light-card dark:text-dark-text light:text-light-text hover:dark:bg-dark-surface hover:light:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border dark:border-dark-border light:border-light-border dark:bg-dark-card light:bg-light-card dark:text-dark-text light:text-light-text hover:dark:bg-dark-surface hover:light:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
