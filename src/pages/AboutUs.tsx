import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../utils/imageUtils';
import { useIsMobile } from '../utils/useDevice';
import { ScrollReveal, StaggerReveal } from '../components/PageTransition';
import { ConsultationForm } from '../components/ConsultationForm';
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Heart,
  BookOpen,
  Building2,
  Star,
  Briefcase,
  Clock,
  MapPin,
  Mail,
  Phone,
  Lightbulb,
  FileCheck,
  BarChart3,
  X
} from 'lucide-react';

/**
 * About Us Page Component - Redesigned
 */
export const AboutUs = () => {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Refs for parallax sections
  const overviewRef = useRef<HTMLDivElement>(null);
  const approachRef = useRef<HTMLDivElement>(null);
  const managementRef = useRef<HTMLDivElement>(null);
  const expertiseRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Parallax hooks
  const { scrollYProgress: overviewScroll } = useScroll({
    target: overviewRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: approachScroll } = useScroll({
    target: approachRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: managementScroll } = useScroll({
    target: managementRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: expertiseScroll } = useScroll({
    target: expertiseRef,
    offset: ["start end", "end start"]
  });
  const { scrollYProgress: ctaScroll } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });

  // Parallax transforms with enhanced effects - more visible movement
  const overviewY = useTransform(overviewScroll, [0, 1], isMobile ? [0, 0] : [80, -80]);
  const overviewScale = useTransform(overviewScroll, [0, 0.5, 1], [0.92, 1.03, 0.92]);
  const overviewOpacity = useTransform(overviewScroll, [0, 0.15, 0.85, 1], [0, 1, 1, 0.3]);
  
  const approachY = useTransform(approachScroll, [0, 1], isMobile ? [0, 0] : [100, -100]);
  const approachScale = useTransform(approachScroll, [0, 0.5, 1], [0.88, 1.05, 0.88]);
  
  const managementY = useTransform(managementScroll, [0, 1], isMobile ? [0, 0] : [60, -60]);
  const managementRotate = useTransform(managementScroll, [0, 1], isMobile ? [0, 0] : [-3, 3]);
  
  const expertiseY = useTransform(expertiseScroll, [0, 1], isMobile ? [0, 0] : [90, -90]);
  const expertiseScale = useTransform(expertiseScroll, [0, 0.5, 1], [0.82, 1.06, 0.82]);
  
  const ctaScale = useTransform(ctaScroll, [0, 0.5, 1], [0.88, 1.08, 1]);

  const expertiseAreas = [
    {
      icon: Award,
      title: "Actuarial Valuation",
      description: "Actuarial valuation of employee benefits schemes under Indian GAAP (AS 15 R / IND AS 19), IFRS (IAS 19), US GAAP (ASC 712, 715), PAS 19, NAS 19, SLAS 19 etc"
    },
    {
      icon: TrendingUp,
      title: "Employee Stock Options",
      description: "ESOP Design and valuation services under IND AS 102 including Share Appreciation Rights (SAR)"
    },
    {
      icon: Shield,
      title: "Insurance Consulting",
      description: "Life, General and Health Insurance including Risk management, Planning & Strategic consulting, Financial & statutory reporting"
    },
    {
      icon: Users,
      title: "Retirement Consulting",
      description: "Retirement plans setup, income adequacy check, governance of retirement trusts, compliance study of regulatory benefits"
    },
    {
      icon: Briefcase,
      title: "Benefits Consulting",
      description: "Benefits design, redesign, M&A in benefits, flexible benefits design, utilization, cost impact analysis and audits"
    },
    {
      icon: BarChart3,
      title: "Asset Liability Management",
      description: "ALM strategies for Employee Benefits and other relevant areas"
    },
    {
      icon: Globe,
      title: "Risk Management",
      description: "Business and investment consulting advisory services"
    }
  ];

  const differentiators = [
    {
      title: "Competency",
      points: [
        "Total experience of 80+ years",
        "Knowledgeable in all areas",
        "24 * 7 availability",
        "Cost efficient servicing",
        "Deeply Resourced"
      ],
      icon: Award,
      color: "text-blue-500"
    },
    {
      title: "Integrity",
      points: [
        "Maintain high ethical and Moral standards",
        "Every employee is Accountable",
        "Deliver results as promised",
        "Uncompromised professionalism",
        "No Short cuts"
      ],
      icon: Shield,
      color: "text-green-500"
    },
    {
      title: "Client Deliverables",
      points: [
        "Listening to the client needs",
        "Building lasting relationships",
        "Creating value to client",
        "Not Transactional"
      ],
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Quality & Culture",
      points: [
        "Open and honest work culture",
        "Maintaining confidentially at any cost",
        "Adopting best practices with quality",
        "Working as a team",
        "Building future leaders"
      ],
      icon: Star,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16">
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
              About Universal Actuaries and Consultants LLP
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Excellence in <br />
              <span className="text-accent-600 dark:text-accent-500">Actuarial Consulting</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              ISO 27001-2022 certified firm with 80+ years of combined experience, 
              serving clients across India and worldwide with unwavering commitment to quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section ref={overviewRef} className="py-12 md:py-16 lg:py-20 bg-light-bg dark:bg-dark-bg overflow-hidden">
        <motion.div 
          style={{ 
            y: overviewY,
            scale: overviewScale,
            opacity: isMobile ? 1 : overviewOpacity
          }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12 lg:mb-16"
            >
              <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
                Who We Are
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                About UABC
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 mb-16">
              {/* Company Introduction Card */}
              <motion.div
                initial={{ opacity: 0, x: -80, rotateY: -20 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ 
                  duration: 0.7,
                  type: "spring",
                  stiffness: 120,
                  damping: 18
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.02,
                  boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)",
                  transition: { duration: 0.3 }
                }}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-accent-600 dark:text-accent-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Our Company</h3>
                </div>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 md:mb-6">
                  Universal Actuaries and Consultants LLP (UABC) is an ISO 27001-2022 certified actuarial and Benefits consulting firm serving multiple clients in India and across the world. We have 80+ years of total experience delivering quality service with a singular objective to enhance client value and experience.
                </p>
                
                <div className="flex items-center gap-3 md:gap-4 p-4 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-accent-600 dark:text-accent-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">ISO 27001-2022 Certified</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Ensuring the highest standards of information security management</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 80, rotateY: 20 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ 
                  duration: 0.7,
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  delay: 0.15
                }}
                whileHover={{ 
                  y: -12,
                  scale: 1.03,
                  boxShadow: "0 30px 60px -15px rgba(99, 102, 241, 0.6)",
                  transition: { duration: 0.3 }
                }}
                className="bg-gradient-to-br from-accent-600 to-accent-500 rounded-2xl p-8 shadow-lg text-white"
              >
                <h3 className="text-xl font-bold mb-8">Our Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">80+</div>
                    <div className="text-accent-100 text-xs md:text-sm">Years of Combined Experience</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">100+</div>
                    <div className="text-accent-100 text-xs md:text-sm">Clients Served</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">10+</div>
                    <div className="text-accent-100 text-xs md:text-sm">Countries</div>
                  </div>
                  <div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">24/7</div>
                    <div className="text-accent-100 text-xs md:text-sm">Availability</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Expertise Areas */}
            <motion.div
              ref={expertiseRef}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-40px" }}
              transition={{ 
                duration: 0.7,
                type: "spring",
                stiffness: 100
              }}
              style={{ 
                y: expertiseY,
                scale: isMobile ? 1 : expertiseScale
              }}
              className="mb-8 text-center"
            >
              <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
                Areas of Expertise
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                What We Do
              </h2>
            </motion.div>

            <StaggerReveal staggerDelay={0.08} duration={0.5}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {expertiseAreas.map((area, index) => {
                  const IconComponent = area.icon;
                  return (
                    <motion.div
                      key={area.title}
                      initial={{ opacity: 0, y: 50, scale: 0.85 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: false, margin: "-40px" }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 120,
                        damping: 15
                      }}
                      whileHover={{ 
                        y: -15, 
                        scale: 1.06,
                        rotateY: 8,
                        boxShadow: "0 25px 50px -15px rgba(0, 0, 0, 0.25)",
                        transition: { duration: 0.25 } 
                      }}
                      className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl group hover:shadow-lg transition-all border border-slate-100 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-accent-600 dark:text-accent-500" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{area.title}</h3>
                      </div>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{area.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </StaggerReveal>
          </div>
        </motion.div>
      </section>

      {/* Approach Section */}
      <section ref={approachRef} className="py-12 md:py-16 lg:py-20 bg-slate-50 dark:bg-dark-card overflow-hidden">
        <motion.div 
          style={{ 
            y: approachY,
            scale: isMobile ? 1 : approachScale
          }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12 lg:mb-16"
            >
              <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
                Our Approach
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                What Makes Us Different
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                In today's world, financial risk, market instability and regulatory changes can make it difficult for a company to manage their Insurance, retirement and benefit programs. Our unique combination of expertise, integrity, and client focus sets us apart.
              </p>
            </motion.div>

            <StaggerReveal staggerDelay={0.1} duration={0.6}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {differentiators.map((diff, index) => {
                  const IconComponent = diff.icon;
                  return (
                    <motion.div
                      key={diff.title}
                      initial={{ opacity: 0, y: 70, rotateX: -15 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: false, margin: "-60px" }}
                      transition={{
                        duration: 0.65,
                        delay: index * 0.12,
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }}
                      whileHover={{ 
                        y: -18, 
                        scale: 1.06,
                        rotateY: 8,
                        boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.3)",
                        transition: { duration: 0.25 } 
                      }}
                      className="bg-white dark:bg-dark-bg p-4 md:p-8 rounded-2xl group hover:shadow-xl transition-all"
                    >
                      <motion.div
                        className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 md:mb-6 mx-auto"
                        whileHover={{ rotate: 360, scale: 1.1, transition: { duration: 0.5 } }}
                      >
                        <IconComponent className={`w-6 h-6 md:w-8 md:h-8 ${diff.color}`} />
                      </motion.div>
                      <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4 text-center">{diff.title}</h4>
                      <ul className="space-y-1.5 md:space-y-2">
                        {diff.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-accent-600 dark:text-accent-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </StaggerReveal>
          </div>
        </motion.div>
      </section>

      {/* Management Section */}
      <section ref={managementRef} className="py-12 md:py-16 lg:py-20 bg-light-bg dark:bg-dark-bg overflow-hidden">
        <motion.div 
          style={{ 
            y: managementY,
            rotate: isMobile ? 0 : managementRotate
          }}
        >
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12 lg:mb-16"
            >
              <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
                Leadership
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                Meet Our Founder
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.88 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 90,
                damping: 18
              }}
              className="max-w-6xl mx-auto"
            >
              {/* Main Profile Card */}
              <motion.div 
                whileHover={{ 
                  scale: 1.03,
                  y: -5,
                  boxShadow: "0 35px 70px -20px rgba(0, 0, 0, 0.35)",
                  transition: { duration: 0.35 }
                }}
                className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 lg:p-12 shadow-lg mb-8 md:mb-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
                  {/* Photo */}
                  <div className="lg:col-span-1">
                    <div className="relative">
                      <div className="w-full aspect-square bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-2xl flex items-center justify-center overflow-hidden">
                        <Users className="w-24 h-24 text-accent-600 dark:text-accent-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="lg:col-span-2">
                    <div className="mb-4 md:mb-6">
                      <h4 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Chitra Jayasimha</h4>
                      <p className="text-accent-600 dark:text-accent-500 font-semibold text-base md:text-xl mb-4 md:mb-6">Founder & CEO</p>
                      
                      <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs md:text-sm font-bold text-blue-800 dark:text-blue-300">FIA</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                          <span className="text-xs md:text-sm font-bold text-green-800 dark:text-green-300">FIAI</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs md:text-sm font-bold text-purple-800 dark:text-purple-300">FIII</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs md:text-sm font-bold text-orange-800 dark:text-orange-300">35+ Years</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4">
                      <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                        Chitra is a Senior Consulting Actuary and Founder of Universal Actuaries and Consultants LLP with 35 plus years of experience in Life Insurance, General Insurance, Health Insurance, Pension, Retirement and Benefits.
                      </p>
                      
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        She is a Fellow of the Institute and Faculty of Actuaries, UK (FIA), Fellow of the Institute of Actuaries of India (FIAI) and Fellow of the Insurance Institute of India (FIII). She is a member of the Advisory Group on Pension, Employee Benefits and Social Security Schemes of the Institute of Actuaries of India. She is also the appointed actuary of Samina Life, Nepal.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Experience Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  {
                    icon: Shield,
                    title: "Insurance Expertise",
                    description: "Extensive work in Life, General, Health Insurance & Reinsurance including costing, pricing, valuation, and economic capital."
                  },
                  {
                    icon: Users,
                    title: "Employee Benefits",
                    description: "Expert in actuarial valuations under Indian GAAP, IFRS, US GAAP & other country-specific local GAAPs."
                  },
                  {
                    icon: Briefcase,
                    title: "Benefits Consulting",
                    description: "M&A deals, due diligence, retirement solutions, benefits design, and redesigns."
                  },
                  {
                    icon: Building2,
                    title: "Previous Organizations",
                    description: "Aon Consulting, Mercer Consulting, Swiss Re India, Paternoster (UK), ING Life and LIC of India."
                  }
                ].map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 60, scale: 0.75 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: false, margin: "-40px" }}
                      transition={{ 
                        duration: 0.65, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 110,
                        damping: 15
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.06,
                        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.25)",
                        transition: { duration: 0.25 }
                      }}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                        <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-accent-600 dark:text-accent-500" />
                      </div>
                      <h6 className="font-bold text-slate-900 dark:text-white mb-2 text-xs md:text-sm">{item.title}</h6>
                      <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-16 md:py-20 lg:py-24 bg-gradient-to-r from-accent-600 to-accent-500 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.85 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ 
              duration: 0.75,
              type: "spring",
              stiffness: 100,
              damping: 18
            }}
            style={{ scale: isMobile ? 1 : ctaScale }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 md:mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-accent-100 mb-6 md:mb-8 max-w-2xl mx-auto">
              Let's discuss how our expertise can help solve your actuarial and benefits challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <button 
                onClick={() => setIsConsultationModalOpen(true)}
                className="inline-block px-6 md:px-8 py-3 md:py-4 bg-white text-accent-600 rounded-lg font-bold text-base md:text-lg hover:bg-accent-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-center"
              >
                Get in touch
              </button>
              <Link to="/services" className="inline-block px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white rounded-lg font-bold text-base md:text-lg hover:bg-white hover:text-accent-600 transition-all text-center">
                Explore Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Consultation Modal */}
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
    </div>
  );
};