import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  imageSize?: [number, number];
  /** Tailwind object-position override for the grid card crop (defaults to object-top). */
  gridImageClass?: string;
}


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
    image: '/amit-yogi.jpg',
    imageSize: [2048, 2048],
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
    image: '/hrishikesh-jadhav.jpg',
    imageSize: [1456, 1540],
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
    image: '/aditya-ghate.jpg',
    imageSize: [1844, 2304],
    gridImageClass: 'object-[center_25%]',
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
    image: '/rashi-ranawat.jpg',
    imageSize: [2016, 2132],
  },
  {
    id: 'nupoor-joshi',
    firstName: 'Nupoor',
    lastName: 'Joshi',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: 'Nupoor Joshi serves as an Actuarial Consultant, contributing over two years of focused industry experience to the firm\'s actuarial practice. She partners with a diverse spectrum of publicly listed, private, and multinational organizations, supporting corporate clients across end-to-end employee benefit valuation mandates.\n\nHer core technical focus is dedicated to the valuation and accounting of short- and long-term Employee Benefits, including Gratuity schemes, Leave encashment policies, and Long Service Benefits. She is well-versed in preparing statutory actuarial disclosures across multiple accounting standards, including IGAAP, IFRS, US GAAP, and various regional reporting frameworks. In her day-to-day analytical work, Nupoor configures plan-specific parameters, analyzes data trends for assumption setting, and conducts granular liability movement analyses for peer reviews.\n\nNupoor plays an active role in strategic advisory assignments, assisting numerous organizations with the restructuring of their wage structures to ensure full compliance with India\'s New Labour Codes. Additionally, she contributes to the firm\'s research initiatives by co-authoring white papers, industry reports, and regulatory updates on emerging benefit trends. Demonstrating strong communication and relationship-building abilities, she effectively interfaces with stakeholders to resolve auditor queries and support ongoing client requirements.',
    stats: [{ value: '2+', label: 'Years of Experience' }],
    image: '/nupoor-joshi.jpg',
    imageSize: [2016, 2132],
  },
  {
    id: 'raghav-sivaganesan',
    firstName: 'Raghav',
    lastName: 'Sivaganesan',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: 'Raghav Sivaganesan is an Actuarial Consultant with over a year of specialized quantitative experience and six actuarial examination papers cleared. He works closely with a diverse clientele, including private entities, publicly listed companies, and multinational organizations, supporting the execution of key actuarial valuation and consulting engagements.\n\nHis technical focus centres on valuation frameworks for Employee Benefits, encompassing statutory Gratuity schemes, Leave plans, and Long Service Benefits. Raghav is proficient in delivering actuarial valuations aligned with diverse global accounting frameworks, including IGAAP, IFRS, US GAAP, and jurisdiction-specific reporting standards. His analytical toolkit includes fine-tuning model parameters to match bespoke benefit rules, executing trend analyses to inform actuarial assumptions, and performing in-depth liability movement analyses to support peer reviews.\n\nOn the advisory front, Raghav supports organizations through strategic salary restructuring initiatives designed to achieve regulatory compliance under India\'s New Labour Codes. He also plays an active role in thought leadership, contributing to research publications, technical white papers, and regulatory market analyses. With effective communication and interpersonal capabilities, he assists clients and audit teams in resolving detailed valuation queries while fostering positive stakeholder relationships.',
    stats: [
      { value: '1+', label: 'Years of Experience' },
      { value: '6', label: 'Actuarial Papers Cleared' },
    ],
    image: '/raghav.png',
    imageSize: [1420, 1518],
  },
  {
    id: 'khushi-sawant',
    firstName: 'Khushi',
    lastName: 'Sawant',
    designation: 'Actuarial Consultant',
    tags: [],
    bio: 'Khushi Sawant works as an Actuarial Consultant, contributing over a year of dedicated consulting experience to the firm\'s actuarial practice.\n\nHer domain expertise lies in the valuation and accounting of mandatory and voluntary Employee Benefits, spanning Gratuity programs, Leave schemes, and Long Service Benefits. Khushi regularly executes actuarial reporting in accordance with major financial accounting standards, including IGAAP, IFRS, US GAAP, and various country-specific local GAAPs. Her analytical responsibilities include conducting detailed trend analyses to calibrate demographic and financial assumptions, as well as breaking down liability movements for rigorous peer reviews.\n\nKhushi brings strong interpersonal and communication skills to client engagements, actively collaborating with cross-functional corporate teams. She plays an essential role in addressing client inquiries, liaising directly with statutory auditors on actuarial audit queries, and ensuring seamless delivery across diverse statutory reporting mandates.',
    stats: [{ value: '1+', label: 'Years of Experience' }],
    image: '/khushi-sawant.jpg',
    imageSize: [1952, 2196],
    gridImageClass: 'object-[center_25%]',
  },
];

