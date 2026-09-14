export type ResourceCategory =
  | "Career Exploration"
  | "Scholarships"
  | "Financial Literacy"
  | "Oman-Specific"
  | "Skill Building";

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  url: string;
}

export const resourceCategories: ResourceCategory[] = [
  "Career Exploration",
  "Scholarships",
  "Financial Literacy",
  "Oman-Specific",
  "Skill Building",
];

export const resources: Resource[] = [
  {
    id: "oman-vision-2040",
    name: "Oman Vision 2040 Portal",
    description:
      "The official portal for Oman’s long-term development vision, with sections on education, economy, and youth empowerment.",
    category: "Oman-Specific",
    url: "https://www.oman2040.om",
  },
  {
    id: "ministry-of-education",
    name: "Ministry of Education Oman",
    description:
      "Ministry announcements, student guidance, and links to national scholarship and career programmes.",
    category: "Oman-Specific",
    url: "https://www.moe.gov.om",
  },
  {
    id: "scholarship-office",
    name: "Oman Scholarship Office",
    description:
      "A starting point for finding local and international scholarship opportunities for Omani students.",
    category: "Scholarships",
    url: "https://www.scholarships.gov.om",
  },
  {
    id: "investopedia",
    name: "Investopedia",
    description:
      "Plain-language explanations of finance, investing, and money terms that come up in school and early careers.",
    category: "Financial Literacy",
    url: "https://www.investopedia.com",
  },
  {
    id: "khan-academy",
    name: "Khan Academy",
    description:
      "Free lessons and practice in maths, economics, computing, and personal finance fundamentals.",
    category: "Skill Building",
    url: "https://www.khanacademy.org",
  },
  {
    id: "coursera",
    name: "Coursera for Campus",
    description:
      "Online courses and certificates from universities and companies, useful for exploring career interests.",
    category: "Skill Building",
    url: "https://www.coursera.org",
  },
  {
    id: "linkedin-learning",
    name: "LinkedIn Learning",
    description:
      "Short courses on workplace skills, software, and career paths, with samples of different industries.",
    category: "Career Exploration",
    url: "https://www.linkedin.com/learning",
  },
  {
    id: "oxy-careers",
    name: "OXY Careers Oman",
    description:
      "A placeholder example of an Oman-based employer careers page for seeing real job requirements and pathways.",
    category: "Career Exploration",
    url: "https://www.oxy.com/careers",
  },
];
