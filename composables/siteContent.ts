/** Site revision date; privacy effective date is supplied separately by the owner. */
export const SITE_UPDATED = "2026-10-19";
export const siteSeo = {
  "/": {
    title: "Booked Kitchen & Bath Estimates for Remodelers | Solvenek",
    description: "Exclusive homeowner inquiries, never shared. We run the ads, follow up with leads and book your kitchen & bath estimates.",
  },
  "/conditions": {
    title: "Guarantee Conditions | Solvenek",
    description: "The exact conditions behind our 90-day booked-estimate guarantee: target, ad spend, creative, feedback and check-ins.",
  },
  "/privacy": {
    title: "Privacy Policy | Solvenek",
    description: "How Solvenek collects, uses and protects your information when you book a strategy call.",
  },
  "/confirmed": {
    title: "You’re booked | Solvenek",
    description: "Your meeting details have been sent to your email.",
  },
  error: {
    title: "Page not found | Solvenek",
    description: "The link may be broken, or the page may have moved.",
  },
} as const;

export const guaranteeConditions = [
  { id: "target", group: "Agreed up front", icon: "Target", text: "The target is agreed in writing before launch. As a starting point, 8 booked estimates a month, or 24 over the 90 days." },
  { id: "ad-spend", group: "Your part", icon: "Wallet", text: "The client keeps an ad spend of $30–50/day for the full 90 days." },
  { id: "creative", group: "Your part", icon: "Camera", text: "The client supplies photos and videos before launch." },
  { id: "feedback", group: "Your part", icon: "ClipboardCheck", text: "The client gives feedback on every lead through the tracking sheet." },
  { id: "check-ins", group: "Your part", icon: "CalendarCheck", text: "The client attends the weekly check-ins." },
  { id: "free", group: "What “free” means", icon: "Gift", text: "“Free” means our management fee for the next 30 days. The client still pays their own ad spend." },
] as const;
