import type { IndustrySlug } from "@/lib/content-schema";

export type ResourceSection =
  "Career Exploration" | "Financial Literacy" | "Oman-Specific" | "Skill Building";

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: ResourceSection[];
  /**
   * Industry Insights pages that list this resource under "Useful Links":
   * column F ("Industry") of Veer's resources sheet.
   */
  industries: IndustrySlug[];
  url: string;
  /**
   * A referral/affiliate link for this resource, used exactly as given
   * instead of `url` (no UTM tags added). Leave unset until a programme
   * is agreed; the Resources page must then say the link is a referral link.
   */
  affiliateUrl?: string;
}

export const resourceSections: ResourceSection[] = [
  "Career Exploration",
  "Financial Literacy",
  "Oman-Specific",
  "Skill Building",
];

export const resources: Resource[] = [
  {
    id: "notion",
    name: "Notion",
    description:
      "An all-in-one workspace for notes, databases, project management, planning and personal organization.",
    category: "Productivity & Organization",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://www.notion.com/",
  },
  {
    id: "airtable",
    name: "Airtable",
    description:
      "A flexible database and workflow platform useful for organizing projects, research, contacts and personal goals.",
    category: "Productivity & Organization",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://www.airtable.com/",
  },
  {
    id: "trello",
    name: "Trello",
    description:
      "A visual project-management platform using boards, lists and cards to organize tasks, projects and deadlines.",
    category: "Productivity & Organization",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://trello.com/",
  },
  {
    id: "canva",
    name: "Canva",
    description:
      "A design platform for creating presentations, CVs, portfolios, documents, graphics and professional materials.",
    category: "Design & Presentation",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://www.canva.com/",
  },
  {
    id: "claude",
    name: "Claude",
    description:
      "An AI assistant that can help students understand concepts, analyze information, brainstorm and work with documents.",
    category: "AI & Productivity",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://claude.ai/",
  },
  {
    id: "miro",
    name: "Miro",
    description:
      "A collaborative visual workspace useful for brainstorming, mind mapping, project planning and diagrams.",
    category: "Brainstorming & Collaboration",
    sections: ["Skill Building"],
    industries: ["entrepreneurship"],
    url: "https://miro.com/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description:
      "A professional networking platform where students can explore industries, companies and professionals and develop a professional presence.",
    category: "Professional Development",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.linkedin.com/",
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description:
      "A suite of tools including Docs, Sheets, Slides, Drive, Gmail and Calendar for academic and professional work.",
    category: "Productivity",
    sections: ["Skill Building"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://workspace.google.com/",
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    description:
      "A suite of professional productivity applications including Word, Excel, PowerPoint, OneDrive and Outlook.",
    category: "Productivity",
    sections: [],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.microsoft.com/microsoft-365/",
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "A platform for managing and collaborating on software projects that can help students demonstrate practical technical work.",
    category: "Technology & Projects",
    sections: [],
    industries: ["entrepreneurship"],
    url: "https://github.com/",
  },
  {
    id: "figma",
    name: "Figma",
    description:
      "A collaborative design and prototyping platform useful for students interested in design, technology and product development.",
    category: "Design & Technology",
    sections: [],
    industries: ["entrepreneurship"],
    url: "https://www.figma.com/",
  },
  {
    id: "google-forms",
    name: "Google Forms",
    description:
      "A simple tool for creating surveys, questionnaires and data-collection forms for projects and research.",
    category: "Surveys & Research",
    sections: [],
    industries: ["entrepreneurship"],
    url: "https://forms.google.com/",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "A spreadsheet tool useful for budgeting, data analysis, project tracking and developing practical financial skills.",
    category: "Data & Finance",
    sections: [],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://sheets.google.com/",
  },
  {
    id: "central-bank-of-oman",
    name: "Central Bank of Oman",
    description:
      "Oman's central bank and banking-sector regulator, providing authoritative information about the country's banking and financial system.",
    category: "Financial Education — Oman",
    sections: ["Oman-Specific"],
    industries: ["investment-banking-and-trading", "economics"],
    url: "https://cbo.gov.om/",
  },
  {
    id: "central-bank-of-oman-licensed-banks",
    name: "Central Bank of Oman — Licensed Banks",
    description:
      "An official directory of licensed banks operating in Oman that students can use to understand the local banking ecosystem.",
    category: "Financial Education — Oman",
    sections: ["Oman-Specific"],
    industries: ["investment-banking-and-trading", "economics"],
    url: "https://cbo.gov.om/pages/licensedbanks.aspx",
  },
  {
    id: "central-bank-of-oman-financial-system",
    name: "Central Bank of Oman — Financial System",
    description:
      "An official overview of Oman's financial system and the role of banking regulation and supervision.",
    category: "Financial Education — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://cbo.gov.om/pages/omanfinancialsystem.aspx",
  },
  {
    id: "financial-services-authority-oman",
    name: "Financial Services Authority Oman",
    description:
      "Oman's financial regulator responsible for areas including insurance, capital markets and accounting and auditing.",
    category: "Financial Regulation — Oman",
    sections: ["Oman-Specific"],
    industries: ["investment-banking-and-trading", "other-finance", "tax", "economics"],
    url: "https://fsa.gov.om/",
  },
  {
    id: "fsa-licensed-accredited-entities",
    name: "FSA — Licensed & Accredited Entities",
    description:
      "An official directory of licensed and accredited insurance companies, brokers, investment funds and other regulated entities.",
    category: "Financial Regulation — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://fsa.gov.om/Home/AuthorizedAndAccredited",
  },
  {
    id: "bank-muscat",
    name: "Bank Muscat",
    description:
      "One of Oman's major banks offering personal banking, savings, cards, financing and other financial services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://www.bankmuscat.om/",
  },
  {
    id: "national-bank-of-oman",
    name: "National Bank of Oman",
    description: "An Omani bank providing personal and business banking services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://www.nbo.om/",
  },
  {
    id: "bank-dhofar",
    name: "Bank Dhofar",
    description: "An Omani bank providing personal and business banking services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://www.bankdhofar.com/",
  },
  {
    id: "sohar-international",
    name: "Sohar International",
    description: "An Omani bank providing retail, corporate and digital banking services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://www.sib.om/",
  },
  {
    id: "oman-arab-bank",
    name: "Oman Arab Bank",
    description: "An Omani commercial bank providing personal and business financial services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: [
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "economics",
    ],
    url: "https://www.oman-arabbank.com/",
  },
  {
    id: "ahli-bank",
    name: "Ahli Bank",
    description:
      "An Omani bank providing personal banking, cards, financing and other financial services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["entrepreneurship", "other-finance", "economics"],
    url: "https://ahlibank.om/",
  },
  {
    id: "oman-housing-bank",
    name: "Oman Housing Bank",
    description:
      "A specialized Omani bank focused primarily on housing finance and related services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["entrepreneurship", "other-finance", "economics"],
    url: "https://www.ohb.co.om/",
  },
  {
    id: "development-bank-oman",
    name: "Development Bank Oman",
    description:
      "A development-focused financial institution supporting businesses and economic development in Oman.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://db.om/",
  },
  {
    id: "hsbc-oman",
    name: "HSBC Oman",
    description:
      "An international bank with an Oman presence offering corporate and commercial banking services.",
    category: "Banking — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://www.business.hsbc.om/",
  },
  {
    id: "liva-insurance",
    name: "Liva Insurance",
    description:
      "An insurance provider operating in Oman across areas including health, motor, life, home and travel insurance.",
    category: "Insurance — Oman",
    sections: ["Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://livainsurance.om/",
  },
  {
    id: "national-life-general-insurance",
    name: "National Life & General Insurance",
    description:
      "An Omani insurance company offering life, health, motor and general insurance products.",
    category: "Insurance — Oman",
    sections: ["Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.nlg.om/",
  },
  {
    id: "oman-qatar-insurance",
    name: "Oman Qatar Insurance",
    description:
      "An Oman-based insurance provider offering a range of general and life insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://oqic.com/",
  },
  {
    id: "oman-united-insurance",
    name: "Oman United Insurance",
    description:
      "An Omani insurance company providing various personal and commercial insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.omanutd.com/",
  },
  {
    id: "muscat-insurance",
    name: "Muscat Insurance",
    description: "An Omani insurance provider offering general and life insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.muscatinsurance.com/",
  },
  {
    id: "al-madina-insurance",
    name: "Al Madina Insurance",
    description:
      "An Omani insurer offering a range of general, health and life insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.almadinainsurance.com/",
  },
  {
    id: "takaful-oman",
    name: "Takaful Oman",
    description:
      "An Omani Sharia-compliant insurance provider offering takaful products for individuals and businesses.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.takafuloman.om/",
  },
  {
    id: "dhofar-insurance",
    name: "Dhofar Insurance",
    description: "An Omani insurance provider offering personal and commercial insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.dhofarinsurance.com/",
  },
  {
    id: "arabia-falcon-insurance",
    name: "Arabia Falcon Insurance",
    description:
      "An Oman-based insurance company providing various general and life insurance services.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.arabiafalcon.com/",
  },
  {
    id: "orient-insurance",
    name: "Orient Insurance",
    description: "An insurance provider operating in Oman and other regional markets.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "tax", "economics"],
    url: "https://www.insuranceuae.com/",
  },
  {
    id: "sukoon-insurance",
    name: "Sukoon Insurance",
    description:
      "An insurance company providing life, health and general insurance solutions in the region.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.sukoon.com/",
  },
  {
    id: "new-india-assurance-oman",
    name: "New India Assurance Oman",
    description:
      "An international insurance provider with an Oman presence offering general insurance products.",
    category: "Insurance — Oman",
    sections: ["Oman-Specific", "Financial Literacy"],
    industries: ["other-finance", "tax", "economics"],
    url: "https://www.newindia.co.in/",
  },
  {
    id: "oman-vision-2040",
    name: "Oman Vision 2040",
    description:
      "Oman's national long-term development framework covering economic, social, human-capital and institutional priorities.",
    category: "Government & Education",
    sections: ["Oman-Specific"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.oman2040.om/",
  },
  {
    id: "oman-ministry-of-labour",
    name: "Oman Ministry of Labour",
    description:
      "The government ministry responsible for labour-market, employment and workforce-related policy and services in Oman.",
    category: "Government & Employment",
    sections: ["Oman-Specific"],
    industries: ["other-finance", "economics"],
    url: "https://www.mol.gov.om/",
  },
  {
    id: "oman-chamber-of-commerce-and-industry",
    name: "Oman Chamber of Commerce and Industry",
    description:
      "A major business institution representing the private sector and providing opportunities for business and industry engagement.",
    category: "Business & Industry",
    sections: ["Oman-Specific"],
    industries: ["other-finance", "economics"],
    url: "https://omanchamber.om/",
  },
  {
    id: "gov-om",
    name: "Gov.om",
    description:
      "Oman's official government-services portal providing access to information and services from government entities.",
    category: "Government Services",
    sections: ["Oman-Specific"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://gov.om/",
  },
  {
    id: "bank-muscat-financial-education",
    name: "Bank Muscat Financial Education",
    description:
      "Bank Muscat's website provides students and consumers with information about banking products and financial services.",
    category: "Financial Education",
    sections: ["Oman-Specific", "Career Exploration", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://www.bankmuscat.om/",
  },
  {
    id: "central-bank-of-oman-financial-awareness",
    name: "Central Bank of Oman Financial Awareness",
    description:
      "The Central Bank provides official regulatory and financial-literacy information relevant to understanding Oman's financial system.",
    category: "Financial Education",
    sections: ["Oman-Specific", "Career Exploration", "Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://cbo.gov.om/",
  },
  {
    id: "fsa-insurance-sector",
    name: "FSA Insurance Sector",
    description:
      "An official resource explaining insurance companies, insurance products and the regulated insurance sector in Oman.",
    category: "Insurance Education",
    sections: ["Financial Literacy"],
    industries: ["other-finance", "economics"],
    url: "https://fsa.gov.om/Sector/DisplaySubsection/3",
  },
  {
    id: "fsa-capital-markets",
    name: "FSA Capital Markets",
    description:
      "The Financial Services Authority provides information about Oman's capital markets and regulated investment-sector entities.",
    category: "Financial Education",
    sections: ["Financial Literacy"],
    industries: ["investment-banking-and-trading", "other-finance", "economics"],
    url: "https://fsa.gov.om/",
  },
  {
    id: "coursera",
    name: "Coursera",
    description:
      "Online courses, certificates and guided projects from universities and companies across a wide range of career fields.",
    category: "Online Learning & Career Exploration",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.coursera.org/",
  },
  {
    id: "edx",
    name: "edX",
    description:
      "Online courses and programmes from universities and institutions that help students explore subjects and career paths.",
    category: "Online Learning & Career Exploration",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.edx.org/",
  },
  {
    id: "forage",
    name: "Forage",
    description:
      "Free virtual job simulations that let students experience real tasks from leading employers and explore career options.",
    category: "Virtual Work Experience",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.theforage.com/",
  },
  {
    id: "springpod",
    name: "Springpod",
    description:
      "Virtual work experience, university subject spotlights and career resources designed to help students explore their next steps.",
    category: "Virtual Work Experience",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.springpod.com/",
  },
  {
    id: "khan-academy",
    name: "Khan Academy",
    description:
      "Free lessons and practice across mathematics, economics, computing and other subjects that support academic and career exploration.",
    category: "Online Learning & Career Exploration",
    sections: ["Career Exploration"],
    industries: [
      "law",
      "entrepreneurship",
      "investment-banking-and-trading",
      "other-finance",
      "tax",
      "economics",
      "operations",
    ],
    url: "https://www.khanacademy.org/",
  },
];

/**
 * Shown on the Resources page and every Useful Links panel (tutor's wording,
 * 29 Oct 2026). It is only true while no resource has an `affiliateUrl`, so
 * those pages show the referral note instead once one does.
 */
export const LINKS_DISCLAIMER =
  "FutureWise is not affiliated with any of the links or resources mentioned here and does not earn revenue from them. They are shared solely for educational purposes, and FutureWise has no partnerships or formal agreements with them. Please consult them at your own risk.";

/** The resources in an industry page's Useful Links panel, in the sheet's order. */
export function resourcesForIndustry(industry: IndustrySlug): Resource[] {
  return resources.filter((resource) => resource.industries.includes(industry));
}
