import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  children?: Array<{ label: string; to: string; hash?: string }>;
};

type IndustryNavItem = {
  label: string;
  to: string;
  hasPublishedContent: boolean;
};

const industryNavItems: IndustryNavItem[] = [
  { label: "Law", to: "/industry-resources/law", hasPublishedContent: true },
  {
    label: "Entrepreneurship",
    to: "/industry-resources/entrepreneurship",
    hasPublishedContent: true,
  },
  {
    label: "Investment Banking & Trading",
    to: "/industry-resources/investment-banking-and-trading",
    hasPublishedContent: true,
  },
  { label: "Finance", to: "/industry-resources/other-finance", hasPublishedContent: true },
  { label: "Tax", to: "/industry-resources/tax", hasPublishedContent: true },
  { label: "Economics", to: "/industry-resources/economics", hasPublishedContent: true },
  { label: "Operations", to: "/industry-resources/operations", hasPublishedContent: true },
];

const publishedIndustryNavItems = industryNavItems
  .filter((item) => item.hasPublishedContent)
  .map(({ label, to }) => ({ label, to }));

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About Us",
    to: "/about",
    children: [
      { label: "Initiative", to: "/about", hash: "project" },
      { label: "Team", to: "/about", hash: "team" },
      { label: "Oman Vision 2040", to: "/about", hash: "vision-2040" },
    ],
  },
  {
    label: "Industry Insights",
    to: "/industry-resources",
    children: publishedIndustryNavItems,
  },
  {
    label: "Blog",
    to: "/blog",
    children: [
      {
        label: "Personal Finance Blog",
        to: "/blog",
      },
      {
        label: "The Practical Skills Guide",
        to: "/living-independently-and-personal-finance/the-practical-skills-guide",
      },
    ],
  },
  { label: "Resources", to: "/resources" },
];

const siteMapLinks: Array<{ label: string; to: string; hash?: string }> = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Industry Insights", to: "/industry-resources" },
  { label: "Blog", to: "/blog" },
  { label: "Resources", to: "/resources" },
  { label: "Take the Survey", to: "/survey" },
];

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={cn("wordmark text-[1.55rem] font-bold", inverse && "wordmark-inverse")}>
      FutureWise
    </span>
  );
}

function DesktopNavItem({ item }: { item: NavItem }) {
  if (!item.children) {
    return (
      <Link
        to={item.to}
        className="nav-link"
        activeProps={{ className: "nav-link nav-link-active" }}
        activeOptions={{ exact: item.to === "/" }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        to={item.to}
        className="nav-link inline-flex items-center gap-1"
        activeProps={{ className: "nav-link nav-link-active inline-flex items-center gap-1" }}
      >
        {item.label}
        <ChevronDown aria-hidden="true" className="size-3.5 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-sm border border-border bg-popover p-2 shadow-soft">
          {item.children.map((child) =>
            child.hash ? (
              <Link
                key={`${child.to}-${child.hash}`}
                to={child.to}
                hash={child.hash}
                className="dropdown-link"
              >
                {child.label}
              </Link>
            ) : (
              <Link key={child.to} to={child.to} className="dropdown-link">
                {child.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="site-container flex min-h-20 items-center justify-between gap-5">
        <Link to="/" aria-label="FutureWise home" onClick={() => setMenuOpen(false)}>
          <Wordmark />
        </Link>

        <nav aria-label="Main navigation" className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {navItems.map((item) => (
            <DesktopNavItem key={item.to} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="survey" size="pill" className="hidden sm:inline-flex">
            <Link to="/survey">Take the Survey</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="iconLg"
            className="xl:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-background px-5 py-5 shadow-soft xl:hidden"
        >
          <div className="mx-auto max-w-3xl space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <details key={item.to} className="group/mobile rounded-sm open:bg-light-blue">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 font-medium text-navy">
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 transition-transform group-open/mobile:rotate-180"
                    />
                  </summary>
                  <div className="space-y-1 px-3 pb-3">
                    {item.children.map((child) =>
                      child.hash ? (
                        <Link
                          key={`${child.to}-${child.hash}`}
                          to={child.to}
                          hash={child.hash}
                          onClick={() => setMenuOpen(false)}
                          className="mobile-sub-link"
                        >
                          {child.label}
                        </Link>
                      ) : (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setMenuOpen(false)}
                          className="mobile-sub-link"
                        >
                          {child.label}
                        </Link>
                      ),
                    )}
                  </div>
                </details>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-sm px-3 py-3 font-medium text-navy hover:bg-light-blue"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Button asChild variant="survey" size="pill" className="mt-4 w-full sm:hidden">
              <Link to="/survey" onClick={() => setMenuOpen(false)}>
                Take the Survey
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="site-container grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1.3fr] lg:gap-20">
        <div className="max-w-sm">
          <Link to="/" aria-label="FutureWise home">
            <Wordmark inverse />
          </Link>
          <p className="mt-5 text-sm leading-7 text-primary-foreground/80">
            Any Questions? E-mail{" "}
            <a
              href="mailto:partners@futurewiseapp.org"
                className="underline underline-offset-2 transition-colors hover:text-light-blue"
            >
              partners@futurewiseapp.org
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary-foreground">Quick Links</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link
                to="/privacy-policy"
                className="text-sm text-primary-foreground/75 transition-colors hover:text-light-blue"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-of-use"
                className="text-sm text-primary-foreground/75 transition-colors hover:text-light-blue"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary-foreground">Menu Sitemap</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {siteMapLinks.map((link) =>
              link.hash ? (
                <li key={`${link.to}-${link.hash}`}>
                  <Link
                    to={link.to}
                    hash={link.hash}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-light-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-light-blue"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="site-container flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-xs text-primary-foreground/65">© Copyright All Rights Reserved</p>
          <p className="max-w-4xl text-xs leading-relaxed text-primary-foreground/60">
            Educational Disclaimer: FutureWise provides general educational and informational
            content only and does not provide legal, financial, investment, tax, career or other
            professional advice. FutureWise and its contributors are not licensed professionals.
            Information should not be relied upon as a substitute for qualified professional
            advice. Users should conduct their own research and seek appropriate professional
            guidance before making significant decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
