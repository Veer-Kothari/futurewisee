export interface CheatSheet {
  title: string;
}

export interface ExpertVideo {
  title: string;
  description: string;
}

export interface ArticleLink {
  title: string;
  excerpt: string;
}

export interface Industry {
  slug: string;
  name: string;
  shortDescription: string;
  overview: string;
  cheatSheets: CheatSheet[];
  expertVideos: ExpertVideo[];
  articles: ArticleLink[];
}

export const industries: Industry[] = [
  {
    slug: "law",
    name: "Law",
    shortDescription: "Understand legal careers in Oman, from corporate law to public practice.",
    overview:
      "Placeholder overview: Law in Oman covers a wide range of paths, from corporate and commercial practice to public sector and international work. This page will give students a practical introduction to what lawyers actually do day to day, how to qualify, and where the opportunities are.",
    cheatSheets: [
      { title: "Law Career Paths in Oman — Cheat Sheet" },
      { title: "How to Qualify as a Lawyer — Step-by-Step Guide" },
      { title: "Key Legal Terms Every Student Should Know" },
    ],
    expertVideos: [
      {
        title: "A Day in the Life of a Corporate Lawyer",
        description: "Placeholder: an Omani lawyer walks through a typical working day.",
      },
      {
        title: "How I Got Into Law — Advice for Students",
        description: "Placeholder: career journey and tips for high school students.",
      },
    ],
    articles: [
      {
        title: "What Studying Law Is Really Like",
        excerpt: "Placeholder excerpt: an honest look at law degrees and workloads.",
      },
      {
        title: "Legal Careers Beyond the Courtroom",
        excerpt: "Placeholder excerpt: exploring alternative paths for law graduates.",
      },
      {
        title: "Interview Transcript: An Omani Legal Professional",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship",
    shortDescription: "Learn how startups and small businesses are built in Oman.",
    overview:
      "Placeholder overview: Entrepreneurship is about turning ideas into businesses. This page will introduce students to how startups get built in Oman, the support ecosystem available to young founders, and the practical skills that matter most.",
    cheatSheets: [
      { title: "Starting a Business in Oman — Cheat Sheet" },
      { title: "Startup Vocabulary Explained Simply" },
      { title: "From Idea to Launch — A Student's Roadmap" },
    ],
    expertVideos: [
      {
        title: "How I Built My First Startup in Oman",
        description: "Placeholder: a founder shares their journey from idea to launch.",
      },
      {
        title: "Common Mistakes Young Founders Make",
        description: "Placeholder: practical lessons learned the hard way.",
      },
    ],
    articles: [
      {
        title: "The Omani Startup Ecosystem Explained",
        excerpt: "Placeholder excerpt: incubators, funding, and support programs.",
      },
      {
        title: "Can Students Start Businesses? Yes — Here's How",
        excerpt: "Placeholder excerpt: realistic first steps for young founders.",
      },
      {
        title: "Interview Transcript: An Omani Entrepreneur",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "investment-banking-trading",
    name: "Investment Banking & Trading",
    shortDescription: "Explore markets, deals, and careers in high finance.",
    overview:
      "Placeholder overview: Investment banking and trading sit at the heart of global finance. This page will explain what investment bankers and traders actually do, how deals and markets work, and how students in Oman can prepare for these competitive careers.",
    cheatSheets: [
      { title: "Investment Banking Explained — Cheat Sheet" },
      { title: "Markets & Trading Basics for Students" },
      { title: "How to Prepare for a Finance Career Early" },
      { title: "Key Finance Terms Glossary" },
    ],
    expertVideos: [
      {
        title: "What an Investment Banker Actually Does",
        description: "Placeholder: demystifying deals, clients, and long hours.",
      },
      {
        title: "Intro to Trading and the Markets",
        description: "Placeholder: how markets work, explained for beginners.",
      },
      {
        title: "Breaking Into Finance from Oman",
        description: "Placeholder: realistic pathways and what to focus on in school.",
      },
    ],
    articles: [
      {
        title: "Investment Banking vs. Trading — What's the Difference?",
        excerpt: "Placeholder excerpt: two careers often confused, explained.",
      },
      {
        title: "Skills Finance Recruiters Look For",
        excerpt: "Placeholder excerpt: what to build while still in school.",
      },
      {
        title: "Interview Transcript: A Finance Professional",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "other-finance",
    name: "Other Finance",
    shortDescription: "Accounting, insurance, fintech, and the wider world of finance careers.",
    overview:
      "Placeholder overview: Finance is much bigger than banking. This page covers the many other finance careers open to students — accounting, insurance, fintech, asset management, and more — and how each one works in practice.",
    cheatSheets: [
      { title: "Finance Careers Beyond Banking — Cheat Sheet" },
      { title: "Accounting & Audit Paths Explained" },
      { title: "Fintech in Oman — What Students Should Know" },
    ],
    expertVideos: [
      {
        title: "Careers in Finance You Haven't Heard Of",
        description: "Placeholder: a tour of lesser-known finance roles.",
      },
      {
        title: "Life in Accounting and Audit",
        description: "Placeholder: what the work is really like, from a professional.",
      },
    ],
    articles: [
      {
        title: "The Many Branches of Finance",
        excerpt: "Placeholder excerpt: mapping the full finance career landscape.",
      },
      {
        title: "Fintech: Where Finance Meets Technology",
        excerpt: "Placeholder excerpt: why fintech is growing fast in the region.",
      },
      {
        title: "Interview Transcript: A Finance Specialist",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "tax",
    name: "Tax",
    shortDescription: "How tax systems work and what careers in tax look like.",
    overview:
      "Placeholder overview: Tax affects every person and business, and tax professionals are in demand. This page will introduce how Oman's tax system works, what tax advisors do, and why this is a stable and rewarding career path.",
    cheatSheets: [
      { title: "Tax Careers Explained — Cheat Sheet" },
      { title: "Oman's Tax System — A Student's Guide" },
      { title: "VAT, Corporate Tax & Key Terms Glossary" },
    ],
    expertVideos: [
      {
        title: "What Does a Tax Advisor Do?",
        description: "Placeholder: inside the day-to-day work of a tax professional.",
      },
      {
        title: "Why Tax Is a Great Career Choice",
        description: "Placeholder: stability, demand, and growth in the field.",
      },
    ],
    articles: [
      {
        title: "Understanding VAT in Oman",
        excerpt: "Placeholder excerpt: the basics every future professional should know.",
      },
      {
        title: "Tax vs. Accounting — Choosing Your Path",
        excerpt: "Placeholder excerpt: how the two careers compare.",
      },
      {
        title: "Interview Transcript: A Tax Professional",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "economics",
    name: "Economics",
    shortDescription: "How economies work and where an economics background can take you.",
    overview:
      "Placeholder overview: Economics helps explain how the world works — from prices and jobs to national policy. This page will show students what economists do, where economics graduates work in Oman, and how the subject connects to Oman Vision 2040.",
    cheatSheets: [
      { title: "Economics Careers — Cheat Sheet" },
      { title: "Core Economic Concepts Made Simple" },
      { title: "Oman's Economy & Vision 2040 — Key Facts" },
    ],
    expertVideos: [
      {
        title: "What Economists Actually Do",
        description: "Placeholder: research, policy, and analysis explained simply.",
      },
      {
        title: "Economics and Oman's Future",
        description: "Placeholder: how economics connects to national development.",
      },
    ],
    articles: [
      {
        title: "Why Study Economics?",
        excerpt: "Placeholder excerpt: the versatility of an economics background.",
      },
      {
        title: "Diversifying Oman's Economy — What It Means",
        excerpt: "Placeholder excerpt: the thinking behind Oman Vision 2040.",
      },
      {
        title: "Interview Transcript: An Economist",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
  {
    slug: "operations",
    name: "Operations",
    shortDescription: "The engines behind businesses: logistics, supply chains, and management.",
    overview:
      "Placeholder overview: Operations is how organizations actually run — supply chains, logistics, processes, and people. This page will show students why operations careers are essential in every industry, especially in Oman's growing logistics sector.",
    cheatSheets: [
      { title: "Operations Careers — Cheat Sheet" },
      { title: "Supply Chains & Logistics Explained Simply" },
      { title: "Skills That Make Great Operations Professionals" },
    ],
    expertVideos: [
      {
        title: "Inside Operations: Keeping a Business Running",
        description: "Placeholder: what operations managers handle every day.",
      },
      {
        title: "Logistics in Oman — A Growing Opportunity",
        description: "Placeholder: why Oman's location makes logistics a key sector.",
      },
    ],
    articles: [
      {
        title: "What Is Operations Management?",
        excerpt: "Placeholder excerpt: the discipline behind every successful business.",
      },
      {
        title: "Oman as a Logistics Hub",
        excerpt: "Placeholder excerpt: ports, trade, and career opportunities.",
      },
      {
        title: "Interview Transcript: An Operations Leader",
        excerpt: "Placeholder excerpt: full transcript from our expert conversation.",
      },
    ],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}
