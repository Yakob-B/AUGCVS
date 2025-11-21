import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CampusCarousel from '../components/common/CampusCarousel'
import { 
  MdSchool, 
  MdPeople,
  MdSearch,
  MdAccountBalance,
  MdPerson
} from 'react-icons/md'

const Home = () => {
  const { isAuthenticated, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  // Sample statistics - in a real app, these would come from an API
  const stats = {
    departments: 13,
    schools: 5,
    students: 15000,
    faculty: 850
  }

  const statCards = [
    {
      title: 'Departments',
      value: stats.departments,
      icon: <MdAccountBalance className="text-3xl" />,
      accent: 'text-primary-400',
      highlight: true,
    },
    {
      title: 'Schools',
      value: stats.schools,
      icon: <MdSchool className="text-3xl" />,
      accent: 'text-sky-400',
    },
    {
      title: 'Students',
      value: stats.students.toLocaleString(),
      icon: <MdPeople className="text-3xl" />,
      accent: 'text-emerald-400',
    },
    {
      title: 'Faculty',
      value: stats.faculty,
      icon: <MdPerson className="text-3xl" />,
      accent: 'text-amber-400',
    },
  ]

  return (
    <div className="animate-fade-in space-y-10">
      {/* Hero Campus Carousel */}
      <div className="mb-12 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border dark:border-dark-border light:border-light-border bg-transparent animate-slide-down">
        <CampusCarousel autoPlay={true} interval={6000} />
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 dark:text-dark-muted light:text-light-muted" size={20} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
          />
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-heading font-bold dark:text-dark-text light:text-light-text mb-3">
          Hachalu Hundessa Campus Statistics
        </h1>
        <p className="max-w-2xl mx-auto text-sm md:text-base dark:text-dark-muted light:text-light-muted">
          At a glance view of departments, schools, students, and faculty at Hachalu Hundessa Campus.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`card-hover border-2 ${card.highlight ? 'border-primary-500/60' : 'border-transparent'} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-500/10 text-primary-400">
              {card.icon}
              </div>
              <span className="text-xs uppercase tracking-wide dark:text-dark-muted light:text-light-muted">
                {card.title}
              </span>
            </div>
            <div className={`text-3xl font-heading font-bold ${card.accent} mb-1`}>
              {card.value}
            </div>
            <div className="text-xs dark:text-dark-muted light:text-light-muted">
              Total {card.title.toLowerCase()} on campus
            </div>
          </div>
        ))}
      </div>

      {/* Departments Overview Section */}
      <div className="card mt-4">
        <div className="flex items-center mb-4">
          <MdAccountBalance className="dark:text-dark-text light:text-light-text text-2xl mr-3" />
          <h2 className="text-2xl font-heading font-bold dark:text-dark-text light:text-light-text">
            Departments Overview
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full dark:bg-dark-surface light:bg-light-surface rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(stats.departments / 20) * 100}%` }}
          />
        </div>
        
        {/* Current Count */}
        <div className="dark:text-dark-text light:text-light-text">
          Current count: <span className="text-blue-400 font-bold">{stats.departments}</span> departments
        </div>
      </div>
    </div>
  )
}

export default Home
