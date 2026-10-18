/** Intercept the shared header's existing hash without modifying that component. */
export function landingCalendarFocus(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('a[href="#application"], a[href="#calendar"], button')) return;
  if (target.closest("a") && !target.closest('a[href="#application"], a[href="#calendar"]')) return;
  event.preventDefault();
  const card = document.getElementById("calendar");
  card?.focus({ preventScroll: true });
  card?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}
