# FutureWise — handover (revision round, October 2026)

This file is for Veer: what changed, how to run the site yourself, and what still
needs setting up. The live site is https://futurewisee.lovable.app (it moves to
https://futurewiseapp.org once that domain is connected — see "Domain" below).

## What changed in this round

| From your deck | What the site does now |
|---|---|
| Navigation and footer (slides 2, 3, 6) | One "Industry Insights" menu with the seven industries; "Blog" holds the Personal Finance Blog and The Practical Skills Guide; no "Overview" items; footer sitemap matches the menu, plus "LinkedIn Community". Old addresses (/living-independently-…, /industries) redirect to the new pages. |
| Less "AI look" (slide 4) | No small grey headers above titles, no decorative icons, no "Back to …" links, square corners everywhere, no turquoise — navy and blue only. The 404 and error pages sit inside the normal site layout. |
| Resources (slide 7) | Static cards (no pop-up effect), each with its logo and the real web address as the link; the category label is gone. Every link carries `utm_source=futurewise&utm_medium=referral&utm_campaign=resources`, and every click is recorded (with the account, if the person is signed in). |
| Referral tracking (slide 10) | The click records above, plus room for a referral link per resource (`affiliateUrl` in `src/data/resources.ts`). No money is received today; if you add referral links the Resources page labels them automatically and the Privacy Policy must be updated. |
| LinkedIn (slides 10, 12, 13) | Every LinkedIn link goes to https://www.linkedin.com/company/futurewiseapp/; the callout says "Follow FutureWise on LinkedIn and join our LinkedIn Community" with a "LinkedIn Community" button. |
| Accounts (slide 11) | Log in / sign up / forgot password / your account page (change name, email choice, see your survey answers, download your data, delete your account). Under-16s need a parent's or guardian's agreement — the sign-up form asks, and the database refuses sign-ups without it. |
| Survey (slides 5, 11) | Intro page, five questions, then: create an account, log in, or submit without an account. Every response is saved in the database. |
| Your editor (slide 10) | **/admin** — write and publish blog posts and Industry Insights items (videos, course material as PDF or link, guides, links), see survey answers and resource clicks, download them as CSV. |
| Emails with Mailchimp (slides 5, 14) | A newsletter sign-up in the footer and on the homepage, and account holders who tick "email me" are added to Mailchimp with tags (`account`, `survey-completed`, `website-signup`). Turns on when the Mailchimp keys are added (below). |
| Google Analytics + cookies (slides 5, 20) | A slim cookie bar asks first; Google Analytics only loads after "Accept analytics". Turns on when the measurement ID is added (below). |
| Privacy Policy, Terms of Use (slide 20) | Real pages, written to match exactly what the site does. **Please read both** and tell us anything that isn't right. |
| Look and feel (slide 19) | The homepage follows the eugovlab.com structure — headline with a card carousel of your latest posts and insights, then Industry Insights, the blog, the resources directory, Oman Vision 2040 and the survey — in FutureWise's square navy style. |
| SEO (slide 21) | Every page has its own title and description (table below), a share image, a sitemap, robots.txt and llms.txt for AI assistants. |

## Using the editor (/admin)

1. Sign up on the site with the email you want to use as the editor, confirm the email, then ask Herdy to make that account an editor (one database command).
2. Go to **/admin** (it isn't linked in the menu; it also appears on your Account page once you're an editor).
3. **Blog posts:** New post → title (the web address fills itself in), section, author, a short summary, the post itself, optional cover image (with a one-sentence description) and optional YouTube/Vimeo link → tick "Published" → Save. Untick "Published" to hide a post again.
4. **Industry Insights:** pick the industry → New item → type:
   - *Video* — a YouTube or Vimeo link (it only loads when someone presses play);
   - *Course material* — upload a PDF/image (up to 20 MB) and/or link to an online course;
   - *Guide* — written text;
   - *Link* — any useful page.
   "Order on the page" decides what shows first (lower numbers first).
5. Writing format for posts and guides: a blank line starts a new paragraph; `## Heading`; `- list item`; `**bold**`; `*italic*`; `[link text](https://…)`.
6. Only use photos you have permission to use. Anyone under 18 shown in a photo needs a parent's or guardian's written consent.
7. **Survey responses** and **Resource clicks** tabs: totals, the latest entries, and "Download … as CSV".

## Still to set up (who does what)

