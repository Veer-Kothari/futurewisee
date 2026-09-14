export type BlogCategory = "Personal Finance" | "My Journey";

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  author: string;
  date: string;
  displayDate: string;
  excerpt: string;
  paragraphs: string[];
}

export const LINKEDIN_URL = "https://www.linkedin.com/company/futurewise";

export const blogPosts: BlogPost[] = [
  {
    slug: "budgeting-basics-for-students-in-oman",
    title: "Budgeting Basics for Students in Oman",
    category: "Personal Finance",
    author: "FutureWise Team",
    date: "2026-08-04",
    displayDate: "4 August 2026",
    excerpt: "A simple, placeholder walkthrough of building your first monthly budget as a student.",
    paragraphs: [
      "Placeholder introduction: budgeting is less about restriction and more about knowing where your money goes each month. This article will eventually walk students through a realistic first budget using local costs and examples.",
      "Placeholder section: start by listing your income sources, however small — allowance, part-time work, or gifts. Then separate spending into fixed commitments and flexible choices so you can see what is genuinely adjustable.",
      "Placeholder section: a simple rule of thumb is to give every rial a job before the month begins. Even a rough plan beats no plan, and reviewing it weekly builds the habit faster than aiming for perfection.",
      "Placeholder close: the goal is confidence, not complexity. Once budgeting feels routine, saving and longer-term planning become far less intimidating.",
    ],
  },
  {
    slug: "opening-your-first-bank-account",
    title: "Opening Your First Bank Account: What to Expect",
    category: "Personal Finance",
    author: "FutureWise Team",
    date: "2026-07-21",
    displayDate: "21 July 2026",
    excerpt: "Placeholder guide to documents, account types, and the questions worth asking.",
    paragraphs: [
      "Placeholder introduction: opening a bank account is one of the first practical steps into financial independence, and it is usually far simpler than students expect.",
      "Placeholder section: this article will cover the documents typically requested, the difference between everyday and savings accounts, and the fees worth checking before you sign anything.",
      "Placeholder section: we will also explain digital banking basics — card security, transfer limits, and how to read a statement without guessing.",
      "Placeholder close: real content, including up-to-date local guidance, will replace this text shortly.",
    ],
  },
  {
    slug: "the-real-cost-of-living-alone",
    title: "The Real Cost of Living Alone",
    category: "Personal Finance",
    author: "FutureWise Team",
    date: "2026-07-02",
    displayDate: "2 July 2026",
    excerpt: "Placeholder breakdown of rent, bills, groceries, and the costs nobody warns you about.",
    paragraphs: [
      "Placeholder introduction: independent living looks straightforward until the first month of bills arrives. This article breaks down the costs students rarely plan for.",
      "Placeholder section: beyond rent, expect utilities, internet, transport, groceries, and a buffer for the unexpected repair or replacement.",
      "Placeholder section: we will include a sample monthly breakdown so students can compare their expectations against realistic figures.",
      "Placeholder close: knowing the numbers early makes the transition far less stressful.",
    ],
  },
  {
    slug: "why-i-started-futurewise",
    title: "Why I Started FutureWise",
    category: "My Journey",
    author: "Founder",
    date: "2026-06-18",
    displayDate: "18 June 2026",
    excerpt: "Placeholder reflection on the gap between school lessons and real-world readiness.",
    paragraphs: [
      "Placeholder introduction: this post will tell the origin story of FutureWise — the questions that went unanswered at school and the decision to build something about it.",
      "Placeholder section: a short account of early conversations with students, teachers, and professionals that shaped the direction of the project.",
      "Placeholder section: what the first version looked like, what did not work, and what the feedback changed.",
      "Placeholder close: the real reflection will replace this placeholder copy soon.",
    ],
  },
  {
    slug: "lessons-from-my-first-industry-interview",
    title: "Lessons From My First Industry Interview",
    category: "My Journey",
    author: "Founder",
    date: "2026-05-29",
    displayDate: "29 May 2026",
    excerpt: "Placeholder notes on preparation, nerves, and the questions that mattered most.",
    paragraphs: [
      "Placeholder introduction: the first professional interview is a steep learning curve, and most of the lessons are not about the answers you give.",
      "Placeholder section: preparation notes, the research that proved useful, and the parts that were wasted effort.",
      "Placeholder section: what the interviewer actually cared about, and how that reshaped later conversations.",
      "Placeholder close: full reflection coming with the real content update.",
    ],
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3) {
  const current = getPostBySlug(slug);
  if (!current) return [];
  const sameCategory = blogPosts.filter((p) => p.slug !== slug && p.category === current.category);
  const others = blogPosts.filter((p) => p.slug !== slug && p.category !== current.category);
  return [...sameCategory, ...others].slice(0, limit);
}
