import type { LegalDoc } from "./types";

export const privacyPolicy: LegalDoc = {
  title: "Privacy Policy",
  updated: "2026-10-29",
  intro: [
    "FutureWise is a student-led educational project for high school students in Oman, aged about 15–19. Parents and educators also use it. It is not a registered company or charity.",
    "This policy explains what information we collect and how we use it. For privacy requests or questions, email partners@futurewiseapp.org.",
  ],
  sections: [
    {
      id: "accounts",
      heading: "What do we collect for an account?",
      paragraphs: [
        "We collect your name, email address, confirmation that you are 16 or older or have a parent’s or guardian’s agreement, and your choice about email updates. Your password is handled by the sign-in provider. FutureWise never sees it.",
        "We use this information to let you sign in, save your survey answers and send emails if you choose them. Database and sign-in services run on Lovable Cloud, which is built on Supabase.",
      ],
    },
    {
      id: "survey-answers",
      heading: "How do we use survey answers?",
      paragraphs: [
        "FutureWise no longer runs this survey, but we keep the answers already given. Its five questions asked how you heard about FutureWise, which description fits you, which industries interest you, what you need help with and how confident you feel about your career direction on a scale of 1–5.",
        "Answers could be submitted without an account. Those answers are not linked to a name or email address. Answers given while creating an account or logging in are linked to that account.",
        "We use answers to decide what FutureWise covers next. We may share results as totals, never as individual answers.",
      ],
    },
    {
      id: "resource-clicks",
      heading: "What happens when you open a resource?",
      paragraphs: [
        "When you click a resource on the Resources page or under Useful Links on an Industry Insights page, we record the resource, the page and the time. If you are signed in, we also link the click to your account.",
        "Outbound resource links include the tags utm_source=futurewise, utm_medium=referral and utm_campaign=resources. These tell the other website that your visit came from FutureWise.",
        "FutureWise does not currently receive money for these links. If we add referral or affiliate links in future, we will say so on the Resources page and update this policy.",
      ],
    },
    {
      id: "email-updates",
      heading: "When will we email you?",
      paragraphs: [
        "We use Mailchimp, operated by Intuit, for email updates. Signing up on the Get Involved page includes them: emails with FutureWise content, resources and partner information. You can also choose them by ticking the box when you create an account elsewhere, on the Account page, or through the newsletter form.",
        "Mailchimp sends a confirmation email first. You need to confirm before receiving updates. This is called double opt-in. Once you confirm, FutureWise may send a short series of follow-up emails with updates and resources.",
        "Every email has an unsubscribe link. Unticking the email-updates setting on the Account page also unsubscribes you. To delete your Mailchimp data, email partners@futurewiseapp.org.",
      ],
    },
    {
      id: "analytics-and-cookies",
      heading: "Which analytics cookies do we use?",
      paragraphs: [
        "Google Analytics 4, provided by Google, loads only after you click ‘Accept analytics’ in the cookie banner. If you decline, it is not loaded. It measures pages viewed and resource clicks.",
        "Google Analytics sets cookies named _ga and _ga_<ID>, which can last up to two years. You can change your choice at any time through ‘Cookie settings’ in the footer.",
        "Our site is hosted on Lovable, with servers on the Cloudflare network. Lovable records basic page-view statistics for the site owner and may set a short session cookie.",
      ],
    },
    {
      id: "browser-storage",
      heading: "What is stored in your browser?",
      paragraphs: ["We use browser storage for sign-in and for choices you make."],
      bullets: [
        "Your sign-in session is kept in local storage under a key starting with sb-.",
        "Your cookie choice is stored as fw-cookie-consent.",
        "A temporary survey link token is stored as fw-pending-survey until you sign in after confirming your email. It lets us link your answers to your account.",
      ],
    },
    {
      id: "other-providers",
      heading: "Which other providers load on the site?",
      paragraphs: [
        "YouTube videos from youtube-nocookie.com and Vimeo videos on Industry Insights and blog pages load only when you press play. Fonts and resource logos are served from FutureWise itself.",
        "The providers described in this policy may process data outside Oman.",
      ],
    },
    {
      id: "access-and-abuse-prevention",
      heading: "Who can see records?",
      paragraphs: [
        "Only FutureWise administrators can see survey answers and resource-click records.",
        "To stop spam and abuse we briefly keep a record of attempts, linked to your connection’s IP address, your account (for account actions) or a scrambled form of your email address (for email sign-ups). These records are deleted after about a day.",
      ],
    },
    {
      id: "keeping-and-deleting-data",
      heading: "How long do we keep data?",
      paragraphs: [
        "We keep account data until the account is deleted. You can delete your account through ‘Delete account’ on the Account page. This removes your profile and the survey answers linked to it. Resource-click records remain but lose their link to your account.",
        "Anonymous survey answers are kept for research and cannot be traced to a person.",
        "You can download your account data as a JSON file through ‘Download my data’ on the Account page. For other privacy requests, email partners@futurewiseapp.org. For Mailchimp data, unsubscribe or email us to ask for deletion.",
      ],
    },
    {
      id: "under-16s",
      heading: "What if you are under 16?",
      paragraphs: [
        "You need a parent’s or guardian’s agreement to create an account if you are under 16. Parents or guardians can ask us to delete a child’s account by emailing partners@futurewiseapp.org.",
      ],
    },
  ],
};