| What | Who | How |
|---|---|---|
| Database tables and storage | Herdy | Lovable prompt (run once). Until then accounts, the survey and /admin show "not available yet". |
| Make your account the editor | Herdy | After you sign up, one database command with your sign-up email. |
| Mailchimp | Veer | In Mailchimp: Account → Extras → API keys → create a key; Audience → Settings → Audience name and defaults → copy the Audience ID. Send both to Herdy privately (never in a deck or chat group) — they go into Lovable Cloud → Secrets as `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID`. Then in Mailchimp create a Customer Journey that starts when the tag `survey-completed` is added (your follow-up emails after the survey). Mailchimp's free plan may limit journeys to one email; a longer drip may need a paid plan. |
| Google Analytics | Veer | Create a GA4 property for the site and copy the Measurement ID (starts with `G-`). Paste it into `googleAnalyticsId` in `src/data/site.ts` (or ask Lovable: "Set googleAnalyticsId in src/data/site.ts to G-…"). The cookie bar appears from then on. |
| Domain futurewiseapp.org | Veer (with Herdy) | Either connect it in Lovable (Project settings → Domains; needs a paid Lovable plan) or move hosting later. When the domain works, change `siteUrl` in `src/data/site.ts` to `https://futurewiseapp.org` and add it to the allowed sign-in addresses (Lovable Cloud → Users → Authentication → URL configuration). Change your Squarespace password if it has been shared anywhere. |
| Search Console | Veer | After the domain is connected: verify it, submit `https://<your domain>/sitemap.xml`. |

## Page titles and descriptions (slide 21)

| Page | Title | Chars | Meta description | Chars |
|---|---|---:|---|---:|
| `/` | FutureWise — Practical knowledge for students in Oman | 53 | FutureWise helps high school students in Oman aged 15-19 explore careers, industries, money, and independent adulthood. | 119 |
| `/about` | About Us — FutureWise | 21 | Meet the team behind FutureWise, learn about the project, and see how we support Oman Vision 2040. | 98 |
| `/industry-resources` | Industry Insights — FutureWise | 30 | Introductions to seven industries, their roles, and the routes students can take into them. | 91 |
| `/industry-resources/law` (each industry) | Law — FutureWise | 16 | Explore pathways, roles, and practical insights for a future in law. | 68 |
| `/blog` | Blog — FutureWise | 17 | Student-written notes on managing money, preparing to live independently, and making the move from school into further study and work. | 134 |
| `/blog?category=personal-finance` | Personal Finance Blog — FutureWise | 34 | Practical perspectives to help students understand, manage, and plan their money. | 81 |
| `/blog?category=practical-skills` | The Practical Skills Guide — FutureWise | 39 | Hands-on guidance for everyday skills that help students live more independently. | 81 |
| `/blog/<post>` | (post title) — FutureWise | ≤ 60 | The post's short summary | ≤ 155 |
| `/resources` | Resources — FutureWise | 22 | A curated directory of useful external sites for students and young people in Oman. | 83 |
| `/survey` | Take the Survey — FutureWise | 28 | Share your perspective and help FutureWise create resources that work for students in Oman. | 91 |
| `/privacy-policy` | Privacy Policy — FutureWise | 27 | What FutureWise collects (accounts, survey answers, resource clicks, optional emails and analytics), why, and how to download or delete your data. | 146 |
| `/terms-of-use` | Terms of Use — FutureWise | 25 | The terms for using FutureWise, a student-led educational project for high school students in Oman: accounts, acceptable use and external links. | 144 |

Titles stay under 60 characters and descriptions under 155 so search results don't cut them off. Account, sign-in and editor pages are hidden from search engines.

## Promises the site makes (keep them true)

- Google Analytics only runs after "Accept analytics". Don't add other trackers without updating the Privacy Policy and the cookie bar.
- Survey answers are shown publicly only as totals, never individually.
- If you add referral/affiliate links, they are labelled on the Resources page and the Privacy Policy is updated first.
- Emails only go to people who ticked the box and confirmed in Mailchimp.
- Deleting an account deletes the person's details and the survey answers linked to it. Requests by email (partners@futurewiseapp.org) — including a parent asking to delete a child's account — are handled by deleting the account in Lovable Cloud → Users.

## Changing things with Lovable

Everything is still editable with Lovable prompts. Useful ones:

- "Add a resource to `src/data/resources.ts`: name …, description …, section …, url …" (and add its logo to `src/assets/resource-logos/<id>.png`).
- "Change the homepage hero paragraph in `src/routes/index.tsx` to: …"
- Please don't ask Lovable to rebuild the survey, the account pages or /admin — they are wired to the database and its access rules; ask Herdy instead.

## Removing developer access

Herdy is a collaborator, not an owner. To remove access later: Lovable → Project settings → Collaborators (and the GitHub repository's Collaborators page) → remove. Editor rights on the site are removed with one database command (Lovable Cloud → Database → `user_roles`, delete the row).
