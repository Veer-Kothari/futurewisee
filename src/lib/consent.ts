import { site } from "@/data/site";

/**
 * The visitor's cookie choice for Google Analytics, kept in localStorage
 * (fw-cookie-consent). GA only loads after "Accept analytics"; with no GA
 * measurement ID set there is nothing to choose and no banner.
 */
export type ConsentChoice = "granted" | "denied";

const KEY = "fw-cookie-consent";
const CHANGE_EVENT = "fw-consent-change";
const OPEN_EVENT = "fw-cookie-settings";

export function analyticsId(): string | null {
  const id = site.googleAnalyticsId.trim();
  return /^G-[A-Z0-9]{4,15}$/.test(id) ? id : null;
}

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CHANGE_EVENT, { detail: choice }));
}

export function onConsentChange(listener: (choice: ConsentChoice) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<ConsentChoice>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** The footer's "Cookie settings" button reopens the banner. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(listener: () => void): () => void {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}

type Gtag = (...args: unknown[]) => void;
type GaWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag; __fwGaLoaded?: boolean } & Record<
    string,
    unknown
  >;

export function loadGoogleAnalytics(id: string) {
  const w = window as unknown as GaWindow;
  w[`ga-disable-${id}`] = false;
  if (w.__fwGaLoaded) return;
  w.__fwGaLoaded = true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js expects the arguments object itself.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer?.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", id, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function disableGoogleAnalytics(id: string) {
  const w = window as unknown as GaWindow;
  w[`ga-disable-${id}`] = true;
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim() ?? "";
    if (name === "_ga" || name.startsWith("_ga_")) {
      for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
      }
    }
  }
}

export function trackPageView(path: string, title: string) {
  const w = window as unknown as GaWindow;
  const id = analyticsId();
  if (!id || !w.gtag || readConsent() !== "granted") return;
  w.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackEvent(name: string, params: Record<string, string | number>) {
  const w = window as unknown as GaWindow;
  if (!analyticsId() || !w.gtag || readConsent() !== "granted") return;
  w.gtag("event", name, params);
}