export const termsOfUse: LegalDoc = {
  title: "Terms of Use",
  updated: "2026-10-14",
  intro: [
    "These terms explain how to use FutureWise. FutureWise is a student-led educational project for high school students in Oman. Parents and educators also use it. It is not a registered company or charity.",
  ],
  sections: [
    {
      id: "educational-information",
      heading: "Educational information",
      paragraphs: [
        "FutureWise provides general educational and informational content only. We do not provide legal, financial, investment, tax, career or other professional advice. Our contributors are not licensed professionals.",
        "Do your own research and get advice from a qualified professional before making significant decisions.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts",
      paragraphs: [
        "You must be 16 or older to create an account, or have a parent’s or guardian’s agreement if you are under 16. Give accurate details, keep your password private and use one account for one person.",
        "We may suspend accounts used to misuse the site. You can delete your account at any time through ‘Delete account’ on the Account page. Parents or guardians can ask us to delete a child’s account by emailing partners@futurewiseapp.org.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      paragraphs: ["Use the site responsibly."],
      bullets: [
        "Do not send spam.",
        "Do not try to break or overload the site.",
        "Do not submit false survey answers at scale.",
        "Do not scrape other users’ data.",
      ],
    },
    {
      id: "content-ownership",
      heading: "Who owns the content?",
      paragraphs: [
        "FutureWise’s own text belongs to FutureWise and its authors. External resources, names and logos belong to their owners. We show them only to identify those resources. This does not imply an endorsement or partnership.",
      ],
    },
    {
      id: "external-links",
      heading: "External links",
      paragraphs: [
        "Other websites have their own terms. FutureWise is not responsible for those websites.",
        "Outbound resource links include the tags utm_source=futurewise, utm_medium=referral and utm_campaign=resources. These tell the other website that the visit came from FutureWise.",
        "FutureWise does not currently receive money for these links. If we add referral or affiliate links in future, we will say so on the Resources page and update our Privacy Policy.",
      ],
    },
    {
      id: "survey-answers",
      heading: "Survey answers",
      paragraphs: [
        "By submitting survey answers, you let FutureWise use them to improve the project. We publish results only as totals, never as individual answers.",
      ],
    },
    {
      id: "availability",
      heading: "Availability and changes",
      paragraphs: ["The site may change or pause. We do not guarantee that it is free of errors."],
    },
    {
      id: "responsibility-for-decisions",
      heading: "Responsibility for decisions",
      paragraphs: [
        "To the extent the law allows, FutureWise is not liable for decisions you make based on its general information.",
      ],
    },
    {
      id: "changes-to-these-terms",
      heading: "Changes to these terms",
      paragraphs: ["If we change these terms, we will change the date at the top of this page."],
    },
    {
      id: "contact",
      heading: "Contact",
      paragraphs: [
        "For questions about these terms or the project, email partners@futurewiseapp.org.",
      ],
    },
  ],
};