const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

const MemberPhoto = ({
  member,
  initialsClassName,
  imgClassName = 'w-full h-full object-cover object-top',
}: {
  member: TeamMember;
  initialsClassName: string;
  imgClassName?: string;
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
      width={member.imageSize?.[0]}
      height={member.imageSize?.[1]}
      loading="lazy"
      onError={() => setImageFailed(true)}
      className={imgClassName}
    />
  );
};

const RotatingStamp = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  const pathId = 'stampCirclePath';
  const repeated = `${label} • ${label} • `;
  return (
    <button
      type="button"
      onClick={onClick}
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
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const active = TEAM_MEMBERS[activeIndex];

  const openDetail = (index?: number) => {
    if (index !== undefined) setActiveIndex(index);
    setView('detail');
  };
  const closeDetail = () => setView('list');

  return (
    <section className="bg-light-bg dark:bg-dark-bg py-5 md:py-12 px-3 md:px-8">
      <div className="max-w-6xl mx-auto bg-light-card dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="p-4 sm:p-6 md:p-8"
            >
              {/* Heading + copy */}
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl leading-[0.92] text-slate-900 dark:text-white">
                  Meet{' '}
                  <span className="italic text-accent-600 dark:text-accent-500">Our</span>{' '}
                  Team
                </h2>
                {/* <p className="mt-4 max-w-md mx-auto text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  A dedicated team of actuarial professionals bringing decades of combined
                  expertise across Employee Benefits, Insurance, and Retirement Consulting.
                </p> */}
              </div>

              {/* Card grid: 2x2 on phone, wraps and centers incomplete rows up to 4 per row on desktop */}
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
                {TEAM_MEMBERS.map((member, i) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center shrink-0 basis-[calc(50%-0.375rem)] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)]"
                  >
                    <button
                      type="button"
                      onClick={() => openDetail(i)}
                      aria-label={`View ${member.firstName} ${member.lastName}'s profile`}
                      className="relative w-full max-w-[15rem] h-32 sm:h-48 md:h-56 lg:h-60 rounded-2xl overflow-hidden cursor-pointer shadow-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-dark-bg transition-transform duration-300 hover:-translate-y-1"
                    >
                      <MemberPhoto
                        member={member}
                        initialsClassName="text-4xl text-white/90"
                        imgClassName={`w-full h-full object-cover ${member.gridImageClass ?? 'object-top'}`}
                      />
                    </button>

                    <div className="mt-2.5 text-center">
                      <h3 className="font-serif text-sm text-slate-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="mt-0.5 text-[0.7rem] text-accent-600 dark:text-accent-500">
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

              <h2 className="px-5 sm:px-8 md:px-10 mt-3 text-center font-serif text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white">
                <span className="italic text-accent-600 dark:text-accent-500">
                  {active.firstName}
                </span>{' '}
                {active.lastName}
              </h2>
              <p className="px-5 sm:px-8 md:px-10 mt-1 text-center text-sm text-slate-600 dark:text-slate-400">
                {active.designation}
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-[3fr_7fr]">
                <div className="flex items-center justify-center p-4 sm:p-6">
                  <motion.div
                    initial={{ opacity: 0, x: -48 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative group w-full max-w-[19rem]"
                  >
                    {/* Gradient Border */}
                    <div className="p-[3px] rounded-2xl bg-black shadow-xl">
                      {/* Inner Frame */}
                      <div className="rounded-2xl bg-white dark:bg-dark-card p-3">
                        <div className="rounded-xl overflow-hidden">
                          <MemberPhoto
                            member={active}
                            initialsClassName="text-5xl text-white/90 aspect-square bg-gradient-to-br from-brand-700 via-brand-800 to-dark-bg"
                            imgClassName="block w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  </motion.div>
                </div>

                <div className="relative bg-brand-50 dark:bg-dark-card p-4 md:p-6 flex flex-col justify-between min-h-[220px] md:min-h-[340px]">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start gap-4 sm:gap-6">
                    <div className="team-bio-scroll w-full flex-1 min-w-0 space-y-2.5 text-sm md:text-[0.95rem] text-slate-700 dark:text-slate-300 leading-relaxed md:max-h-[560px] md:overflow-y-auto md:pr-3">
                      {active.bio
                        ? active.bio.split('\n\n').map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
                        : <p>Bio coming soon.</p>}
                    </div>
                    <RotatingStamp
                      label="BOOK A CONSULTATION"
                      onClick={() => navigate('/contact')}
                    />
                  </div>

                  <div className="mt-5 flex gap-8">
                    {active.stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="font-serif text-xl text-slate-900 dark:text-white">
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