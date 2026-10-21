import { trackEvent } from "@/lib/consent";
import { trackResourceClick } from "@/lib/tracking.functions";

/**
 * A click on a resource link (Resources page or an industry page's Useful
 * Links): the GA event when analytics are accepted, plus the resource_clicks
 * row with the page it came from. Never blocks the link.
 */
export function recordResourceClick(resourceId: string): void {
  trackEvent("resource_click", { resource_id: resourceId });
  void trackResourceClick({
    data: { resourceId, path: window.location.pathname },
  }).catch(() => undefined);
}
