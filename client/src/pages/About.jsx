import React from 'react'
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
  MdPhotoLibrary
} from 'react-icons/md'
import { FaUniversity, FaShieldAlt, FaChartLine } from 'react-icons/fa'

const About = () => {
  const features = [
    {
      icon: <MdVerifiedUser className="text-4xl" />,
      title: 'Credential Verification',
      description: 'Verify graduate credentials instantly with our secure verification system. Ensure authenticity and prevent fraud.',
    },
    {
      icon: <MdSecurity className="text-4xl" />,
      title: 'Secure & Encrypted',
      description: 'All data is encrypted and stored securely. We follow industry-standard security practices to protect sensitive information.',
    },
    {
      icon: <MdSpeed className="text-4xl" />,
      title: 'Fast & Efficient',
      description: 'Get verification results in real-time. Our system processes requests quickly without compromising accuracy.',
    },
    {
      icon: <MdGroup className="text-4xl" />,
      title: 'Role-Based Access',
      description: 'Different access levels for Admins, Registrars, and External Users ensure proper authorization and security.',
    },
    {
      icon: <MdCloudDone className="text-4xl" />,
      title: 'Cloud-Based',
      description: 'Access the system from anywhere, anytime. Cloud infrastructure ensures reliability and scalability.',
    },
    {
      icon: <MdAccessTime className="text-4xl" />,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about verification status changes. Stay updated with real-time Socket.IO integration.',
    },
  ]

  const stats = [
    { label: 'Verified Credentials', value: '10,000+', icon: <MdVerifiedUser /> },
    { label: 'Active Users', value: '500+', icon: <MdGroup /> },
    { label: 'Verification Requests', value: '50,000+', icon: <MdDescription /> },
    { label: 'Uptime', value: '99.9%', icon: <FaChartLine /> },
  ]

  return (
    <div className="animate-fade-in dark:text-dark-text light:text-light-text">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl mb-6 animate-float">
          <FaUniversity className="text-white text-4xl" />
        </div>
        <h1 className="text-5xl font-heading font-bold dark:text-dark-text light:text-light-text mb-4">
          About AUGCVS
        </h1>
        <p className="text-xl dark:text-dark-muted light:text-light-muted max-w-3xl mx-auto">
          Ambo University Graduation Credential Verification System - A modern, secure, 
          and efficient platform for verifying graduate credentials and preventing fraud.
        </p>
      </div>

      {/* Mission Section */}
      <div className="card mb-12">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <MdSchool className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text mb-4">Our Mission</h2>
            <p className="leading-relaxed mb-4 dark:text-dark-muted light:text-light-muted">
              The Ambo University Graduation Credential Verification System (AUGCVS) is designed 
              to provide a secure, efficient, and user-friendly platform for verifying graduate 
              credentials. We aim to combat credential fraud while providing instant verification 
              services to employers, educational institutions, and other stakeholders.
            </p>
            <p className="leading-relaxed dark:text-dark-muted light:text-light-muted">
              Our system ensures that every graduate credential is verified against official 
              university records, maintaining the integrity of academic qualifications and 
              protecting the reputation of our graduates.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center hover:scale-105 transition-transform hover:border-primary-500/50">
            <div className="text-purple-400 mb-3 flex justify-center">
              {stat.icon}
            </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
              <div className="text-sm dark:text-dark-muted light:text-light-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Campus Gallery Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl mb-4">
            <MdPhotoLibrary className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text mb-2">
            Campus Showcase
          </h2>
          <p className="dark:text-dark-muted light:text-light-muted">
            Explore our beautiful campus and modern facilities
          </p>
        </div>
        <CampusGallery />
      </div>

      {/* Features Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text mb-8 text-center">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
              <div
              key={index}
              className="card-hover cursor-pointer group"
            >
              <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold dark:text-dark-text light:text-light-text mb-3">{feature.title}</h3>
              <p className="dark:text-dark-muted light:text-light-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card mb-12">
        <h2 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text mb-6">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">MERN</div>
            <div className="text-sm dark:text-dark-muted light:text-light-muted">MongoDB, Express, React, Node.js</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">Tailwind</div>
            <div className="text-sm dark:text-dark-muted light:text-light-muted">Modern CSS Framework</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">Socket.IO</div>
            <div className="text-sm dark:text-dark-muted light:text-light-muted">Real-Time Communication</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-2">JWT</div>
            <div className="text-sm dark:text-dark-muted light:text-light-muted">Secure Authentication</div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-heading font-bold dark:text-dark-text light:text-light-text mb-4">Security & Privacy</h2>
            <ul className="space-y-3 dark:text-dark-muted light:text-light-muted">
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>End-to-end encryption for all data transmission</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>Role-based access control ensures authorized access only</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>Compliance with data protection regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>Secure file storage and certificate management</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">✓</span>
                <span>Audit logs for all system activities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact/Support Section */}
      <div className="mt-12 card text-center">
        <h2 className="text-2xl font-heading font-bold dark:text-dark-text light:text-light-text mb-4">Need Help?</h2>
        <p className="dark:text-dark-muted light:text-light-muted mb-6">
          For technical support, questions, or feedback, please contact the system administrator.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-4 py-2 rounded-lg dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border">
            <div className="text-sm dark:text-dark-muted light:text-light-muted">Email</div>
            <div className="dark:text-dark-text light:text-light-text">support@augcvs.edu.et</div>
          </div>
          <div className="px-4 py-2 rounded-lg dark:bg-dark-surface light:bg-light-surface border dark:border-dark-border light:border-light-border">
            <div className="text-sm dark:text-dark-muted light:text-light-muted">Institution</div>
            <div className="dark:text-dark-text light:text-light-text">Ambo University</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
