import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type FeaturedItem = {
  key: string;
  label: string;
  title: string;
  summary: string;
  to: string;
  hash?: string;
  action: string;
  date: string;
};

/**
 * The hero's right-hand column (eugovlab-style card stack, squared): the
 * latest published posts and Industry Insights items, one card at a time.
 * No autoplay; arrow buttons and the counter are announced politely.
 */
export function FeaturedCarousel({ items }: { items: FeaturedItem[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const item = items[Math.min(index, count - 1)];
  if (!item) return null;

  const go = (step: number) => setIndex((current) => (current + step + count) % count);

  return (
    <section aria-roledescription="carousel" aria-label="Latest from FutureWise" className="w-full">
      <p className="text-sm font-semibold text-navy">Latest from FutureWise</p>
      <div className="relative mt-5 pb-3 pr-3">
        {count > 1 ? (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 border border-border bg-light-grey"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-1.5 translate-y-1.5 border border-border bg-background"
            />
          </>
        ) : null}
        <article
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
          className="relative flex min-h-[17rem] flex-col border border-border border-t-2 border-t-navy bg-background p-7 shadow-soft"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue">{item.label}</p>
          <h2 className="mt-4 text-xl font-semibold leading-snug text-navy">{item.title}</h2>
          {item.summary ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-charcoal/75">{item.summary}</p>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <Link to={item.to} {...(item.hash ? { hash: item.hash } : {})} className="text-link">
              {item.action}
            </Link>
            {item.date ? <span className="text-xs text-charcoal/60">{item.date}</span> : null}
          </div>
        </article>
      </div>

      {count > 1 ? (
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous item"
            className="grid size-11 place-items-center border border-navy text-navy hover:bg-navy hover:text-primary-foreground"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <div className="flex gap-1.5" aria-hidden="true">
            {items.map((entry, position) => (
              <span
                key={entry.key}
                className={cn("h-1 w-6 bg-border", position === index && "bg-navy")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next item"
            className="grid size-11 place-items-center border border-navy text-navy hover:bg-navy hover:text-primary-foreground"
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
          <p aria-live="polite" className="ml-auto text-xs text-charcoal/60">
            {index + 1} / {count}
          </p>
        </div>
      ) : null}
    </section>
  );
}
