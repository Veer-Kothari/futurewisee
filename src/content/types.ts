/** Contract (claudex-split): rendered by src/routes/privacy-policy.tsx and terms-of-use.tsx. */
export type LegalSection = {
  /** kebab-case anchor id */
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  /** ISO date, yyyy-mm-dd */
  updated: string;
  intro: string[];
  sections: LegalSection[];
};
