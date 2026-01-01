import React, { useEffect, useRef } from 'react'
import CampusGallery from '../components/common/CampusGallery'
import {
  MdSchool,
  MdSecurity,
  MdSpeed,
  MdVerifiedUser,
  MdGroup,
  MdCloudDone,
  MdDescription,
  MdAccessTime,
  MdPhotoLibrary,
  MdArrowForward
} from 'react-icons/md'
import { FaUniversity, FaShieldAlt, FaChartLine, FaServer, FaCode, FaPaintBrush, FaLock } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const About = () => {
  // Parallax effect for hero
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        const background = heroRef.current.querySelector('.parallax-bg')
        if (background) {
          background.style.transform = `translateY(${scrolled * 0.5}px)`
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )
    const elements = document.querySelectorAll('.scroll-animate')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: <MdVerifiedUser className="text-4xl" />,
      title: 'Credential Verification',
      description: 'Verify graduate credentials instantly with our secure verification system. Ensure authenticity and prevent fraud.',
      delay: 'delay-[100ms]'
    },
    {
      icon: <MdSecurity className="text-4xl" />,
      title: 'Secure & Encrypted',
      description: 'All data is encrypted and stored securely. We follow industry-standard security practices to protect sensitive information.',
      delay: 'delay-[200ms]'
    },
    {
      icon: <MdSpeed className="text-4xl" />,
      title: 'Fast & Efficient',
      description: 'Get verification results in real-time. Our system processes requests quickly without compromising accuracy.',
      delay: 'delay-[300ms]'
    },
    {
      icon: <MdGroup className="text-4xl" />,
      title: 'Role-Based Access',
      description: 'Different access levels for Admins, Registrars, and External Users ensure proper authorization and security.',
      delay: 'delay-[400ms]'
    },
    {
      icon: <MdCloudDone className="text-4xl" />,
      title: 'Cloud-Based',
      description: 'Access the system from anywhere, anytime. Cloud infrastructure ensures reliability and scalability.',
      delay: 'delay-[500ms]'
    },
    {
      icon: <MdAccessTime className="text-4xl" />,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about verification status changes. Stay updated with real-time Socket.IO integration.',
      delay: 'delay-[600ms]'
    },
  ]

  const stats = [
    { label: 'Verified Credentials', value: '10k+', icon: <MdVerifiedUser />, color: 'text-green-400' },
    { label: 'Active Users', value: '500+', icon: <MdGroup />, color: 'text-blue-400' },
    { label: 'Requests Processed', value: '50k+', icon: <MdDescription />, color: 'text-purple-400' },
    { label: 'System Uptime', value: '99.9%', icon: <FaChartLine />, color: 'text-yellow-400' },
  ]

  return (
    <div className="min-h-screen overflow-hidden">

      {/* 1. Enhanced Hero Section */}
      <section ref={heroRef} className="relative pt-28 pb-48 md:pt-36 md:pb-64 overflow-hidden bg-gradient-to-b from-[#1a202c] to-[#2d3748] text-white">
        {/* Abstract Geometric Background */}
        <div className="parallax-bg absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L0 0 L100 0 L100 100 Z" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4fd1c5', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#9f7aea', stopOpacity: 0.2 }} />
              </linearGradient>
            </defs>
            <circle cx="10" cy="10" r="20" fill="#4fd1c5" opacity="0.1" className="animate-pulse-slow" />
            <circle cx="90" cy="90" r="30" fill="#9f7aea" opacity="0.1" className="animate-float" />
            <rect x="30" y="40" width="40" height="40" stroke="#fff" strokeWidth="0.5" fill="none" opacity="0.1" className="animate-logo-rotate-glow" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 mb-8 animate-scale-in">
            <FaUniversity className="text-4xl md:text-5xl text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight leading-tight animate-slide-up">
            About <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AUGCVS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200 font-light">
            Modernizing <span className="font-serif italic text-white">credential verification</span> with <span className="font-serif italic text-white">Secure Digital Verification</span> and real-time efficiency for <span className="font-serif italic text-white">Ambo University</span>.
          </p>
        </div>
      </section>

      {/* 2. Mission Section - Glass Card */}
      <section className="py-20 bg-gray-50 dark:bg-[#0f0a1a]">
        <div className="container mx-auto px-4 relative z-20">
          <div className="bg-white dark:bg-[#1a1325] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-[#3d2f55] scroll-animate opacity-0 transition-all duration-700">
            <div className="grid md:grid-cols-2">
              <div className="p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <MdSchool className="text-3xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 font-sans">
                  The Ambo University Graduation Credential Verification System (AUGCVS) is designed
                  to combat credential fraud while providing instant verification services. We bridge the gap
                  between the university, graduates, and hiring organizations.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <MdVerifiedUser className="text-green-500 mr-3 text-xl" />
                    <span>Zero-tolerance for credential fraud</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <MdSpeed className="text-blue-500 mr-3 text-xl" />
                    <span>Reduce verification time from days to minutes</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                {/* Visual Statistic Representation */}
                <div className="text-center relative z-10 grid grid-cols-2 gap-8 w-full max-w-sm">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                      <div className={`text-2xl mb-2 ${stat.color}`}>{stat.icon}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-blue-100 opacity-80 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Features - Grid */}
      <section className="py-20 bg-white dark:bg-[#0f0a1a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-animate opacity-0">
            <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">Why Choose AUGCVS?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Built with cutting-edge technology to ensure speed, security, and reliability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`p-8 rounded-2xl bg-gray-50 dark:bg-[#1a1325] border border-gray-100 dark:border-[#2a1f3d] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group scroll-animate opacity-0 ${feature.delay}`}>
                <div className="w-14 h-14 bg-white dark:bg-[#2a1f3d] rounded-xl flex items-center justify-center text-3xl text-purple-600 dark:text-purple-400 shadow-sm mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-sans">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Campus Gallery */}
      <section className="py-20 bg-gray-50 dark:bg-[#0f0a1a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 scroll-animate opacity-0">
            <div>
              <h2 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">Campus Life</h2>
              <p className="text-gray-600 dark:text-gray-400">A glimpse into Ambo University's vibrant environment.</p>
            </div>
            <Link to="/gallery" className="hidden md:flex items-center text-purple-600 font-bold hover:text-purple-700 transition-colors mt-4 md:mt-0">
              View Full Gallery <MdArrowForward className="ml-2" />
            </Link>
          </div>
          <CampusGallery />
        </div>
      </section>

      {/* 5. Tech Stack - Modern Badges */}
      <section className="py-20 border-t border-gray-200 dark:border-[#2a1f3d] bg-white dark:bg-[#0f0a1a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-12">Powered By Details Tech</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-80">
            <TechBadge icon={<FaServer />} label="Node.js" />
            <TechBadge icon={<FaCode />} label="React 18" />
            <TechBadge icon={<FaPaintBrush />} label="Tailwind CSS" />
            <TechBadge icon={<MdCloudDone />} label="MongoDB" />
            <TechBadge icon={<FaLock />} label="JWT Security" />
            <TechBadge icon={<MdSpeed />} label="Socket.IO" />
          </div>
        </div>
      </section>

      {/* 6. Contact Footer */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-purple-900 text-white text-center">
        <div className="container mx-auto px-4 scroll-animate opacity-0">
          <h2 className="text-3xl font-heading font-bold mb-6">Ready to Verify?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of students and organizations using AUGCVS for secure credential management.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
              Create Account
            </Link>
            <Link to="/contact" className="px-8 py-3 bg-transparent border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              Contact Support
            </Link>
          </div>
          <div className="mt-12 text-sm text-blue-200/60">
            &copy; {new Date().getFullYear()} Ambo University. All Rights Reserved.
          </div>
        </div>
      </section>

      {/* Inline styles for scroll animations & parallax */}
      <style>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
        }
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.6s ease-out;
        }
        .delay-\\[100ms\\] { animation-delay: 100ms; }
        .delay-\\[200ms\\] { animation-delay: 200ms; }
        .delay-\\[300ms\\] { animation-delay: 300ms; }
        .delay-\\[400ms\\] { animation-delay: 400ms; }
        .delay-\\[500ms\\] { animation-delay: 500ms; }
        .delay-\\[600ms\\] { animation-delay: 600ms; }
      `}</style>
    </div>
  )
}

const TechBadge = ({ icon, label }) => (
  <div className="flex flex-col items-center group cursor-default">
    <div className="text-4xl text-gray-400 group-hover:text-blue-500 transition-colors mb-2 transform group-hover:scale-110 duration-300">
      {icon}
    </div>
    <span className="font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
  </div>
)

export default About
