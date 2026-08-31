import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile, useShouldReduceMotion } from '../../utils/useDevice';
import { MapPin, Mail, Phone } from 'lucide-react';

/**
 * Contact Section
 */
export const Contact = () => {
  const isMobile = useIsMobile();
  const shouldReduce = useShouldReduceMotion();
  const disableMotion = isMobile || shouldReduce;
  return (
    <section id="contact" className="py-8 sm:py-10 lg:py-14 min-h-screen flex items-center bg-light-bg dark:bg-dark-bg relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="bg-white dark:bg-[#050a18] border border-slate-200 dark:border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 overflow-hidden relative shadow-2xl transition-colors duration-300">
          
          {/* Animated Blobs in Contact Card */}
          {!disableMotion && (
            <>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent-500/5 dark:bg-accent-900/10 rounded-full blur-2xl sm:blur-3xl -mr-10 sm:-mr-20 -mt-10 sm:-mt-20 pointer-events-none" 
              />
              <motion.div 
                animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-brand-500/5 dark:bg-brand-900/10 rounded-full blur-2xl sm:blur-3xl -ml-10 sm:-ml-20 -mb-10 sm:-mb-20 pointer-events-none" 
              />
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 relative z-10">
            <div>
              <div className="inline-block px-3 py-1 bg-accent-500/10 border border-accent-500/20 text-accent-600 dark:text-accent-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full mb-4 sm:mb-6">
                Contact Us
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">Let's Discuss <br/>Your Future</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-5 sm:mb-7 text-xs sm:text-sm lg:text-base">
                Ready to transform your business? Reach out to our team of experts for a preliminary consultation.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 sm:gap-5">
                  <div className="p-2 sm:p-4 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 shrink-0">
                    <MapPin className="text-accent-600 dark:text-accent-500 w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-lg mb-1">Universal Actuaries and Consultants LLP</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">1112-A, C Wing, Kailas Business Park,</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Veer Savarkar Marg, Park Site,</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Vikhroli (West), Mumbai – 400079</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Maharashtra, India</p>
                  </div>
                </motion.div>
                
                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 sm:gap-5">
                  <div className="p-2 sm:p-4 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 shrink-0">
                    <Mail className="text-accent-600 dark:text-accent-500 w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-lg mb-1">Email Us</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">chitra.jayasimha@uabc.co.in</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">universalactuaries@uabc.co.in</p>
                  </div>
                </motion.div>

                <motion.div whileHover={{ x: 5 }} className="flex items-start gap-3 sm:gap-5">
                  <div className="p-2 sm:p-4 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5 shrink-0">
                    <Phone className="text-accent-600 dark:text-accent-500 w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-lg mb-1">Call Us</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">Chitra Jayasimha: +91-9987-769-877</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">UABC: +91 22 49632112</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs mt-1">Mon-Fri, 10am - 6pm IST</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <form className="space-y-4 sm:space-y-6 p-4 sm:p-8 bg-slate-50 dark:bg-white/5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/5 shadow-sm" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                  <input type="text" className="w-full bg-white dark:bg-dark-bg/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-accent-500 transition-colors" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                  <input type="text" className="w-full bg-white dark:bg-dark-bg/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-accent-500 transition-colors" placeholder="Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <input type="email" className="w-full bg-white dark:bg-dark-bg/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-accent-500 transition-colors" placeholder="john@company.com" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <textarea rows={4} className="w-full bg-white dark:bg-dark-bg/50 border border-slate-200 dark:border-white/10 rounded-lg px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-accent-500 transition-colors" placeholder="Tell us about your project..."></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-accent-500/25 mt-2 sm:mt-4 text-xs sm:text-sm"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
