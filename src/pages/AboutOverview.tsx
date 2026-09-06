import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ConsultationForm } from '../components/ConsultationForm';
import { Counter } from '../components/ui/Counter';
import { 
  CheckCircle2, 
  Award, 
  Target, 
  TrendingUp, 
  Shield, 
  Users, 
  Zap, 
  Globe, 
  Building2,
  Briefcase,
  BarChart3,
  Heart,
  Star,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';

/**
 * About Us - Overview Page - Redesigned with Modern UI
 */
export const AboutOverview = () => {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  const expertiseAreas = [
    {
      icon: Award,
      title: "Actuarial Valuation",
      description: "Actuarial valuation of employee benefits schemes under Indian GAAP (AS 15 R / IND AS 19), IFRS (IAS 19), US GAAP (ASC 712, 715), PAS 19, NAS 19, SLAS 19 etc",
      color: "blue"
    },
    {
      icon: Briefcase,
      title: "ESOP Services",
      description: "Employee Stock Options (ESOP) Design and valuation services under IND AS 102 including Share Appreciation Rights (SAR)",
      color: "purple"
    },
    // {
    //   icon: Shield,
    //   title: "Insurance Consulting",
    //   description: "Life, General and Health Insurance including Risk management, Planning & Strategic consulting, Financial & statutory reporting",
    //   color: "green"
    // },
    {
      icon: Users,
      title: "Retirement Consulting",
      description: "Retirement plans setup, income adequacy check, Governance of retirement trusts, Compliance study of Regulatory benefits",
      color: "orange"
    },
    {
      icon: Heart,
      title: "Benefits Consulting",
      description: "Benefits design, Redesign, M&A in benefits, Flexible Benefits design, Benefits utilization, cost impact analysis and audits",
      color: "red"
    },
    {
      icon: BarChart3,
      title: "Asset Liability Management",
      description: "ALM strategies for Employee Benefits and other relevant areas",
      color: "indigo"
    },
    {
      icon: Globe,
      title: "Risk Management",
      description: "Business and investment consulting advisory services",
      color: "cyan"
    }
  ];

  const stats = [
    { value: 80, suffix: "+", label: "Years Combined Experience", icon: Star, color: "text-yellow-500" },
    { value: 2500, suffix: "+", label: "Clients Served", icon: Users, color: "text-blue-500" },
    { value: 25, suffix: "+", label: "Countries", icon: Globe, color: "text-green-500" },
    { value: 750, suffix: "+", label: "Research Reports", icon: Zap, color: "text-purple-500" }
  ];

  const coreValues = [
  {
    icon: TrendingUp,
    title: "Current & Future-Ready",
    description:
      "With us as your partner, your business is not only compliant today but also prepared for tomorrow by providing accurate and valuation of your statutory liabilities pertaining to employee benefits.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Award,
    title: "Excellence in Service",
    description:
      "Our commitment to adhering to the highest industry standards always guarantees unparalleled service quality. We aim at perfection but tolerate excellence.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Efficiency at its Best",
    description:
      "We pride ourselves on delivering the Quick turnaround times, enabling your business to move forward without compromising on quality and comprehensiveness.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: ShieldCheck,
    title: "Certified Security",
    description:
      "As an ISO 27001:2022 certified partner, we prioritize the protection and integrity of your data. Ensuring compliance, efficiency and accountability across operations.",
    gradient: "from-red-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Experienced Leadership",
    description:
      "With over 80 years of relevant, combined experience, we bring deep industry knowledge and expertise to every partnership.",
    gradient: "from-red-500 to-orange-500"
  }
];

  return (
    <div ref={containerRef} className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ y: yParallax }}
      >
        <div className="absolute top-20 -left-20 w-96 h-96 bg-accent-400/10 dark:bg-accent-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-10 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </motion.div>

      {/* Hero Section - Asymmetric Design */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-accent-100 dark:bg-accent-900/30 px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-accent-600 dark:text-accent-500" />
                <span className="text-sm font-bold text-accent-700 dark:text-accent-400">ISO 27001-2022 Certified</span>
              </motion.div>
              
              <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                Delivering Actuarial Excellence
                <span className="block text-accent-600 dark:text-accent-500">with Impact</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                With 80+ years of combined expertise, we're pioneering the future of actuarial and benefits consulting across India and globally.
              </p>


            </motion.div>

            {/* Right: Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Floating Cards */}
              <div className="relative w-full h-[500px]">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-64 h-48 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl shadow-2xl p-6 text-white"
                >
                  <Award className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Certified Excellence</h3>
                  <p className="text-sm text-accent-100">ISO 27001-2022 Certified</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-40 left-0 w-64 h-48 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-2xl p-6 text-white"
                >
                  <Globe className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Global Reach</h3>
                  <p className="text-sm text-blue-100">Serving 25+ Countries</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-0 right-10 w-64 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white"
                >
                  <Users className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Trusted Partner</h3>
                  <p className="text-sm text-purple-100">2500+ Happy Clients</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Grid */}
      <section className="py-16 bg-white dark:bg-dark-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-50/50 via-transparent to-blue-50/50 dark:from-accent-900/10 dark:via-transparent dark:to-blue-900/10" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Impact in <span className="text-accent-600 dark:text-accent-500">Numbers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center group hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 ${stat.color} bg-opacity-10 dark:bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                  </motion.div>
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-accent-600 dark:group-hover:text-accent-500 transition-colors">
                    <Counter from={0} to={stat.value} duration={2.5} />{stat.suffix}
                  </div>
                  <div className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About UABC - Feature Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-accent-100 dark:bg-accent-900/30 px-4 py-2 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-accent-600 dark:text-accent-500" />
                <span className="text-sm font-bold text-accent-700 dark:text-accent-400">About UAC</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
Turning Complexity                <span className="block text-accent-600 dark:text-accent-500"> into Clarity
</span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                At Universal Actuaries and Consultants LLP (UAC), we empower organizations to make confident, future-ready decisions through rigorous analysis and ethical advisory practices. Our approach blends technical precision with a deep understanding of business realities, ensuring solutions that are practical, transparent, and value focused.
                <br/>
                <br/>
                We believe actuarial science is more than numbers — it is about responsibility, trust, and long-term impact.

              </p>

              <div className="space-y-4">
                {[
                  "Client-first, value-driven engagement model",
                  "Integrity and transparency at every step",
                  "Insight-led strategies backed by strong analytics",
                  "Long-term partnerships built on trust"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-accent-600 dark:text-accent-500" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-8 text-white shadow-2xl"
                >
                  <Target className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Our Mission</h3>
                  <p className="text-sm text-accent-100">Delivering exceptional value through expertise</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-8 text-white shadow-2xl mt-12"
                >
                  <TrendingUp className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Our Vision</h3>
                  <p className="text-sm text-blue-100">Global leader in actuarial excellence</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values - Bento Grid */}
<section className="py-20 bg-slate-50 dark:bg-dark-card">
  <div className="container mx-auto px-6">

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        Who We <span className="text-accent-600 dark:text-accent-500">Are</span>
      </h2>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        The principles that guide everything we do
      </p>
    </motion.div>

    <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6">
      {coreValues.map((value, index) => {
        const IconComponent = value.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`group relative 
              lg:col-span-2 
              ${index === 3 ? "lg:col-start-2" : ""}
            `}
          >
            {/* Hover Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}
            />

            {/* Card */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-all border border-slate-200 dark:border-slate-700">

              <div className="flex items-center gap-4 mb-6">
                <div
  className={`w-12 h-12 rounded-xl flex items-center justify-center 
  bg-slate-100 dark:bg-slate-700
  group-hover:bg-accent-50 dark:group-hover:bg-slate-600
  transition-all duration-300 flex-shrink-0`}
>
  <IconComponent className="w-6 h-6 text-accent-600 dark:text-accent-400 group-hover:scale-110 transition-transform" />
</div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {value.title}
                </h3>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {value.description}
              </p>

            </div>
          </motion.div>
        );
      })}
    </div>

  </div>
</section>

      {/* Expertise Areas - Modern Card Grid */}
      {/* <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our <span className="text-accent-600 dark:text-accent-500">Expertise</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive solutions across all areas of actuarial and benefits consulting
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseAreas.map((area, index) => {
              const IconComponent = area.icon;
              const colorMap = {
                blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
                purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
                green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
                orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
                red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
                indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
                cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" }
              };
              const colors = colorMap[area.color as keyof typeof colorMap];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <div className={`bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 ${colors.border} h-full`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <IconComponent className={`w-7 h-7 ${colors.text}`} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{area.title}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{area.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-accent-600 via-accent-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
             Ready to Get Started?
            </h2>
            <p className="text-xl text-accent-100 mb-10 max-w-2xl mx-auto">
              Let’s discuss how our expertise can support smarter decision-making
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => setIsConsultationModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-accent-600 rounded-xl font-bold text-lg hover:bg-accent-50 transition-all shadow-2xl"
              >
                Get in touch
              </motion.button>
              <Link to="/services">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-accent-600 transition-all"
                >
                  View Our Services
                </motion.button>
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
