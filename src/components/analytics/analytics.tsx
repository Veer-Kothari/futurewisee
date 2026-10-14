import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  analyticsId,
  disableGoogleAnalytics,
  loadGoogleAnalytics,
  onConsentChange,
  onOpenCookieSettings,
  readConsent,
  trackPageView,
  writeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * Google Analytics behind a cookie choice. Renders nothing until a GA4
 * measurement ID is set in src/data/site.ts. The banner is a slim bar at the
 * bottom (it never covers the page), and GA loads only after "Accept".
 */
export function Analytics() {
  const id = analyticsId();
  const router = useRouter();
  const [consent, setConsent] = useState<ConsentChoice | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const stored = readConsent();
    setConsent(stored);
    setBannerOpen(stored === null);
    const offChange = onConsentChange((choice) => {
      setConsent(choice);
      setBannerOpen(false);
    });
    const offOpen = onOpenCookieSettings(() => setBannerOpen(true));
    return () => {
      offChange();
      offOpen();
    };
  }, [id]);

  useEffect(() => {
    if (!id || consent === null) return;
    if (consent === "granted") {
      loadGoogleAnalytics(id);
      trackPageView(window.location.pathname, document.title);
    } else {
      disableGoogleAnalytics(id);
    }
  }, [id, consent]);

  useEffect(() => {
    if (!id || consent !== "granted") return;
    return router.subscribe("onResolved", ({ toLocation, pathChanged }) => {
      if (!pathChanged) return;
      // Let the new page's <title> land first.
      window.setTimeout(() => trackPageView(toLocation.pathname, document.title), 0);
    });
  }, [id, consent, router]);

  if (!id || !bannerOpen) return null;

  return (
    <section
      aria-label="Cookie choice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background shadow-[0_-8px_24px_color-mix(in_oklab,var(--navy)_8%,transparent)]"
    >
      <div className="site-container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-charcoal">
          May FutureWise use Google Analytics cookies to see which pages help students? They are
          only set if you accept.{" "}
          <Link
            to="/privacy-policy"
            hash="analytics-and-cookies"
            className="font-semibold text-navy underline"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => writeConsent("denied")}
          >
            Decline
          </Button>
          <Button type="button" className="h-11" onClick={() => writeConsent("granted")}>
            Accept analytics
          </Button>
        </div>
      </div>
    </section>
  );
}
