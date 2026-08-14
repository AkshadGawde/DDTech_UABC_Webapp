import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ConsultationForm } from '../ConsultationForm';
import { insightsService } from '../../admin/services/insightsService';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

/**
 * Navigation Bar - Fully Responsive
 */
export const Navbar = ({ isDark, toggleTheme }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [insightCategories, setInsightCategories] = useState<string[]>([]);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch insight categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await insightsService.getPublicInsights({
          limit: 1000,
          sort: 'newest'
        });
        
        if (response && response.insights) {
          const uniqueCategories = [...new Set(response.insights.map((insight: any) => insight.category))];
          setInsightCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Helper function to convert category name to URL slug
  const categoryToSlug = (category: string) => {
    return category.toLowerCase().replace(/\s+/g, '-');
  };

  const navLinks = [
    { 
      name: 'Home', 
      path: '/' 
    },
    { 
      name: 'About Us', 
      path: '/about',
      dropdown: [
        { name: 'Overview', path: '/about' },
        { name: 'Our Approach', path: '/about/approach' },
        { name: 'Management', path: '/about/management' },
        { name: 'Our Team', path: '/team' },
        { name: 'Success Stories', path: '/about/success-stories' }
      ]
    },
    { 
      name: 'Services', 
      path: '/services',
      dropdown: [
        { name: 'Employee Benefits', path: '/services/employee-benefits' },
        { name: 'Insurance Consulting', path: '/services/insurance-consulting' },
        { name: 'Retirement Consulting', path: '/services/retirement-consulting' },
        { name: 'Benefit Consulting', path: '/services/benefit-consulting' }
      ]
    },
    { 
      name: 'Insights', 
      path: '/insights',
      dropdown: insightCategories.length > 0 
        ? insightCategories.map(category => ({
            name: category,
            path: `/insights/${categoryToSlug(category)}`
          }))
        : []
    },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-light-bg dark:bg-dark-bg border-b border-slate-200 dark:border-transparent ${isScrolled 
            ? 'py-2 sm:py-2 md:py-2 shadow-md shadow-black/5' 
            : 'py-2.5 sm:py-3 md:py-4'
        }`}
      >
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 sm:gap-2 group shrink-0">
          <Logo className="h-6 sm:h-7 md:h-8 lg:h-10" />
        </Link>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
          {navLinks.map((link) => (
            <div 
              key={link.name} 
              className="relative group"
              onMouseEnter={() => setActiveDropdown(link.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                to={link.path}
                className={`text-sm xl:text-base font-medium transition-colors relative px-3 xl:px-4 py-2 whitespace-nowrap flex items-center gap-1 ${
                  location.pathname === link.path || (link.dropdown && link.dropdown.some(item => location.pathname === item.path))
                    ? 'text-accent-600 dark:text-accent-500' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-500'
                }`}
              >
                {link.name}
                {link.dropdown && <ChevronDown className="w-4 h-4 shrink-0" />}
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-accent-500 transition-all ${
                  location.pathname === link.path || (link.dropdown && link.dropdown.some(item => location.pathname === item.path))
                    ? 'w-6 xl:w-8' 
                    : 'w-0 group-hover:w-6 xl:group-hover:w-8'
                }`} />
              </Link>

              {/* Desktop Dropdown Menu */}
              {link.dropdown && (
                <AnimatePresence>
                  {activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`block px-4 py-2.5 text-sm transition-colors ${
                            location.pathname === item.path
                              ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        {/* Theme Toggle & Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2 sm:gap-2">
          <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          <button 
            className="text-slate-900 dark:text-white p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Get in touch Button & Theme Toggle */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
          <ThemeToggle isDark={isDark} toggle={toggleTheme} />
          <button 
            onClick={() => setIsConsultationModalOpen(true)}
            className="px-5 xl:px-7 py-2.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white rounded-md text-sm xl:text-base font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transform hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0"
          >
            Get in touch
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            style={{ transformOrigin: 'top' }}
            className="lg:hidden bg-light-bg dark:bg-dark-bg"
          >
            <div className="w-full max-h-[calc(100vh-70px)] overflow-y-auto flex flex-col p-3 sm:p-4 gap-1">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col">
                  {link.dropdown ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`text-base sm:text-lg font-medium transition-colors flex-1 px-4 py-3 rounded ${
                            location.pathname === link.path || (link.dropdown && link.dropdown.some(item => location.pathname === item.path))
                              ? 'text-accent-600 dark:text-accent-500 bg-accent-50 dark:bg-accent-900/10' 
                              : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {link.name}
                        </Link>
                        <button
                          onClick={() => setMobileDropdown(mobileDropdown === link.name ? null : link.name)}
                          className={`p-3 transition-transform shrink-0 ${
                            location.pathname === link.path || (link.dropdown && link.dropdown.some(item => location.pathname === item.path))
                              ? 'text-accent-600 dark:text-accent-500' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                          aria-label="Toggle submenu"
                        >
                          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileDropdown === link.name ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <AnimatePresence>
                        {mobileDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-0.5 pl-4 border-l-3 border-accent-400 dark:border-accent-600 my-1"
                          >
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setMobileDropdown(null);
                                }}
                                className={`text-base sm:text-lg transition-colors px-4 py-3 rounded ${
                                  location.pathname === item.path
                                    ? 'text-accent-600 dark:text-accent-400 font-medium bg-accent-50 dark:bg-accent-900/10'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link 
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-base sm:text-lg font-medium transition-colors px-4 py-3 rounded ${
                        location.pathname === link.path 
                          ? 'text-accent-600 dark:text-accent-500 bg-accent-50 dark:bg-accent-900/10' 
                          : 'text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-white/10 pt-3 sm:pt-4 mt-3">
                <button 
                  onClick={() => {
                    setIsConsultationModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white rounded-md text-base sm:text-lg font-bold uppercase tracking-wider transition-all text-center min-h-[48px] sm:min-h-[52px] flex items-center justify-center"
                >
                  Get in touch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* Consultation Form Modal */}
    <AnimatePresence>
      {isConsultationModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsConsultationModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-light-bg dark:bg-dark-bg rounded-2xl shadow-2xl relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsConsultationModalOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 md:p-10 pt-12 sm:pt-14 max-h-[80vh] overflow-y-auto">
              <ConsultationForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );};