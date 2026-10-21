import { createFileRoute } from "@tanstack/react-router";

import { getIndustryArticle } from "@/content/industry-articles";
import { industries } from "@/data/industries";
import { absoluteUrl, site } from "@/data/site";
import { listPublishedPosts } from "@/lib/content";

/** A plain-text summary for AI assistants: what FutureWise is and isn't, and where things are. */
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const posts = await listPublishedPosts({ limit: 30 });
        const lines = [
          `# ${site.name}`,
          "",
          `> ${site.description}`,
          "",
          "FutureWise is a student-led educational project for high school students in Oman aged 15–19. It explains industries and career paths, personal finance and the practical skills of living independently, and links to a curated directory of external resources. It supports the aims of Oman Vision 2040.",
          "",
          "It is not a registered company or charity and does not give legal, financial, investment, tax or career advice: its content is general educational information.",
          "",
          `Contact: ${site.email} · LinkedIn: ${site.linkedinUrl}`,
          "",
          "## Pages",
          `- [Home](${absoluteUrl("/")}): what FutureWise offers students`,
          `- [About](${absoluteUrl("/about")}): the project, the team and Oman Vision 2040`,
          `- [Industry Insights](${absoluteUrl("/industry-resources")}): ${
            industries.some((industry) => getIndustryArticle(industry.slug))
              ? "industry cheat sheets (what the industry does, its main areas, career paths, skills, qualifications and key terms), useful links, videos and course material"
              : "useful links, videos, course material and guides by industry"
          }`,
          ...industries.map(
            (industry) =>
              `  - [${industry.name}](${absoluteUrl(`/industry-resources/${industry.slug}`)}): ${industry.description}`,
          ),
          `- [Blog](${absoluteUrl("/blog")}): Personal Finance, The Practical Skills Guide and My Journey`,
          `- [Resources](${absoluteUrl("/resources")}): external resources for students in Oman (career, finance, skills, Oman-specific)`,
          `- [Survey](${absoluteUrl("/survey")}): five questions that shape what FutureWise covers next`,
          ...(posts.length
            ? [
                "",
                "## Latest posts",
                ...posts.map((post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})`),
              ]
            : []),
          "",
        ];
        return new Response(lines.join("\n"), {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
