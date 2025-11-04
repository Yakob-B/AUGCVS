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
      color: 'text-blue-400',
      iconBg: 'text-purple-400',
      border: 'border-purple-500',
    },
    {
      title: 'Schools',
      value: stats.schools,
      icon: <MdSchool className="text-3xl" />,
      color: 'text-white',
      iconBg: 'text-purple-400',
      border: '',
    },
    {
      title: 'Students',
      value: stats.students.toLocaleString(),
      icon: <MdPeople className="text-3xl" />,
      color: 'text-blue-400',
      iconBg: 'text-purple-400',
      border: '',
    },
    {
      title: 'Faculty',
      value: stats.faculty,
      icon: <MdPerson className="text-3xl" />,
      color: 'text-blue-400',
      iconBg: 'text-purple-400',
      border: '',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Hero Campus Carousel */}
      <div className="mb-12 h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl border border-gray-700/50 animate-slide-down">
        <CampusCarousel autoPlay={true} interval={6000} />
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Heading */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
          Hachalu Hundessa Campus Statistics
        </h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gray-800/50 rounded-xl p-6 border-2 ${card.border} ${card.border ? 'border-purple-500' : 'border-transparent'} transition-all duration-300 hover:bg-gray-800/70`}
          >
            <div className={`${card.iconBg} mb-4`}>
              {card.icon}
            </div>
            <div className={`text-3xl font-heading font-bold ${card.color} mb-2`}>
              {card.value}
            </div>
            <div className="text-white text-sm font-medium">
              {card.title}
            </div>
          </div>
        ))}
      </div>

      {/* Departments Overview Section */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center mb-4">
          <MdAccountBalance className="text-white text-2xl mr-3" />
          <h2 className="text-2xl font-heading font-bold text-white">
            Departments Overview
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(stats.departments / 20) * 100}%` }}
          />
        </div>
        
        {/* Current Count */}
        <div className="text-white">
          Current count: <span className="text-blue-400 font-bold">{stats.departments}</span> departments
        </div>
      </div>
    </div>
  )
}

export default Home
