import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Building2, 
  Users, 
  Target,
  Sparkles,
  ArrowRight,
  Quote
} from 'lucide-react';

/**
 * About Us - Success Stories Page - Redesigned
 */
export const AboutSuccessStories = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Industry color mappings with icons
  const industryColors = {
    'Banking & Finance': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: Building2 },
    'Conglomerate': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: Target },
    'IT & Technology': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: TrendingUp },
    'IT Services': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: Award }
  };

  const successStories = [
    {
      title: "Conversion of Defined Benefit Pension Plan (DB) to Defined Contribution Plan (DC) of a Foreign Bank",
      description: "The foreign bank wanted to convert its existing DB Pension Plan to a DC setup. The engagement included:",
      details: [
        "Determination of current liability and additional cost after considering full service pension before and after retirement",
        "Detailed scenario analysis across multiple cost situations for DB to DC conversion",
        "Support on setup and implementation of the conversion"
      ],
      outcome: "The engagement was completed over a 6-month period, covering due diligence, setup, and handover of implemented processes and policies, including communication initiatives and change-management workshops.",
      industry: "Banking & Finance" as keyof typeof industryColors,
      metrics: { percentage: '95%', label: 'Success Rate', change: '6 Months' }
    },
    {
      title: "Valuation for a Large Conglomerate with Multiple Entities and Frequent Employee Movement",
      description: "The company faced challenges in financial reporting for employee benefits. UAC provided actuarial and retirement consulting across 10 entities and 8 benefit plans under Local and US GAAP.",
      details: [
        "Timely and structured valuation process improvements",
        "Quarterly budgeting support",
        "Active resolution of auditor queries",
        "Development of an ongoing advisory partnership",
        "Cost impact analysis for benefit changes"
      ],
      outcome: "Successfully managed valuations across all entities with seamless coordination and audit compliance.",
      industry: "Conglomerate" as keyof typeof industryColors,
      metrics: { percentage: '10', label: 'Entities', change: '8 Plans' }
    },
    {
      title: "Cost Impact Analysis and Redesign of the Leave Policy",
      description: "A large multinational IT company required a global review of its leave policy to assess utilization, separation costs, encashment, and retirement impact.",
      details: [
        "Cost and utilization analysis of existing leave policies",
        "Redesigned leave framework aligned with country-specific regulations",
        "Achieved cost savings while maintaining market competitiveness",
        "Streamlined leave valuation process for improved predictability"
      ],
      outcome: "Reduced projected leave encashment liabilities by 35% while maintaining employee satisfaction.",
      industry: "IT & Technology" as keyof typeof industryColors,
      metrics: { percentage: '35%', label: 'Cost Saved', change: 'Global' }
    },
    {
      title: "Compliance and Governance Audit: Large Multinational IT Services Company",
      description: "A multinational IT services organization required a comprehensive compliance and governance audit of its retirement plans, including service provider processes and SLAs.",
      details: [
        "End-to-end audit covering compliance, accounting, investments, transactions, provider capability, SLAs, and workflows",
        "Gap analysis with board-level recommendations",
        "Design and implementation of a future-ready governance framework for trust operations"
      ],
      outcome: "Identified and resolved all compliance gaps, establishing robust governance frameworks.",
      industry: "IT Services" as keyof typeof industryColors,
      metrics: { percentage: '100%', label: 'Compliance', change: 'Zero Gaps' }
    }
  ];

  const goToSlide = (index: number, dir: number) => {
    setDirection(dir);
    setActiveIndex(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % successStories.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + successStories.length) % successStories.length);
  };

  useEffect(() => {
    autoPlayRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  const currentStory = successStories[activeIndex];
  const IndustryIcon = industryColors[currentStory.industry].icon;

  return (
    <div ref={containerRef} className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section with Modern Design */}
      <section className="relative py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 mb-6"
            >
              <Award className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-accent-600 dark:text-accent-400">
                Client Success Stories
              </span>
            </motion.div> */}

             <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Success
              <span className="text-accent-600 dark:text-accent-500"> Stories</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Real results from real partnerships. Explore how we've helped organizations 
              navigate complex actuarial challenges and achieve measurable outcomes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Carousel Section */}
      <section className="relative py-8 md:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Modern Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute -left-2 md:left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute -right-2 md:right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
            </button>

            {/* Enhanced Carousel Content */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 300 : -300, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction > 0 ? -300 : 300, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
                  className="w-full"
                >
                  <div className="relative bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Decorative Top Border with Industry Color */}
                    <div className={`h-1 bg-gradient-to-r ${
                      currentStory.industry === 'Banking & Finance' ? 'from-blue-500 to-blue-600' :
                      currentStory.industry === 'Conglomerate' ? 'from-purple-500 to-purple-600' :
                      currentStory.industry === 'IT & Technology' ? 'from-green-500 to-green-600' :
                      'from-orange-500 to-orange-600'
                    }`} />

                    {/* Card Content */}
                    <div className="p-3 md:p-6 lg:p-8">
                      {/* Header with Industry Badge and Icon */}
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                        <div className="flex-1">
                          {/* Industry Badge with Icon */}
                          <div className={`inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full ${industryColors[currentStory.industry].bg} border ${industryColors[currentStory.industry].border} mb-2 md:mb-3`}>
                            <IndustryIcon className={`w-3 h-3 md:w-4 md:h-4 ${industryColors[currentStory.industry].text}`} />
                            <span className={`text-xs font-semibold ${industryColors[currentStory.industry].text}`}>
                              {currentStory.industry}
                            </span>
                          </div>

                          <h2 className="text-base md:text-lg lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3 leading-tight">
                            {currentStory.title}
                          </h2>

                          <p className="text-xs md:text-sm lg:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3 md:mb-4">
                            {currentStory.description}
                          </p>
                        </div>

                        {/* Metrics Card */}
                        <div className={`flex lg:flex-col items-center justify-center gap-2 lg:gap-0 lg:w-24 lg:h-24 xl:w-32 xl:h-32 px-3 py-2 lg:p-0 rounded-lg lg:rounded-xl ${industryColors[currentStory.industry].bg} border ${industryColors[currentStory.industry].border}`}>
                          <div className={`text-xl md:text-2xl lg:text-3xl font-bold ${industryColors[currentStory.industry].text} lg:mb-2`}>
                            {currentStory.metrics.percentage}
                          </div>
                          <div className="flex lg:flex-col items-center lg:items-center gap-1">
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center">
                              {currentStory.metrics.label}
                            </div>
                            <div className={`text-xs font-semibold ${industryColors[currentStory.industry].text}`}>
                              {currentStory.metrics.change}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Outcomes with Enhanced Design */}
                      <div className="space-y-2 mb-3 md:mb-4">
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2 md:mb-3">
                          <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent-500" />
                          Key Outcomes
                        </h4>
                        <div className="grid gap-2">
                          {currentStory.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 hover:border-accent-500/30 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Outcome Section */}
                      {currentStory.outcome && (
                        <div className="relative p-3 md:p-4 rounded-xl bg-gradient-to-br from-accent-50 to-blue-50 dark:from-accent-900/20 dark:to-blue-900/20 border border-accent-200/50 dark:border-accent-700/50">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h5 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white mb-1 md:mb-2">
                                Impact
                              </h5>
                              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {currentStory.outcome}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Enhanced Dot Navigation */}
            <div className="flex justify-center items-center gap-2 mt-4 md:mt-6">
              {successStories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index, index > activeIndex ? 1 : -1)}
                  className={`transition-all ${
                    index === activeIndex
                      ? 'w-8 h-2 bg-accent-500 rounded-full'
                      : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full hover:bg-accent-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

