import { Fragment } from "react";

import type { LegalDoc } from "@/content/types";
import { site } from "@/data/site";
import { formatDate } from "@/lib/content";

/** Turns the contact address inside legal text into a mail link. */
function withEmailLinks(text: string) {
  const parts = text.split(site.email);
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 ? (
        <a
          href={`mailto:${site.email}`}
          className="font-semibold text-navy underline underline-offset-2"
        >
          {site.email}
        </a>
      ) : null}
    </Fragment>
  ));
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <section className="page-intro">
        <div className="site-container py-16 sm:py-20">
          <h1 className="text-4xl font-bold text-navy sm:text-5xl">{doc.title}</h1>
          <p className="mt-4 text-sm text-charcoal/65">Last updated {formatDate(doc.updated)}</p>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-charcoal/85">
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{withEmailLinks(paragraph)}</p>
            ))}
          </div>
        </div>
      </section>

      <div className="site-container grid gap-12 py-14 lg:grid-cols-[16rem_1fr]">
        <nav aria-label={`${doc.title} sections`} className="lg:sticky lg:top-28 lg:self-start">
          <ul className="space-y-1 border-l border-border text-sm">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px flex min-h-9 items-center border-l-2 border-transparent pl-4 text-charcoal/80 hover:border-navy hover:text-navy"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-12">
          {doc.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl font-semibold text-navy">{section.heading}</h2>
              <div className="mt-4 space-y-4 leading-8 text-charcoal/85">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{withEmailLinks(paragraph)}</p>
                ))}
                {section.bullets?.length ? (
                  <ul className="list-[square] space-y-2 pl-6">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{withEmailLinks(bullet)}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
