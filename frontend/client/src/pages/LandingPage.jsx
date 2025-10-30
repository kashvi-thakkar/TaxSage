import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const features = [
    {
      icon: '⚡',
      title: 'AI-Powered Filing',
      description: 'Smart tax filing with AI assistance and automated Form-16 processing'
    },
    {
      icon: '👨‍💼',
      title: 'Expert CA Review',
      description: 'Connect with certified Chartered Accountants for professional review'
    },
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption to keep your financial data safe'
    },
    {
      icon: '💸',
      title: 'Maximize Refunds',
      description: 'Smart deductions discovery to ensure you get maximum returns'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Documents',
      description: 'Simply upload your Form-16 or enter details manually'
    },
    {
      step: '02',
      title: 'AI Processing',
      description: 'Our AI automatically extracts and verifies your tax data'
    },
    {
      step: '03',
      title: 'Expert Review',
      description: 'Get your return reviewed by certified CAs for accuracy'
    },
    {
      step: '04',
      title: 'File & Track',
      description: 'Submit your ITR and track real-time status updates'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Users' },
    { number: '₹25Cr+', label: 'Tax Saved' },
    { number: '99.9%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                TaxSage
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#80A1BA] transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#80A1BA] transition-colors font-medium">How It Works</a>
              <a href="#stats" className="text-gray-600 hover:text-[#80A1BA] transition-colors font-medium">Success</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-[#80A1BA] transition-colors font-medium px-4 py-2"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FFF7DD] via-white to-[#f0f9ff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#80A1BA]/10 border border-[#80A1BA]/20 text-[#80A1BA] text-sm font-medium mb-6">
              🚀 India's Most Intelligent Tax Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Tax Filing
              <span className="block bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] bg-clip-text text-transparent">
                Made Effortless
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of tax filing with AI-powered automation, expert CA review, 
              and guaranteed maximum refunds. Join thousands of Indians who trust TaxSage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg shadow-lg"
              >
                Start Free Filing →
              </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-[#80A1BA] hover:text-[#80A1BA] transition-all duration-300 text-lg">
                Watch Demo
              </button>
            </div>
            
            {/* Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why <span className="text-[#80A1BA]">TaxSage</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for stress-free tax filing, powered by cutting-edge technology
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#80A1BA]/20 hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-[#FFF7DD] to-[#f0f9ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="text-[#80A1BA]">Works</span>
            </h2>
            <p className="text-xl text-gray-600">
              Simple, secure, and smart tax filing in 4 easy steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:scale-105">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 bg-[#80A1BA] rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Tax Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of smart Indians who've made the switch to effortless tax filing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup" 
              className="bg-white text-[#80A1BA] px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg shadow-lg"
            >
              Start Free Today
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 text-lg">
              Talk to Expert
            </button>
          </div>
          <div className="mt-8 text-white/80 text-sm">
            🚀 No credit card required • 📄 Free basic filing • ⭐ 24/7 Support
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-[#80A1BA] to-[#91C4C3] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">TS</span>
                </div>
                <span className="text-2xl font-bold">TaxSage</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                India's most intelligent tax filing platform powered by AI and expert CAs. 
                Making tax simple for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TaxSage. All rights reserved. Made with ❤️ for India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;