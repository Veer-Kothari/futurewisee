import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  eyebrow,
  description = "Thoughtful guidance and practical resources are coming soon.",
}: {
  title: string;
  eyebrow: string;
  description?: string;
}) {
  return (
    <section className="page-intro">
      <div className="site-container py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>
          <Button asChild variant="outline" size="lg" className="mt-9">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
