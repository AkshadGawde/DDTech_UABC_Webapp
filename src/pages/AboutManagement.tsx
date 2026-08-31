import React from 'react';
import { motion } from 'framer-motion';
import { Award, Clock } from 'lucide-react';

/**
 * About Us - Management Page
 */
export const AboutManagement = () => {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16">
      
      {/* Hero Section */}
      {/* <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Leadership &{' '}
              <span className="text-accent-600 dark:text-accent-500">
                Management
              </span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400">
              Meet the experienced leadership driving UABC&apos;s vision and excellence.
            </p>
          </motion.div>
        </div>
      </section> */}

      {/* Content Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 shadow-lg"
          >
            
            {/* Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
              
              {/* Image Section */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  {/* Gradient Border */}
                  <div className="p-[3px] rounded-2xl bg-black shadow-xl">
                    
                    {/* Inner Frame */}
                    <div className="rounded-2xl bg-white dark:bg-dark-card p-3">
                      <img
                        src="/Chitrajayasimha.jpeg"
                        alt="Chitra Jayasimha"
                        className="w-full aspect-square object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="lg:col-span-2">
                <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Chitra Jayasimha
                </h4>
                <p className="text-accent-600 dark:text-accent-500 font-semibold text-base md:text-lg mb-4 md:mb-6">
                  Principal Actuary and Founder-Director
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
                  {['FIA', 'FIAI', 'FIII'].map((title) => (
                    <span
                      key={title}
                      className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs md:text-sm font-medium text-blue-800 dark:text-blue-300"
                    >
                      <Award className="w-4 h-4 md:w-5 md:h-5" />
                      {title}
                    </span>
                  ))}
                  <span className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs md:text-sm font-medium text-orange-800 dark:text-orange-300">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    35+ Years
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-3 md:space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="text-sm md:text-base">
                    Chitra Jayasimha is a distinguished actuary qualified in both India and the UK, with nearly four decades of experience across Life Insurance, General Insurance, Reinsurance, Pensions, and Employee Benefits.
                    <br/>
                    Chitra has also served the profession in key leadership capacities, including:
Ex-Chairperson, NPS Trust
Chairperson – Advisory Group on Pension, Employee Benefits and Social Security Schemes, Institute of Actuaries of India
Core Member, APAC Retirement Council (Aon)
Member, Aon Global Retirement Committee
<br/>
<br/>
She currently serves as the Appointed Actuary for:
Sanima Reliance Life, Nepal
GIC Re, Bhutan
Nepal Re

                  </p>
                  <p className="text-sm md:text-base">
                    She is a Fellow of the Institute and Faculty of Actuaries (UK), Fellow of the Institute of Actuaries of India, and Fellow of the Insurance Institute of India. She is also a Gold Medalist in B.Sc. Statistics from Madras University.

                  </p>
                </div>
              </div>
            </div>
<br/>
<br/>

            {/* Experience Section */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h5 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Professional Experience
              </h5>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                A comprehensive profile of expertise and leadership across the actuarial and benefits consulting landscape.
              </p>

              {/* Insurance Expertise */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-accent-600 to-accent-400 rounded-full" />
                  <h6 className="text-xl font-bold text-slate-900 dark:text-white">
                    Insurance Expertise
                  </h6>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4 text-base leading-relaxed">
                  Extensive experience across Life Insurance, General Insurance, and Reinsurance, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                  {[
                    'Product development and pricing',
                    'Statutory valuation and financial reporting',
                    'Surplus analysis',
                    'Embedded value',
                    'Underwriting and regulatory advisory'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-500 mt-2 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employee Benefits & Retirement Consulting */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                  <h6 className="text-xl font-bold text-slate-900 dark:text-white">
                    Employee Benefits & Retirement Consulting
                  </h6>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-4 text-base leading-relaxed">
                  Comprehensive actuarial and consulting services in:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                  {[
                    'Pension and retirement scheme design',
                    'Employee benefits valuations',
                    'Social security advisory',
                    'Retirement strategy and governance',
                    'Cross-border actuarial valuations'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership & Advisory Roles */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-orange-600 to-orange-400 rounded-full" />
                  <h6 className="text-xl font-bold text-slate-900 dark:text-white">
                    Leadership & Advisory Roles
                  </h6>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      role: 'Founder & Consulting Actuary',
                      org: 'Universal Actuaries and Consultants LLP',
                      period: 'Since 2018',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'India Practice Leader – Retirement & Employee Benefits',
                      org: 'Aon Consulting India',
                      period: '2014–2018',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'Retirement Actuary',
                      org: 'Mercer (India, Sri Lanka, Bangladesh, Pakistan)',
                      period: '',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'Product Actuary',
                      org: 'Swiss Re India',
                      period: '',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'Head of Valuation & Reporting',
                      org: 'Paternoster (UK)',
                      period: '',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'Financial Reporting Actuary',
                      org: 'ING Vysya Life (now Exide Life)',
                      period: '',
                      color: 'from-orange-500 to-orange-400'
                    },
                    {
                      role: 'Senior Officer',
                      org: 'Life Insurance Corporation of India',
                      period: '17 years in multiple roles',
                      color: 'from-orange-500 to-orange-400'
                    }
                  ].map((position, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-6 pb-6"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-2 w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full border-3 border-white dark:border-dark-card shadow-md" />
                      
                      {/* Timeline line (except for last item) */}
                      {idx !== position ? null : (
                        <div className={`absolute left-1 top-5 w-0.5 ${idx < 6 ? 'h-16 bg-gradient-to-b from-orange-400 to-transparent' : ''}`} />
                      )}

                      {/* Content Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <h6 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                          {position.role}
                        </h6>
                        <p className="text-accent-600 dark:text-accent-400 font-semibold text-sm mb-2">
                          {position.org}
                        </p>
                        {position.period && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            {position.period}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};