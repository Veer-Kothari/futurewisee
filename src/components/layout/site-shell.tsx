import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Analytics } from "@/components/analytics/analytics";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Button } from "@/components/ui/button";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { menuIndustries } from "@/data/industries";
import { site } from "@/data/site";
import { useAuth } from "@/lib/auth";
import { analyticsId, openCookieSettings } from "@/lib/consent";
import { cn } from "@/lib/utils";

type NavChild = { label: string; to: string; hash?: string; search?: Record<string, string> };
type NavItem = { label: string; to: string; children?: NavChild[] };

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
    children: menuIndustries.map((industry) => ({
      label: industry.navLabel,
      to: `/industry-resources/${industry.slug}`,
    })),
  },
  {
    label: "Blog",
    to: "/blog",
    children: [
      { label: "Personal Finance", to: "/blog", search: { category: "personal-finance" } },
      { label: "Practical Skills", to: "/blog", search: { category: "practical-skills" } },
    ],
  },
  { label: "Resources", to: "/resources" },
];

const siteMapLinks: NavChild[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Industry Insights", to: "/industry-resources" },
  { label: "Blog", to: "/blog" },
  { label: "Resources", to: "/resources" },
  { label: "Get Involved", to: "/get-involved" },
];

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={cn("wordmark text-[1.55rem] font-bold", inverse && "wordmark-inverse")}>
      FutureWise
    </span>
  );
}

function ChildLink({
  child,
  className,
  onNavigate,
}: {
  child: NavChild;
  className: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={child.to}
      {...(child.hash ? { hash: child.hash } : {})}
      {...(child.search ? { search: child.search } : {})}
      className={className}
      onClick={onNavigate}
    >
      {child.label}
    </Link>
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
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-64 pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="border border-border bg-popover p-2 shadow-soft">
          {item.children.map((child) => (
            <ChildLink key={`${child.label}-${child.to}`} child={child} className="dropdown-link" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** "Log in" for visitors, "Account" when signed in; nothing when accounts aren't connected. */
function AccountButton({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { status } = useAuth();
  if (status === "unavailable") return null;
  if (status === "loading") {
    return <span aria-hidden="true" className={cn("inline-block h-11 w-[5.5rem]", className)} />;
  }
  const signedIn = status === "signed-in";
  return (
    <Button
      asChild
      variant="outline"
      size="pill"
      className={cn("border-navy text-navy hover:bg-navy hover:text-primary-foreground", className)}
    >
      <Link to={signedIn ? "/account" : "/login"} onClick={onNavigate}>
        {signedIn ? "Account" : "Log in"}
      </Link>
    </Button>
  );
}

/**
 * A phone-menu section: the name is a link to the section itself (no separate
 * "Overview" item) and the chevron button shows or hides its pages.
 */
function MobileGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const listId = `mobile-group-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className={cn(open && "bg-light-blue")}>
      <div className="flex items-center">
        <Link
          to={item.to}
          onClick={onNavigate}
          className="flex min-h-11 flex-1 items-center px-3 py-3 font-medium text-navy"
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${open ? "Hide" : "Show"} ${item.label} pages`}
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 shrink-0 place-items-center text-navy"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open ? (
        <div id={listId} className="space-y-1 px-3 pb-3">
          {item.children?.map((child) => (
            <ChildLink
              key={`${child.label}-${child.to}`}
              child={child}
              className="mobile-sub-link"
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  // Close the phone menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // While the phone menu is open: page scroll locked, Escape closes, focus moves in.
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <NavigationProgress />
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="site-container flex min-h-20 items-center justify-between gap-5">
          <Link to="/" aria-label="FutureWise home" onClick={close}>
            <Wordmark />
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden flex-1 items-center justify-center gap-1 xl:flex"
          >
            {navItems.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AccountButton className="hidden md:inline-flex" />
            <Button asChild variant="survey" size="pill" className="hidden sm:inline-flex">
              <Link to="/get-involved">Get Involved</Link>
            </Button>
            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              size="iconLg"
              className="xl:hidden"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Rendered outside the sticky header so it can scroll on short screens. */}
      {menuOpen ? (
        <nav
          ref={panelRef}
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto border-t border-border bg-background px-5 py-5 xl:hidden"
        >
          <div className="mx-auto max-w-3xl space-y-1 pb-10">
            {navItems.map((item) =>
              item.children ? (
                <MobileGroup key={item.label} item={item} onNavigate={close} />
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={close}
                  className="block min-h-11 px-3 py-3 font-medium text-navy hover:bg-light-blue"
                >
                  {item.label}
                </Link>
              ),
            )}
            <div className="grid gap-3 pt-4 sm:grid-cols-2">
              <AccountButton className="w-full" onNavigate={close} />
              <Button asChild variant="survey" size="pill" className="w-full">
                <Link to="/get-involved" onClick={close}>
                  Get Involved
                </Link>
              </Button>
            </div>
          </div>
        </nav>
      ) : null}
    </>
  );
}

const footerLink =
  "inline-flex min-h-6 items-center text-sm text-primary-foreground/80 transition-colors hover:text-light-blue";

function SiteFooter({ newsletter }: { newsletter: boolean }) {
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  useEffect(() => setShowCookieSettings(analyticsId() !== null), []);

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
              href={`mailto:${site.email}`}
              className="underline underline-offset-2 transition-colors hover:text-light-blue"
            >
              {site.email}
            </a>
          </p>
          {newsletter ? (
            <div className="mt-8">
              <h2 className="text-base font-semibold">Get new guides by email</h2>
              <div className="mt-3">
                <NewsletterForm tone="dark" />
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary-foreground">Quick Links</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <Link to="/privacy-policy" className={footerLink}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-use" className={footerLink}>
                Terms of Use
              </Link>
            </li>
            {showCookieSettings ? (
              <li>
                <button type="button" onClick={openCookieSettings} className={footerLink}>
                  Cookie settings
                </button>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary-foreground">Menu Sitemap</h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {siteMapLinks.map((link) => (
              <li key={link.label}>
                <ChildLink child={link} className={footerLink} />
              </li>
            ))}
            <li>
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLink}
              >
                LinkedIn Community
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="site-container flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-xs text-primary-foreground/70">© Copyright All Rights Reserved</p>
          <p className="max-w-4xl text-xs leading-relaxed text-primary-foreground/70">
            Disclaimer: FutureWise provides general educational and informational content only and
            does not provide legal, financial, investment, tax, career or other professional advice.
            FutureWise and its contributors are not licensed professionals. Information should not
            be relied upon as a substitute for qualified professional advice. Users should conduct
            their own research and seek appropriate professional guidance before making significant
            decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({
  children,
  newsletter = false,
}: {
  children: ReactNode;
  newsletter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-navy focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter newsletter={newsletter} />
      <Analytics />
    </div>
  );
}
