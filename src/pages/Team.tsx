import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  tags: string[];
  bio: string;
  stats: { value: string; label: string }[];
  image: string;
}

// TODO: replace each `image` with a real photo path once uploaded, e.g. "/team/amit-yogi.jpg"
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'amit-yogi',
    firstName: 'Amit',
    lastName: 'Yogi',
    designation: 'Senior Actuarial Manager',
    tags: [],
    bio: "Amit Yogi operates as a Senior Actuarial Manager, bringing more than 15 years of deep industry expertise to the firm's actuarial advisory division, including prior experience at Aon Hewitt in the employee benefits domain. He works extensively with a wide range of public, private, and international listed organizations, guiding corporate leadership through intricate financial frameworks and retirement scheme valuations.\n\nHis primary technical focus centers on long-term Employee Benefits and Post-Retirement schemes, including Gratuity, Leave encashment, Long Service Benefits, LTIPs, and Post-Retirement Medical Benefits (PRMB). Amit's analytical background encompasses multi-jurisdictional reporting under IGAAP, IFRS, US GAAP, and various country-specific accounting standards. He specializes in building financial projections, executing trend analysis for assumption setting, and performing detailed liability movement reviews for peer evaluation.\n\nThroughout his career, Amit has provided strategic counsel on restructuring salary structures to maintain compliance with India's New Labour Codes while managing long-term cost impacts. He frequently contributes to white papers and industry research reports focused on emerging trends in employee benefits and regulatory shifts. Recognized for his strong interpersonal and communication skills, he excels at managing auditor interactions, resolving complex technical inquiries, and building lasting client partnerships.",
    stats: [
      { value: '15+', label: 'Years of Experience' },
      { value: '3', label: 'Global GAAP Frameworks' },
    ],
    image: '',
  },
  {
    id: 'hrishikesh-jadhav',
    firstName: 'Hrishikesh',
    lastName: 'Jadhav',
    designation: 'Senior Actuarial Manager',
    tags: [],
    bio: 'Hrishikesh Jadhav serves as a Senior Actuarial Manager with over 7 years of professional experience and 8 cleared actuarial examination papers. He leads actuarial advisory and valuation engagements across a diverse portfolio of private, public, and foreign listed corporations, bringing a disciplined analytical approach to the firm\'s actuarial services practice.\n\nHis technical expertise encompasses Employee Benefits (including Gratuity, Leave, Long Service Benefits, LTIPs, etc.), Post-Retirement Benefits (Pensions and PRMB), and complex equity valuations for ESOPs, RSUs, and SARs. He is experienced in Life and General Insurance reserving and valuations—including IBNR estimates—as well as specialized applications such as calculating actuarial loan tenures for housing finance institutions.\n\nHis execution capabilities are underpinned by advanced financial modelling, liability movement analysis, assumption-setting trend analysis, and extensive reporting expertise under IGAAP, IFRS, US GAAP, and various local reporting frameworks.\n\nHrishikesh has driven substantial strategic outcomes for clients, notably leading salary component restructurings to ensure seamless compliance with India\'s New Labour Codes while hosting an industry webinar on cost mitigation under these regulations. A recognized speaker, he presented at the Institute of Actuaries of India’s (IAI) 11th Tech Talk on Employee Benefits and regularly authoring white papers, research reports, and regulatory impact analyses. He excels at managing client and auditor interactions, handling complex ESOP liability reassessments, and resolving high-level technical queries.',
    stats: [
      { value: '7+', label: 'Years of Experience' },
      { value: '8', label: 'Actuarial Papers Cleared' },
    ],
    image: '/public/user1.png',
  },
  {
    id: 'aditya-ghate',
    firstName: 'Aditya',
    lastName: 'Ghate',
    designation: 'Senior Actuarial Manager',
    tags: [],
    bio: 'Aditya Ghate holds the role of Senior Actuarial Manager, bringing over six years of hands-on industry practice along with ten passed actuarial examinations. He collaborates extensively with public, private, and multinational listed enterprises, offering strategic quantitative direction across domestic markets and throughout the Middle East region.\n\nHis deep technical competencies lie in valuing short- and long-term Employee Benefits—such as Gratuity, LTIPs, Pensions, and PRMB—alongside complex equity instruments like RSUs, ESOPs, and SARs. Beyond core benefit schemes, Aditya regularly executes reserving and valuations for both Life and General Insurance lines (including IBNR estimates) and conducts niche valuation models for Credit Card Loyalty Points. His analytical toolkit covers multi-jurisdictional frameworks including IGAAP, IFRS, US GAAP, and various local accounting standards, backed by robust assumption-setting, liability trend analyses, and financial modelling.\n\nIn advisory engagements, Aditya guides organizations through major regulatory shifts, particularly in restructuring compensation structures to meet the requirements of India\'s New Labour Codes while controlling overhead. He frequently authors thought leadership—such as white papers and regulatory research—and has featured as a speaker at the IAI’s 11th Tech Talk on Employee Benefits, alongside hosting webinars on the New Labour Codes and Current Trends in Employee Stock Options Plan (ESOP). He is particularly skilled in navigating intricate auditor queries, handling accounting adjustments for modified equity schemes, and fostering strong long-term client relationships.',
    stats: [
      { value: '6+', label: 'Years of Experience' },
      { value: '10', label: 'Actuarial Papers Cleared' },
    ],
    image: '',
  },
  {
    id: 'rashi-ranawat',
    firstName: 'Rashi',
    lastName: 'Ranawat',
    designation: 'Senior Actuarial Manager',
    tags: [],
    bio: 'Rashi Ranawat serves as a Senior Actuarial Manager with over 5 years of specialized experience and 8 passed actuarial examinations. She advises a broad portfolio of public, private, and international corporations, delivering tailored actuarial solutions across complex financial and regulatory environments.\n\nHer core practice is heavily centered on Life Insurance, where she extensively manages end-to-end pricing, product development, profit testing, and Risk-Based Capital (RBC) analysis alongside reserving, reporting, and valuation framework setup. Alongside her deep life insurance specialization, Rashi possesses thorough technical capabilities in Employee Benefits and post-retirement schemes—such as Gratuity, Leave, LTIPs, Pensions, and PRMB—as well as valuation models for equity-based compensation including ESOPs, RSUs, and SARs. Her engagements are backed by comprehensive reporting expertise across IGAAP, IFRS, US GAAP, and regional accounting standards.\n\nRashi has successfully guided numerous organizations through strategic compensation restructuring to align with India’s New Labour Codes, hosting dedicated webinars to educate corporate stakeholders on achieving compliance while mitigating wage costs. She frequently authors thought leadership pieces, including white papers, research reports, and regulatory updates for the actuarial domain. Known for her strong communication and stakeholder engagement, she excels at resolving complex auditor queries, parameter-driven modeling, setting assumptions through trend analysis, and detailing liability movements for peer reviews.',
    stats: [
      { value: '5+', label: 'Years of Experience' },
      { value: '8', label: 'Actuarial Papers Cleared' },
    ],
    image: '',
  },
  {
    id: 'nupoor-joshi',
    firstName: 'Nupoor',
    lastName: 'Joshi',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: '',
    stats: [{ value: '2+', label: 'Years of Experience' }],
    image: '',
  },
  {
    id: 'raghav-sivaganesan',
    firstName: 'Raghav',
    lastName: 'Sivaganesan',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: '',
    stats: [{ value: '1+', label: 'Years of Experience' }],
    image: '',
  },
  {
    id: 'khushi-sawant',
    firstName: 'Khushi',
    lastName: 'Sawant',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: '',
    stats: [{ value: '1+', label: 'Years of Experience' }],
    image: '',
  },
];

