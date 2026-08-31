import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Shield, Heart, Star } from 'lucide-react';

/**
 * About Us - Our Approach Page
 */
export const AboutApproach = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacityBackground = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 0.3]);
  
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
    <div ref={containerRef} className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16 relative overflow-hidden">
      {/* Parallax Background Element */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: yBackground, opacity: opacityBackground }}
      >
        <div className="absolute top-20 left-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto relative z-10"
          >
            {/* <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
              About Universal Actuaries and Consultants LLP
            </div> */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Our 
              <span className="text-accent-600 dark:text-accent-500"> Approach</span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              What makes us different in delivering innovative solutions and client-focused strategies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="space-y-12">
            {/* Approach Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 shadow-lg"
            >
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6">Our Approach</h3>
              <p className="text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 md:mb-8">
                The ever-changing economic and geopolitical landscape continues to create financial risks and uncertainties that businesses must carefully navigate.
Employee-related liabilities remain one of the most critical aspects of any organization, directly influencing its reputation, credibility, and brand value.
Our approach is designed to safeguard your company against such contingencies, ensuring stability, compliance, and long-term resilience.
              </p>
              
              <div className="bg-gradient-to-r from-accent-50 to-blue-50 dark:from-accent-900/20 dark:to-blue-900/20 rounded-xl p-4 md:p-6">
                <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">What Makes Us Different</h4>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">Our unique combination of deep expertise, unwavering integrity, client focus, and quality culture sets us apart in the industry.</p>
              </div>
            </motion.div>

            {/* Differentiators Grid */}
            {/* <div className="grid md:grid-cols-2 gap-8">
              {differentiators.map((diff, index) => {
                const IconComponent = diff.icon;
                return (
                  <motion.div
                    key={diff.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className={`w-6 h-6 ${diff.color}`} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{diff.title}</h4>
                    </div>
                    <ul className="space-y-3">
                      {diff.points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-accent-500 rounded-full flex-shrink-0 mt-2" />
                          <span className="text-slate-700 dark:text-slate-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
};