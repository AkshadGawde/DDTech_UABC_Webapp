import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/PageTransition';
import { PageLoader } from './components/PageLoader';
import { Home, AboutUs, AboutOverview, AboutApproach, AboutManagement, AboutSuccessStories, Team, ServicesPage, EmployeeBenefits, Insights, InsightsCategory, Careers, ContactUs, InsuranceConsulting, RetirementConsulting, BenefitConsulting, TestBlog } from './pages';
import { AuthProvider } from './admin/hooks/useAuth';
import { AdminLogin } from './admin/pages/AdminLogin';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { InsightEditor } from './admin/pages/InsightEditor';
import { InsightPreview } from './admin/pages/InsightPreview';
import { ProtectedRoute } from './admin/components/ProtectedRoute';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'react-hot-toast';
import './global.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Main App Component
 */
const App = () => {
  const [theme, setTheme] = useState(() => {
    // Default to light mode, but respect saved preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Show loading screen only once on initial app load
  // useEffect(() => {
  //   const hasLoaded = sessionStorage.getItem('app-loaded');
  //   
  //   if (!hasLoaded) {
  //     // Create loading screen
  //     const loader = document.createElement('div');
  //     loader.id = 'app-loader';
  //     loader.style.cssText = `
  //       position: fixed;
  //       top: 0;
  //       left: 0;
  //       width: 100%;
  //       height: 100%;
  //       background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  //       z-index: 99999;
  //       display: flex;
  //       align-items: center;
  //       justify-content: center;
  //       transition: opacity 0.5s ease;
  //     `;
  //     loader.innerHTML = `
  //       <div style="text-align: center;">
  //         <div style="width: 60px; height: 60px; border: 4px solid rgba(255, 255, 255, 0.1); border-top-color: #2563EB; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
  //         <div style="color: white; margin-top: 20px; font-size: 16px; font-weight: 600; letter-spacing: 2px;">Loading...</div>
  //       </div>
  //     `;
  //     
  //     const style = document.createElement('style');
  //     style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  //     document.head.appendChild(style);
  //     document.body.appendChild(loader);
  //     
  //     // Scroll to top immediately
  //     window.scrollTo(0, 0);
  //     
  //     // Remove loader after a short delay
  //     setTimeout(() => {
  //       loader.style.opacity = '0';
  //       setTimeout(() => {
  //         loader.remove();
  //         style.remove();
  //         sessionStorage.setItem('app-loaded', 'true');
  //       }, 500);
  //     }, 800);
  //   } else {
  //     // Ensure scroll to top even if loader is skipped
  //     window.scrollTo(0, 0);
  //   }
  // }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <PageLoader />
        <div className="antialiased min-h-screen font-sans selection:bg-accent-500/30 selection:text-accent-900 dark:selection:text-white bg-light-bg dark:bg-dark-bg">
          <ScrollToTop />
          
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/insights/new" 
              element={
                <ProtectedRoute>
                  <InsightEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/insights/edit/:id" 
              element={
                <ProtectedRoute>
                  <InsightEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/insights/preview/:id" 
              element={
                <ProtectedRoute>
                  <InsightPreview />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Routes */}
            <Route 
              path="/*" 
              element={
                <>
                  <Navbar 
                    isDark={theme === 'dark'} 
                    toggleTheme={toggleTheme}
                  />
                  <main className="pt-[72px] w-full bg-light-bg dark:bg-dark-bg">
                    <PageTransition transitionType="fade">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutOverview />} />
                        <Route path="/about/approach" element={<AboutApproach />} />
                        <Route path="/about/management" element={<AboutManagement />} />
                        <Route path="/about/success-stories" element={<AboutSuccessStories />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/services/employee-benefits" element={<EmployeeBenefits />} />
                        <Route path="/services/insurance-consulting" element={<InsuranceConsulting />} />
                        <Route path="/services/retirement-consulting" element={<RetirementConsulting />} />
                        <Route path="/services/benefit-consulting" element={<BenefitConsulting />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/insights/:category" element={<InsightsCategory />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/test-blog" element={<TestBlog />} />
                      </Routes>
                    </PageTransition>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
