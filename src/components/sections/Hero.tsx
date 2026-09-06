import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useIsMobile, useShouldReduceMotion } from '../../utils/useDevice';
import { optimizeImage, getInsightImageUrl } from '../../utils/imageUtils';
import { ArrowRight, TrendingUp, ShieldCheck, FileText } from 'lucide-react';
import { insightsService } from '../../admin/services/insightsService';
import { CheckCircle2} from 'lucide-react';
import { Mail } from "lucide-react";


// Interface for insight data
interface InsightCard {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  image?: string;
  featuredImage?: string;
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  pdfFilename?: string;
  featured?: boolean;
}

/**
 * Hero Section
 */
export const Hero = () => {
  const isMobile = useIsMobile();
  const shouldReduce = useShouldReduceMotion();
  const disableParallax = isMobile || shouldReduce;
  
  // Always call useScroll to comply with Rules of Hooks
  const { scrollY } = useScroll();

  // Enhanced Parallax Effects - Always call hooks, but use them conditionally
  const y1 = useTransform(scrollY, [0, 500], [0, disableParallax ? 0 : 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, disableParallax ? 0 : -150]);
  const yBg = useTransform(scrollY, [0, 1000], [0, disableParallax ? 0 : 300]);
  const xBg = useTransform(scrollY, [0, 1000], [0, disableParallax ? 0 : -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, disableParallax ? 1 : 0]);
  const scale = useTransform(scrollY, [0, 300], [1, disableParallax ? 1 : 0.95]);
  
  // Fallback insights in case API fails or no data available
  const fallbackInsights: InsightCard[] = [
    {
      id: 'fallback-1',
      category: "Market Analysis",
      title: "Navigating Volatility in 2024 Global Markets",
      image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    },
    {
      id: 'fallback-2',
      category: "AI & Risk",
      title: "The Algorithmic Future of Insurance Underwriting",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    },
    {
      id: 'fallback-3',
      category: "Sustainability",
      title: "Green Bonds: A Strategic Asset for Growth",
      image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800",
      createdAt: new Date().toISOString()
    }
  ];

  // Carousel State with dynamic insights - Initialize with fallback data for iOS Safari compatibility
  const [currentInsight, setCurrentInsight] = useState(0);
  const [insights, setInsights] = useState<InsightCard[]>(fallbackInsights.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest insights on component mount - non-blocking for iOS Safari compatibility
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch latest insights (limit to 4, prioritize featured and recent)
        const response = await insightsService.getPublicInsights({
          limit: 4,
          sort: 'newest'
        });
        
        const publishedInsights = response.insights
          .filter((insight: any) => insight.published)
          .slice(0, 4); // Ensure max 4 insights
        
        if (publishedInsights.length > 0) {
          setInsights(publishedInsights);
        }
        
      } catch (error) {
        console.error('Failed to load hero insights:', error);
        setError('Failed to load insights');
        // Keep fallback insights that were initialized
      } finally {
        setLoading(false);
      }
    };
    
    // Non-blocking call - component will render with fallback data immediately
    loadInsights().catch(err => console.error('Insights load error:', err));
  }, []);

  // Carousel timer with insights length check
  useEffect(() => {
    if (insights.length === 0) return;
    
    const intervalDuration = isMobile ? 8000 : 5000;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return; // pause when tab is hidden
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, intervalDuration);
    return () => clearInterval(timer);
  }, [insights.length, isMobile]);

  // Helper functions
  const formatDate = (insight: InsightCard) => {
    const date = new Date(insight.publishDate || insight.publishedAt || insight.createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 Day ago';
    if (diffInDays < 7) return `${diffInDays} Days ago`;
    if (diffInDays < 14) return '1 Week ago';
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} Weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInsightImage = (insight: InsightCard) => {
    return getInsightImageUrl(insight);
  };

  const handleNewsletterClick = () => {
    const footerElement = document.getElementById('footer');
    if (footerElement) {
      footerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Show loading skeleton or fallback if no insights
  const displayInsights = loading ? fallbackInsights.slice(0, 3) : insights;
  const currentInsightData = displayInsights[currentInsight] || fallbackInsights[0];

  // Handle insight card click
  const handleInsightClick = (insight: InsightCard) => {
    // For PDF insights, fetch clean PDF URL from backend and open in new tab
    if (insight.pdfFilename && (insight._id || insight.id)) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://uabc-pkg3.onrender.com/api';
      const pdfEndpoint = `${apiUrl}/pdf-insights/${insight._id || insight.id}/pdf`;
      
      fetch(pdfEndpoint)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.pdfUrl) {
            console.log('Opening PDF:', data.pdfUrl);
            window.open(data.pdfUrl, '_blank');
          } else {
            console.error('Failed to get PDF URL:', data.message);
          }
        })
        .catch(error => {
          console.error('Error fetching PDF URL:', error);
        });
    } else if (insight._id || insight.id) {
      // For regular insights, navigate to insights page or detail (implement as needed)
      window.location.href = '/insights';
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pb-6 sm:pb-0 overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      {/* Background Effects - Multi-directional Parallax */}
      <motion.div style={{ y: yBg, x: xBg }} className="absolute inset-0 z-0 pointer-events-none">
          {!disableParallax ? (
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
                x: [0, 20, -20, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 -left-4 w-96 h-96 bg-brand-500/10 dark:bg-brand-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"
              style={{ willChange: 'transform' }}
            />
          ) : (
            <div className="absolute top-0 -left-4 w-80 h-80 bg-brand-500/5 dark:bg-brand-900/5 rounded-full mix-blend-multiply opacity-20" />
          )}
          <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0],
            y: [0, 30, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className={"absolute top-1/4 right-0 w-96 h-96 bg-accent-500/10 dark:bg-accent-900 rounded-full mix-blend-multiply dark:mix-blend-screen " + (disableParallax ? 'opacity-10 blur-sm' : 'filter blur-[100px] opacity-20 dark:opacity-10')}
            style={{ willChange: 'transform' }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, -30, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={"absolute -bottom-8 left-1/3 w-72 h-72 bg-brand-300/10 dark:bg-brand-800 rounded-full mix-blend-multiply dark:mix-blend-screen " + (disableParallax ? 'opacity-15 blur-sm' : 'filter blur-[100px] opacity-30 dark:opacity-20')}
          style={{ willChange: 'transform' }}
        />
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center py-4 sm:py-8 lg:py-10">
        <motion.div className="space-y-3 sm:space-y-5 md:space-y-6" style={{ opacity, scale }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 backdrop-blur-sm">
               <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
               <span className="text-brand-900 dark:text-brand-200 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                Global Consulting Leaders
               </span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white"
          >
            Offering a wide range of <br />
            
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-brand-600 dark:from-accent-500 dark:to-brand-400">Actuarial &amp; Benefit </span>
            <span className="text-brand-950 dark:text-slate-200">
               Services
            </span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl space-y-2 sm:space-y-4"
          >
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-accent-500/30 pl-3 sm:pl-4">
             Universal Actuaries and Consultants LLP (UAC) is an ISO 27001:2022–certified Actuarial and Benefits Consulting Firm serving clients across India and globally. With over 80 years of combined relevant experience, we bring deep industry knowledge and expertise, delivering high-quality services with a singular focus on enhancing client value and experience.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-xs md:text-sm">

  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 shrink-0" />
    <span>Global Expertise, Local Insight</span>
  </div>

  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 shrink-0" />
    <span>Data-Driven Decision Making</span>
  </div>

  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 shrink-0" />
    <span>Long-term Financial Sustainability</span>
  </div>

  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 shrink-0" />
    <span>Comprehensive Risk Management</span>
  </div>

</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-1"
          >
            <a href="/about" className="group px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-dark-bg font-bold rounded-md flex items-center justify-center sm:justify-start gap-2 hover:bg-accent-600 dark:hover:bg-slate-200 transition-colors shadow-lg hover:shadow-accent-500/25 text-xs sm:text-sm">
              Explore 
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-accent-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </motion.div>

        <div className="relative h-[300px] sm:h-[400px] md:h-[450px] w-full perspective-1000 hidden md:block">
           {/* Geometric composition mimicking data/structure */}
           <motion.div
             style={{ y: y1, rotate: 0 }}
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="relative w-full h-full"
           >
              {/* Main Card */}
              <div className="absolute top-10 left-10 right-10 bottom-10 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] z-10 hover:shadow-2xl transition-shadow duration-500 flex flex-col overflow-hidden">
                 <div className="flex justify-between items-center mb-6 relative z-20">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-lg border border-brand-500/20">
                          <FileText className="text-brand-600 dark:text-brand-400 w-5 h-5" />
                       </div>
                       <span className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Latest Insights</span>
                    </div>
                    <div className="flex gap-1">
                      {displayInsights.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentInsight ? 'w-6 bg-accent-500' : 'w-1.5 bg-slate-300 dark:bg-white/20'}`} />
                      ))}
                    </div>
                 </div>
                 
                 {/* Carousel Content */}
                 <div className="relative flex-1 rounded-xl overflow-hidden w-full h-full group">
                    <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentInsight}-${currentInsightData?._id || currentInsightData?.id}`}
                  initial={disableParallax ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
                  animate={disableParallax ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={disableParallax ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: disableParallax ? 0.2 : 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInsightClick(currentInsightData)}
                  className="absolute inset-0 cursor-pointer"
                >
                              <img 
                                loading="lazy"
                                src={optimizeImage(getInsightImage(currentInsightData), isMobile)}
                                alt={currentInsightData?.title || 'Insight'}
                                onError={(e) => {
                                  const imgSrc = getInsightImage(currentInsightData);
                                  console.log('Hero image failed to load:', imgSrc);
                                  console.log('Current insight data:', { title: currentInsightData?.title, featuredImage: currentInsightData?.featuredImage, image: currentInsightData?.image });
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800';
                                }}
                                className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${loading ? 'animate-pulse bg-slate-200 dark:bg-slate-700' : ''}`}
                              />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
                          
                          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                             <motion.div 
                               initial={{ y: 20, opacity: 0 }}
                               animate={{ y: 0, opacity: 1 }}
                               transition={{ delay: 0.2 }}
                             >
                               <div className={`inline-flex items-center gap-2 px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-white rounded-full shadow-lg ${currentInsightData?.pdfFilename ? 'bg-blue-600 shadow-blue-600/20' : 'bg-accent-600 shadow-accent-600/20'}`}>
                                  {currentInsightData?.pdfFilename && <FileText className="w-2.5 h-2.5" />}
                                  {currentInsightData?.category || 'Category'}
                               </div>
                               <h3 className={`text-xl md:text-2xl font-bold text-white leading-tight mb-3 drop-shadow-md ${loading ? 'animate-pulse' : ''}`}>
                                  {currentInsightData?.title || 'Loading...'}
                               </h3>
                               <p className="text-slate-300 text-xs flex items-center gap-2 font-medium">
                                  <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentInsightData?.featured ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${currentInsightData?.featured ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                  </span>
                                  {loading ? 'Loading...' : formatDate(currentInsightData)}
                               </p>
                             </motion.div>
                          </div>
                       </motion.div>
                    </AnimatePresence>
                 </div>
              </div>

              {/* Floating Element 1 - Dynamic Content Based on Current Insight */}
              <motion.div 
                style={{ y: y2 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                onClick={handleNewsletterClick}
                className="absolute -top-4 -right-4 w-48 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-xl z-20 cursor-pointer hover:shadow-2xl hover:border-accent-500/30 transition-all duration-300"
              >
                 <div className="flex items-center gap-3 mb-2">
  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
  </div>
                   <span className="text-sm font-bold text-slate-900 dark:text-white">
  Newsletter
</span>
</div>
<div className="text-xs text-slate-500">
  Subscribe to our newsletter for the latest updates.
</div>
              </motion.div>

              {/* Floating Element 2 - Category & Featured Status */}
              {/* <motion.div 
                style={{ y: useTransform(scrollY, [0, 500], [0, 50]) }}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 w-64 bg-white dark:bg-dark-card border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-xl z-20"
              >
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentInsightData?.featured ? 'bg-yellow-500/10 dark:bg-yellow-500/20' : 'bg-brand-500/10 dark:bg-brand-500/20'}`}>
                       <ShieldCheck className={`w-5 h-5 ${currentInsightData?.featured ? 'text-yellow-600 dark:text-yellow-400' : 'text-brand-600 dark:text-brand-400'}`} />
                    </div>
                    <div>
                       <div className="text-sm font-bold text-slate-900 dark:text-white">
                         {currentInsightData?.featured ? 'Featured Content' : currentInsightData?.category || 'Research'}
                       </div>
                       <div className="text-xs text-slate-500">
                         {currentInsightData?.featured ? 'Premium Analysis' : 'Expert Insights'}
                       </div>
                    </div>
                 </div>
              </motion.div> */}
           </motion.div>
        </div>
      </div>
    </section>
  );
};
