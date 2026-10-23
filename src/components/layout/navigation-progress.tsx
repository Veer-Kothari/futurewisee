import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * A thin navy bar at the top of the window while the next page loads, shown
 * only when loading takes longer than 150 ms so quick clicks never flash it.
 * Decorative: screen readers hear the new page title when it arrives.
 */
export function NavigationProgress() {
  const loading = useRouterState({ select: (state) => state.isLoading });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, [loading]);

  if (!visible) return null;
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-navy/15">
      <div className="h-full w-1/3 animate-[nav-progress_1.1s_ease-in-out_infinite] bg-navy motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  );
}