const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

const MemberPhoto = ({
  member,
  initialsClassName,
}: {
  member: TeamMember;
  initialsClassName: string;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showPlaceholder = !member.image || imageFailed;

  if (showPlaceholder) {
    return (
      <div className={`w-full h-full flex items-center justify-center font-serif ${initialsClassName}`}>
        {getInitials(member.firstName, member.lastName)}
      </div>
    );
  }

  return (
    <img
      src={member.image}
      alt={`${member.firstName} ${member.lastName}`}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className="w-full h-full object-cover object-top"
    />
  );
};

const RotatingStamp = ({ label }: { label: string }) => {
  const pathId = 'stampCirclePath';
  const repeated = `${label} • ${label} • `;
  return (
    <button
      type="button"
      className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 group"
      aria-label={label}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full text-accent-700 dark:text-accent-400"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
      >
        <defs>
          <path id={pathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text fontSize="6.6" letterSpacing="1.5" fill="currentColor" fontFamily="sans-serif">
          <textPath href={`#${pathId}`} startOffset="0%">
            {repeated}
          </textPath>
        </text>
      </motion.svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </span>
      </div>
    </button>
  );
};

export const Team = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const active = TEAM_MEMBERS[activeIndex];

  const openDetail = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setView('detail');
  };
  const closeDetail = () => setView('list');

  return (
    <section className="bg-light-bg dark:bg-dark-bg py-10 md:py-16 px-3 md:px-8">
      <div className="max-w-7xl mx-auto bg-light-card dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="p-5 sm:p-8 md:p-10"
            >
              {/* Heading + copy */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[0.92] text-slate-900 dark:text-white">
                  Meet{' '}
                  <span className="italic text-accent-600 dark:text-accent-500">Our</span>{' '}
                  Team
                </h2>
                <p className="mt-4 max-w-md mx-auto text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  A dedicated team of actuarial professionals bringing decades of combined
                  expertise across Employee Benefits, Insurance, and Retirement Consulting.
                </p>
              </div>

              {/* Card grid: all members shown at once, wraps and centers incomplete rows */}
              <div className="mt-6 flex flex-wrap justify-center gap-5">
                {TEAM_MEMBERS.map((member, i) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center shrink-0 basis-full sm:basis-[calc(50%-0.625rem)] lg:basis-[calc(25%-0.9375rem)]"
                  >
                    <motion.button
                      type="button"
                      layoutId={`photo-${member.id}`}
                      onClick={() => openDetail(i)}
                      aria-label={`View ${member.firstName} ${member.lastName}'s profile`}
                      className="relative w-full max-w-xs h-56 sm:h-64 md:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-dark-bg"
                    >
                      <MemberPhoto member={member} initialsClassName="text-4xl text-white/90" />
                    </motion.button>

                    <div className="mt-3 text-center">
                      <h3 className="font-serif text-base text-slate-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="mt-1 text-xs text-accent-600 dark:text-accent-500">
                        {member.designation}
                      </p>
                      {member.tags.length > 0 && (
                        <div className="mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
                          {member.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] tracking-wide uppercase border border-slate-200 dark:border-white/10 rounded-full px-2.5 py-0.5 text-slate-600 dark:text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 gap-4 flex-wrap">
                <button
                  type="button"
                  onClick={closeDetail}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to team
                </button>
                <div className="flex gap-2 flex-wrap">
                  {active.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wide uppercase border border-slate-200 dark:border-white/10 rounded-full px-3 py-1 text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="px-5 sm:px-8 md:px-10 mt-3 text-center font-serif text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white">
                <span className="italic text-accent-600 dark:text-accent-500">
                  {active.firstName}
                </span>{' '}
                {active.lastName}
              </h2>
              <p className="px-5 sm:px-8 md:px-10 mt-1 text-center text-sm text-slate-600 dark:text-slate-400">
                {active.designation}
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2">
                <motion.div
                  layoutId={`photo-${active.id}`}
                  className="relative h-60 md:h-[400px] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-dark-bg"
                >
                  <MemberPhoto member={active} initialsClassName="text-5xl text-white/90" />
                </motion.div>

                <div className="relative bg-brand-50 dark:bg-dark-card p-5 md:p-8 flex flex-col justify-between min-h-[220px] md:min-h-[360px]">
                  <div className="flex justify-between items-start gap-6">
                    <div className="max-w-sm space-y-3 text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                      {active.bio
                        ? active.bio.split('\n\n').map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
                        : <p>Bio coming soon.</p>}
                    </div>
                    <RotatingStamp label="BOOK A CONSULTATION" />
                  </div>

                  <div className="mt-6 flex gap-8">
                    {active.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="font-serif text-2xl text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-[8rem]">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};