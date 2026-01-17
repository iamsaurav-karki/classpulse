'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiBook, FiUsers, FiMessageCircle, FiFileText, FiSearch, FiZap, 
  FiArrowRight, FiCheck, FiStar, FiUser, FiMonitor, FiSettings,
  FiMail, FiTwitter, FiLinkedin, FiGithub, FiTrendingUp, FiShield, FiAward, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';

interface LandingPageContent {
  hero?: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badgeText: string;
  };
  about?: {
    title: string;
    description: string;
  };
  features?: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
      color: string;
    }>;
  };
  roles?: {
    title: string;
    subtitle: string;
    student: {
      title: string;
      items: string[];
    };
    teacher: {
      title: string;
      items: string[];
    };
    admin: {
      title: string;
      items: string[];
    };
  };
  footer?: {
    companyDescription: string;
    socialMedia: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      email?: string;
    };
    quickLinks: {
      title: string;
      links: Array<{
        label: string;
        href: string;
      }>;
    };
    resources: {
      title: string;
      links: Array<{
        label: string;
        href: string;
        icon: string;
      }>;
    };
    legalLinks: {
      privacyPolicy?: string;
      termsOfService?: string;
      contact?: string;
    };
    copyrightText: string;
  };
}

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Static content
  const content: LandingPageContent = {
    hero: {
      title: 'Interactive Learning Redefined',
      subtitle: 'Connect students and teachers through intelligent Q&A, collaborative learning, and real-time communication. Experience education like never before.',
      ctaPrimary: 'Get Started Free',
      ctaSecondary: '► Learn More',
      badgeText: 'Trusted by students and teachers',
    },
    about: {
      title: 'About ClassPulse',
      description: 'ClassPulse is a production-ready educational platform that connects students and teachers in a collaborative digital learning environment. Built with modern technologies and designed to handle thousands of concurrent users, we\'re revolutionizing how education happens online.',
    },
    features: {
      title: 'Powerful Features for Modern Education',
      subtitle: 'Everything you need to create an engaging and collaborative learning environment',
      items: [
        {
          title: 'Smart Q&A System',
          description: 'AI-powered question matching and intelligent routing to the right experts for instant answers.',
          icon: 'FiMessageCircle',
          color: 'green',
        },
        {
          title: 'Resource Sharing',
          description: 'Seamless sharing of notes, documents, and learning materials with version control.',
          icon: 'FiFileText',
          color: 'green',
        },
        {
          title: 'Peer Learning',
          description: 'Connect with classmates, form study groups, and learn collaboratively.',
          icon: 'FiUsers',
          color: 'green',
        },
        {
          title: 'Support Tickets',
          description: 'Streamlined support system with priority routing and real-time status updates.',
          icon: 'FiFileText',
          color: 'orange',
        },
        {
          title: 'Smart Search',
          description: 'Find any resource, question, or discussion instantly with our advanced search engine.',
          icon: 'FiSearch',
          color: 'green',
        },
        {
          title: 'Real-time Notifications',
          description: 'Stay updated with instant notifications for answers, messages, and important updates.',
          icon: 'FiZap',
          color: 'pink',
        },
      ],
    },
    roles: {
      title: 'Role-Based Access Control',
      subtitle: 'Tailored experiences for every user type',
      student: {
        title: 'Students',
        items: [
          'Ask questions and get answers',
          'Access shared resources',
          'Create support tickets',
          'Vote on answers',
        ],
      },
      teacher: {
        title: 'Teachers',
        items: [
          'Answer student questions',
          'Upload and share notes',
          'Manage support tickets',
          'Get verified badge',
        ],
      },
      admin: {
        title: 'Admins',
        items: [
          'Manage all users',
          'Moderate content',
          'View analytics',
          'System configuration',
        ],
      },
    },
    footer: {
      companyDescription: 'Connecting students and teachers in a collaborative digital learning environment. Experience education like never before.',
      socialMedia: {
        twitter: '#',
        linkedin: '#',
        github: '#',
        email: '#',
      },
      quickLinks: {
        title: 'Quick Links',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Roles', href: '#roles' },
          { label: 'Get Started', href: '/auth/register' },
        ],
      },
      resources: {
        title: 'Resources',
        links: [
          { label: 'Q&A System', href: '/questions', icon: 'FiTrendingUp' },
          { label: 'Notes & Resources', href: '/notes', icon: 'FiBook' },
          { label: 'Support', href: '/support', icon: 'FiShield' },
          { label: 'Sign In', href: '/auth/login', icon: 'FiArrowRight' },
        ],
      },
      legalLinks: {
        privacyPolicy: '#',
        termsOfService: '#',
        contact: '#',
      },
      copyrightText: 'ClassPulse. All rights reserved.',
    },
  };

  // Use static content
  const hero = content.hero!;
  const about = content.about!;
  const features = content.features!;
  const roles = content.roles!;
  const footer = content.footer!;

  // Icon mapping
  const iconMap: { [key: string]: any } = {
    FiMessageCircle,
    FiFileText,
    FiUsers,
    FiSearch,
    FiZap,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm shadow-gray-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with animation */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-green-600 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-10 h-10 rounded-xl overflow-hidden transform group-hover:scale-110 transition-transform duration-300">
                  <img src="/favicon.svg" alt="ClassPulse" className="w-full h-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-green-600 transition-all">
                  ClassPulse
                </h1>
                <div className="h-0.5 bg-green-600 w-0 group-hover:w-full transition-all duration-300"></div>
              </div>
            </Link>

            {/* Center Navigation with underline effect - Desktop */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-50/80 rounded-full px-2 py-2 backdrop-blur-sm border border-gray-200/50">
              <Link 
                href="#about" 
                className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-full transition-all duration-300 hover:text-green-600 group"
              >
                <span className="relative z-10">About</span>
                <span className="absolute inset-0 bg-green-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-3/4 transition-all duration-300"></span>
              </Link>
              <Link 
                href="#features" 
                className="relative px-6 py-2.5 text-sm font-semibold text-gray-700 rounded-full transition-all duration-300 hover:text-green-600 group"
              >
                <span className="relative z-10">Features</span>
                <span className="absolute inset-0 bg-green-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-green-600 group-hover:w-3/4 transition-all duration-300"></span>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="hidden sm:block px-5 py-2.5 text-sm font-semibold text-gray-700 rounded-lg hover:text-green-600 transition-all duration-300 relative group overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                <span className="absolute inset-0 bg-green-50 rounded-lg transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Link>
              <Link
                href="/auth/register"
                className="relative px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/40 transition-all duration-300 flex items-center gap-2 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="hidden sm:inline">Signup</span>
                  <span className="sm:hidden">Signup</span>
                  <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-purple-600 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-in slide-in-from-top-2">
              <div className="flex flex-col space-y-2">
                <Link
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all"
                >
                  About
                </Link>
                <Link
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all"
                >
                  Features
                </Link>
                <div className="pt-2 border-t border-gray-200 mt-2 space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-center"
                  >
                    Signup
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Breadcrumb */}
      <div className="md:hidden bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FiChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">ClassPulse</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-white py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs sm:text-sm font-medium text-green-700">
                  {hero.badgeText}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                {hero.title ? (
                  hero.title.split(' ').map((word, i, arr) => 
                    i === arr.length - 1 ? (
                      <span key={i} className="text-green-600"> {word}</span>
                    ) : (
                      <span key={i} className="text-gray-900">{i > 0 ? ' ' : ''}{word}</span>
                    )
                  )
                ) : (
                  <span className="text-gray-900">Interactive Learning <span className="text-green-600">Redefined</span></span>
                )}
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-xl">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-12">
                <Link
                  href="/auth/register"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-lg font-semibold text-base sm:text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {hero.ctaPrimary}
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold text-base sm:text-lg hover:border-green-600 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                >
                  {hero.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative bg-green-50 rounded-2xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">1,234</div>
                        <div className="text-sm text-gray-600">Active Questions</div>
                      </div>
                      <div className="bg-green-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">5,678</div>
                        <div className="text-sm text-gray-600">Total Answers</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-3/4"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-2/3"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
                Live Demo
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {about.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {about.description}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {features.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {features.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.items.map((feature, index) => {
              const Icon = iconMap[feature.icon] || FiFileText;
              const colorConfig = {
                green: {
                  bg: 'bg-green-50',
                  border: 'border-green-100',
                  iconBg: 'bg-green-500',
                },
                orange: {
                  bg: 'bg-orange-50',
                  border: 'border-orange-100',
                  iconBg: 'bg-orange-500',
                },
                pink: {
                  bg: 'bg-pink-50',
                  border: 'border-pink-100',
                  iconBg: 'bg-pink-500',
                },
              };
              const colors = colorConfig[feature.color as keyof typeof colorConfig] || colorConfig.green;
              
              return (
                <div key={index} className={`${colors.bg} p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border ${colors.border}`}>
                  <div className={`w-12 sm:w-14 h-12 sm:h-14 ${colors.iconBg} rounded-xl flex items-center justify-center mb-4 sm:mb-6`}>
                    <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Access Control */}
      <section id="roles" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {roles.title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {roles.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Students */}
            <div className="bg-green-50 p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-green-200">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <FiUser className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{roles.student.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {roles.student.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                    <FiCheck className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Teachers - Most Popular */}
            <div className="bg-green-50 p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-green-300 relative transform sm:scale-105">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <FiMonitor className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{roles.teacher.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {roles.teacher.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                    <FiCheck className="w-4 sm:w-5 h-4 sm:h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Administrators */}
            <div className="bg-pink-50 p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-pink-200 sm:col-span-2 lg:col-span-1">
              <div className="w-14 sm:w-16 h-14 sm:h-16 bg-pink-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <FiSettings className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{roles.admin.title}</h3>
              <ul className="space-y-2 sm:space-y-3">
                {roles.admin.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                    <FiCheck className="w-4 sm:w-5 h-4 sm:h-5 text-pink-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            {/* Brand Column */}
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="/favicon.svg" alt="ClassPulse" className="w-full h-full" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">ClassPulse</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                {footer.companyDescription}
              </p>
              <div className="flex items-center space-x-4">
                {footer.socialMedia.twitter && (
                  <a href={footer.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    <FiTwitter className="w-5 h-5" />
                  </a>
                )}
                {footer.socialMedia.linkedin && (
                  <a href={footer.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    <FiLinkedin className="w-5 h-5" />
                  </a>
                )}
                {footer.socialMedia.github && (
                  <a href={footer.socialMedia.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    <FiGithub className="w-5 h-5" />
                  </a>
                )}
                {footer.socialMedia.email && (
                  <a href={`mailto:${footer.socialMedia.email}`} className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                    <FiMail className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">{footer.quickLinks.title}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {footer.quickLinks.links.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base">
                      <FiArrowRight className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-base sm:text-lg">{footer.resources.title}</h4>
              <ul className="space-y-2 sm:space-y-3">
                {footer.resources.links.map((link, index) => {
                  const IconComponent = iconMap[link.icon] || FiArrowRight;
                  return (
                    <li key={index}>
                      <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base">
                        <IconComponent className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-6 sm:pt-8 mb-6 sm:mb-8"></div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="text-gray-400 text-xs sm:text-sm">
              <p>&copy; {currentYear} {footer.copyrightText}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              {footer.legalLinks.privacyPolicy && (
                <Link href={footer.legalLinks.privacyPolicy} className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              )}
              {footer.legalLinks.termsOfService && (
                <Link href={footer.legalLinks.termsOfService} className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              )}
              {footer.legalLinks.contact && (
                <Link href={footer.legalLinks.contact} className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
