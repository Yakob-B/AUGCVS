import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  MdSecurity,
  MdUploadFile,
  MdBusiness,
  MdTimeline,
  MdDashboard,
  MdGppGood,
  MdCheckCircle,
  MdSchool,
  MdAdminPanelSettings,
  MdArrowForward
} from 'react-icons/md'

const Home = () => {
  const heroRef = useRef(null)

  // Parallax effect for hero skyline
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY
        const skyline = heroRef.current.querySelector('.skyline')
        if (skyline) {
          skyline.style.transform = `translateY(${scrolled * 0.5}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll-triggered animations
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

  return (
    <div className="space-y-0">
      {/* 1. Hero Section with City Skyline & Parallax */}
      <section ref={heroRef} className="relative bg-gradient-to-b from-[#2c3e50] to-[#34495e] text-white py-32 overflow-hidden">
        {/* City Skyline SVG Background with Parallax */}
        <div className="skyline absolute bottom-0 left-0 right-0 opacity-20 transition-transform duration-100">
          <svg viewBox="0 0 1200 200" className="w-full h-32 md:h-40">
            <rect x="50" y="80" width="60" height="120" fill="currentColor" opacity="0.3" />
            <rect x="120" y="100" width="40" height="100" fill="currentColor" opacity="0.4" />
            <rect x="170" y="60" width="70" height="140" fill="currentColor" opacity="0.3" />
            <rect x="250" y="90" width="50" height="110" fill="currentColor" opacity="0.4" />
            <rect x="310" y="50" width="80" height="150" fill="currentColor" opacity="0.5" />
            <rect x="400" y="70" width="60" height="130" fill="currentColor" opacity="0.3" />
            <rect x="470" y="40" width="90" height="160" fill="currentColor" opacity="0.4" />
            <rect x="570" y="85" width="50" height="115" fill="currentColor" opacity="0.3" />
            <rect x="630" y="95" width="45" height="105" fill="currentColor" opacity="0.4" />
            <rect x="685" y="55" width="75" height="145" fill="currentColor" opacity="0.5" />
            <rect x="770" y="75" width="55" height="125" fill="currentColor" opacity="0.3" />
            <rect x="835" y="45" width="85" height="155" fill="currentColor" opacity="0.4" />
            <rect x="930" y="90" width="60" height="110" fill="currentColor" opacity="0.3" />
            <rect x="1000" y="65" width="70" height="135" fill="currentColor" opacity="0.5" />
            <rect x="1080" y="100" width="50" height="100" fill="currentColor" opacity="0.4" />
            {/* Windows - animated */}
            <rect x="60" y="90" width="8" height="8" fill="#ffd700" opacity="0.8" className="animate-pulse-slow" />
            <rect x="75" y="90" width="8" height="8" fill="#ffd700" opacity="0.6" />
            <rect x="60" y="105" width="8" height="8" fill="#ffd700" opacity="0.7" className="animate-pulse-slow" />
            <rect x="180" y="70" width="10" height="10" fill="#ffd700" opacity="0.8" />
            <rect x="195" y="70" width="10" height="10" fill="#ffd700" opacity="0.6" className="animate-pulse-slow" />
            <rect x="325" y="60" width="10" height="10" fill="#ffd700" opacity="0.9" />
            <rect x="340" y="60" width="10" height="10" fill="#ffd700" opacity="0.7" className="animate-pulse-slow" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 animate-slide-down">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 uppercase tracking-wide">
            Secure Credential Verification
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
            Ambo University's modern digital platform for validating graduate credentials with blockchain-inspired security and real-time verification.
          </p>
          <Link
            to="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold uppercase tracking-wide rounded-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-bounce-subtle"
          >
            Learn More
          </Link>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
          <div className="w-2 h-2 bg-white rounded-full hover:opacity-50 transition-opacity cursor-pointer"></div>
          <div className="w-2 h-2 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
          <div className="w-2 h-2 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
          <div className="w-2 h-2 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer"></div>
        </div>
      </section>

      {/* 2. Key Features Section - OUR SERVICES */}
      <section className="bg-white py-20 relative">
        {/* Blue Badge */}
        <div className="text-center mb-12 scroll-animate opacity-0 transition-all duration-700">
          <span className="inline-block bg-blue-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wide animate-slide-down">
            Our Services
          </span>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <ServiceCard
              icon={<MdSecurity />}
              title="Secure Verification"
              desc="Blockchain-inspired security for tamper-proof credential validation with advanced encryption."
              delay="delay-[100ms]"
            />
            <ServiceCard
              icon={<MdUploadFile />}
              title="Certificate Upload"
              desc="Graduates can easily upload and manage their digital credentials through our portal."
              delay="delay-[200ms]"
            />
            <ServiceCard
              icon={<MdBusiness />}
              title="External Requests"
              desc="Companies request verification directly through the secure verification portal."
              delay="delay-[300ms]"
            />
            <ServiceCard
              icon={<MdTimeline />}
              title="Real-time Tracking"
              desc="Track verification status in real-time with instant notifications and updates."
              delay="delay-[400ms]"
            />
          </div>
        </div>
      </section>

      {/* 3. Additional Services */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
            <ServiceCard
              icon={<MdDashboard />}
              title="Registrar Dashboard"
              desc="Comprehensive administrative tools for university staff to manage and approve verification requests efficiently."
              delay="delay-[100ms]"
            />
            <ServiceCard
              icon={<MdGppGood />}
              title="Fraud Prevention"
              desc="Advanced validation algorithms to eliminate fake certificates and ensure credential authenticity."
              delay="delay-[200ms]"
            />
          </div>
        </div>
      </section>

      {/* 4. Why This System Matters - WHAT WE OFFER */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 scroll-animate opacity-0 transition-all duration-700">
            <span className="inline-block bg-blue-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wide mb-4">
              What We Offer
            </span>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Experience seamless credential verification with our modern platform designed for graduates, employers, and university registrars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <BenefitCard
              title="Fast Verification"
              desc="Eliminates manual verification delays with automated processing and instant results."
              delay="delay-[100ms]"
            />
            <BenefitCard
              title="Fraud Prevention"
              desc="Advanced security prevents certificate fraud with blockchain-inspired validation."
              delay="delay-[200ms]"
            />
            <BenefitCard
              title="Easy Access"
              desc="Simple, intuitive interface for graduates and employers to access credentials."
              delay="delay-[300ms]"
            />
            <BenefitCard
              title="Quick Response"
              desc="Fast response times from registrar with streamlined approval workflows."
              delay="delay-[400ms]"
            />
            <BenefitCard
              title="Modern Architecture"
              desc="Built using MERN stack for reliability, scalability, and performance."
              delay="delay-[500ms]"
            />
            <BenefitCard
              title="Multi-Platform"
              desc="Works seamlessly on mobile and desktop devices for on-the-go access."
              delay="delay-[600ms]"
            />
          </div>
        </div>
      </section>

      {/* 5. User Role Quick Access - Portfolio Style */}
      <section className="bg-gradient-to-b from-[#2c3e50] to-[#34495e] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 scroll-animate opacity-0 transition-all duration-700">
            <span className="inline-block bg-blue-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wide mb-4">
              Get Started
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Choose Your Portal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PortfolioCard
              icon={<MdSchool />}
              title="Graduate"
              desc="Upload your certificate and track verification status in real-time through your personal dashboard."
              link="/login"
              btnText="Upload Certificate"
              delay="delay-[100ms]"
            />
            <PortfolioCard
              icon={<MdBusiness />}
              title="External Organization"
              desc="Request verification for candidate credentials through our secure external verification portal."
              link="/login"
              btnText="Request Verification"
              delay="delay-[200ms]"
            />
            <PortfolioCard
              icon={<MdAdminPanelSettings />}
              title="Registrar"
              desc="Manage and approve verification requests with comprehensive administrative tools."
              link="/login"
              btnText="Manage Verifications"
              delay="delay-[300ms]"
            />
          </div>
        </div>
      </section>

      {/* Inline styles for scroll animations */}
      <style jsx>{`
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

const ServiceCard = ({ icon, title, desc, delay = '' }) => (
  <div className={`text-center group scroll-animate opacity-0 transition-all duration-700 ${delay}`}>
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
)

const BenefitCard = ({ title, desc, delay = '' }) => (
  <div className={`bg-white p-6 rounded-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-2 scroll-animate opacity-0 ${delay}`}>
    <h3 className="text-xl font-bold text-blue-600 mb-3">{title}</h3>
    <p className="text-gray-600">{desc}</p>
    <Link to="/about" className="inline-block mt-4 text-blue-500 hover:text-blue-700 font-semibold text-sm group">
      Read More <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
    </Link>
  </div>
)

const PortfolioCard = ({ icon, title, desc, link, btnText, delay = '' }) => (
  <div className={`relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden group hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl scroll-animate opacity-0 ${delay}`}>
    <div className="p-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl group-hover:animate-bounce-subtle group-hover:bg-blue-600 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-blue-300 transition-colors">{title}</h3>
      <p className="text-gray-300 mb-6 text-center leading-relaxed">{desc}</p>
      <Link
        to={link}
        className="block w-full py-3 px-6 bg-transparent border-2 border-blue-500 text-blue-400 font-bold text-center rounded-md hover:bg-blue-500 hover:text-white hover:scale-105 transition-all duration-300"
      >
        {btnText}
      </Link>
    </div>
    {/* Hover Overlay with Glow */}
    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"></div>
  </div>
)

export default Home
