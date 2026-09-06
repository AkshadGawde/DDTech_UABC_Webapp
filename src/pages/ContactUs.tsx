import React from 'react';
import { motion } from 'framer-motion';
import { optimizeImage } from '../utils/imageUtils';
import { ScrollReveal, MagneticButton } from '../components/PageTransition';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Building2,
  Globe,
  Users,
  MessageSquare,
  ArrowRight,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';
import { ConsultationForm } from '../components/ConsultationForm';

/**
 * Contact Us Page Component
 */
export const ContactUs = () => {
  const offices = [
    {
      city: "Mumbai",
      address: "Universal Actuaries and Consultants LLP 1112-A, C Wing, Kailas Business Park, Veer Savarkar Marg, Park Site, Vikhroli (West)",
      postalCode: "Mumbai – 400079 Maharashtra, India",
      phone: "+91 22 49632112",
      email: "universalactuaries@uabc.co.in",
      timezone: "IST",
      image: "/KBP.jpeg"
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      description: "Reach our Mumbai headquarters",
      contact: "+91 22 49632112",
      availability: "Mon-Fri 10:30am-6:30pm IST"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Corporate enquiries",
      contact: "universalactuaries@uabc.co.in",
      availability: "24/7 Inbox"
    },
    {
      icon: Mail,
      title: "Email (Chitra Jayasimha)",
      description: "Direct contact",
      contact: "chitra.jayasimha@uabc.co.in",
      availability: "Mon-Fri 10:30am-6:30pm IST"
    }
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-16">
      {/* Hero Section */}
      <section className="py-8 md:py-12 lg:py-16 bg-gradient-to-br from-accent-50 to-slate-50 dark:from-dark-card dark:to-dark-bg">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto px-4 md:px-0"
          >
            <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-3 md:mb-4 text-xs md:text-sm">
              Get in touch
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 text-slate-900 dark:text-white leading-tight">
              Let's Start a <br />
              <span className="text-accent-600 dark:text-accent-500">Conversation</span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Ready to transform your risk management approach? Our team of experts 
              is here to help you navigate complex actuarial challenges.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-16 px-4 md:px-0"
          >
            <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-3 md:mb-4 text-xs md:text-sm">
              Contact Methods
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Choose Your Preferred Way to Connect
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-20">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow group cursor-pointer"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-accent-600 dark:text-accent-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">{method.title}</h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mb-3 md:mb-4">{method.description}</p>
                  <div className="text-sm md:text-base text-accent-600 dark:text-accent-500 font-medium mb-2">{method.contact}</div>
                  <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{method.availability}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get in Touch Directly */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center px-4 md:px-0"
          >
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-md"
            >
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Get in touch Directly</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-accent-600 dark:text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Universal Actuaries and Consultants LLP</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Universal Actuaries and Consultants LLP 1112-A, C Wing, Kailas Business Park, Veer Savarkar Marg, Park Site, Vikhroli (West)<br />
                        Mumbai – 400079 Maharashtra, India
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-accent-600 dark:text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Phone</h4>
                      <p className="text-slate-600 dark:text-slate-400">+91-9987-769-877 (Chitra Jayasimha)</p>
                      <p className="text-slate-600 dark:text-slate-400">+91 22 49632112</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-accent-600 dark:text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                      <p className="text-slate-600 dark:text-slate-400">chitra.jayasimha@uabc.co.in</p>
                      <p className="text-slate-600 dark:text-slate-400">universalactuaries@uabc.co.in</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-accent-600 dark:text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Business Hours</h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        Monday - Friday: 10:30 AM - 6:30 PM IST<br />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/universal-actuaries-and-benefit-consultants/", label: "LinkedIn" },
                    { icon: Twitter, href: "https://x.com/UABC_Insights", label: "Twitter" },
                    { icon: Instagram, href: "https://www.instagram.com/universalactuaries/", label: "Instagram" }
                  ].map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center text-accent-600 dark:text-accent-400 hover:bg-accent-600 hover:text-white transition-colors"
                        aria-label={social.label}
                      >
                        <IconComponent className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-24 bg-slate-50 dark:bg-dark-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
              Global Presence
            </div> */}
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Our Office Location
            </h2>
          </motion.div>

          <div className="flex justify-center">
            {offices.map((office, index) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-dark-bg rounded-xl overflow-hidden shadow-lg w-full max-w-md"
              >
                <img 
                  src={optimizeImage(office.image, 400)}
                  alt={office.city}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{office.city}</h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{office.address}</div>
                        <div>{office.postalCode}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{office.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{office.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Timezone: {office.timezone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {/* <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-accent-600 dark:text-accent-500 font-bold tracking-widest uppercase mb-4 text-sm">
              Frequently Asked
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Common Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "How quickly can you start a project?",
                answer: "We can typically begin most projects within 1-2 weeks of initial consultation, depending on scope and team availability."
              },
              {
                question: "Do you work with international clients?",
                answer: "Yes, we serve clients globally through our offices in New York, London, Singapore, and Toronto, with expertise in local regulations."
              },
              {
                question: "What is your typical project timeline?",
                answer: "Project timelines vary based on complexity, ranging from 2-4 weeks for standard analyses to 3-6 months for comprehensive implementations."
              },
              {
                question: "Do you provide ongoing support?",
                answer: "Absolutely. We offer various support packages including ongoing consultation, model updates, and training for your team."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-dark-card p-6 rounded-xl mb-4 shadow-lg"
              >
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};