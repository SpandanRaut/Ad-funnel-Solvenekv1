// Landing page copy: edit the first screen, form and testimonials here.

export interface Testimonial {
  name: string;
  role: string;
  business: string;
  /** Optional headline result shown above the quote. */
  result?: string;
  /** Copied verbatim from https://solvenek.com/ — do not paraphrase. */
  quote: string;
}

export const hero = {
  eyebrow: "FOR KITCHEN & BATHROOM REMODELERS",
  headline: "8–12 More Qualified Kitchen & Bath Estimates.",
  headlineHighlight: "Booked on Your Calendar. Every Month.",
  subhead:
    "Your leads are yours. Never shared with competitors. We agree on a booked-estimate target upfront. We hit your agreed booked-estimate target in 90 days, or your next 30 days of management are on us.",
  conditionsLabel: "Conditions apply.",
  bullets: [
    "Exclusive homeowner inquiries. Never sold to other contractors.",
    "First qualified estimates targeted within 21 days.",
    "We run the ads, follow up with leads, and book your estimates.",
    "No ads, funnels, or follow-up systems for you to build.",
  ],
};

export const applicationForm = {
  title: "See if Solvenek is a fit for your remodeling business.",
  subcopy: "A few quick details, then pick a time for your call.",
  button: "See if We're a Fit",
  nextSteps: "Pick a time → 30-minute call → we show you the plan.",
};

/** Shown as a compact strip directly above the form. Empty hides it. */
export const featuredTestimonials: Testimonial[] = [
  {
    name: "Pradeep Shrestha",
    role: "Owner",
    business: "Maya Decoration",
    result: "$6,000 generated through paid ads",
    quote:
      "They shipped what three other agencies had quoted us 6 months and $3,900 for — in five weeks, for a fraction of that. The difference is they actually build the thing themselves.",
  },
  {
    name: "Sunil Raut",
    role: "CEO",
    business: "Simca Laboratories Pvt Ltd",
    result:
      "$17,000 generated in 11 weeks through paid ads, qualified leads and instant follow-up",
    quote:
      "Running paid ads and managing our Facebook page used to be tricky for us. The new ad campaigns and regular posts helped keep our page active, and we started getting regular messages from genuine buyers without having to worry about it every day.",
  },
];

/** Shown in a smaller row below the form. Empty hides it. */
export const moreTestimonials: Testimonial[] = [
  {
    name: "Ujjwal KC",
    role: "Owner",
    business: "WE3 Fitness Garage",
    quote:
      "Reaching the right people for our gym was tough before. Once we started running targeted ads and posting proper content on Instagram, local people actually started seeing our page, asking for membership details, and coming in to join.",
  },
  {
    name: "Bhaskar Shrestha",
    role: "Owner",
    business: "Shrestha Food Frozen Store",
    quote:
      "Opening a new store is always stressful, but having a proper website made a big difference. They also helped us handle our Facebook and Instagram pages along with running paid ads, which brought in customers right from day one and made growing our store much easier.",
  },
];
