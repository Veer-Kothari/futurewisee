import { Link } from "@tanstack/react-router";
import { ChevronDown, Linkedin, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: string;
  children?: Array<{ label: string; to: string; hash?: string }>;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About Us",
    to: "/about",
    children: [
      { label: "The Project", to: "/about", hash: "project" },
      { label: "The Team", to: "/about", hash: "team" },
      { label: "Oman Vision 2040", to: "/about", hash: "vision-2040" },
    ],
  },
  {
    label: "Industry Resources",
    to: "/industry-resources",
    children: [
      { label: "Law", to: "/industry-resources/law" },
      { label: "Entrepreneurship", to: "/industry-resources/entrepreneurship" },
      {
        label: "Investment Banking & Trading",
        to: "/industry-resources/investment-banking-and-trading",
      },
      { label: "Other Finance", to: "/industry-resources/other-finance" },
      { label: "Tax", to: "/industry-resources/tax" },
      { label: "Economics", to: "/industry-resources/economics" },
      { label: "Operations", to: "/industry-resources/operations" },
    ],
  },
  {
    label: "Living Independently & Personal Finance",
    to: "/living-independently-and-personal-finance",
    children: [
      {
        label: "Personal Finance Blog",
        to: "/living-independently-and-personal-finance/personal-finance-blog",
      },
      {
        label: "My Journey Blog",
        to: "/living-independently-and-personal-finance/my-journey-blog",
      },
      {
        label: "Follow Us on LinkedIn",
        to: "/living-independently-and-personal-finance/linkedin",
      },
    ],
  },
  { label: "Tools and Resources", to: "/tools-and-resources" },
];

const footerGroups = [
  {
    title: "FutureWise",
    links: [
      { label: "Home", to: "/" },
      { label: "About Us", to: "/about" },
      { label: "The Project", to: "/about", hash: "project" },
      { label: "The Team", to: "/about", hash: "team" },
      { label: "Oman Vision 2040", to: "/about", hash: "vision-2040" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Industry Resources", to: "/industry-resources" },
      {
        label: "Independent Living & Finance",
        to: "/living-independently-and-personal-finance",
      },
      { label: "Tools and Resources", to: "/tools-and-resources" },
      { label: "Take the Survey", to: "/survey" },
    ],
  },
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
        <div className="rounded-card border border-border bg-popover p-2 shadow-soft">
          {item.children.map((child) => (
            <Link key={child.to} to={child.to} className="dropdown-link">
              {child.label}
            </Link>
          ))}
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
                <details key={item.to} className="group/mobile rounded-lg open:bg-light-blue">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 font-medium text-navy">
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 transition-transform group-open/mobile:rotate-180"
                    />
                  </summary>
                  <div className="space-y-1 px-3 pb-3">
                    <Link to={item.to} onClick={() => setMenuOpen(false)} className="mobile-sub-link">
                      Overview
                    </Link>
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        onClick={() => setMenuOpen(false)}
                        className="mobile-sub-link"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 font-medium text-navy hover:bg-light-blue"
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
      <div className="site-container grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr] lg:gap-20">
        <div className="max-w-sm">
          <Link to="/" aria-label="FutureWise home">
            <Wordmark inverse />
          </Link>
          <p className="mt-5 text-sm leading-7 text-primary-foreground/80">
            Helping high school students in Oman build knowledge and confidence for life beyond
            school.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-base font-semibold text-primary-foreground">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-teal"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-start-3">
          <h2 className="text-base font-semibold text-primary-foreground">Connect</h2>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="FutureWise on LinkedIn"
              className="inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/25 text-primary-foreground transition-colors hover:border-teal hover:text-teal"
            >
              <Linkedin aria-hidden="true" className="size-4" />
            </a>
            <a
              href="mailto:hello@futurewise.om"
              className="text-sm text-primary-foreground/75 transition-colors hover:text-teal"
            >
              hello@futurewise.om
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="site-container flex flex-col gap-2 py-6 text-xs text-primary-foreground/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FutureWise. All rights reserved.</p>
          <p>Built to support Oman Vision 2040</p>
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
