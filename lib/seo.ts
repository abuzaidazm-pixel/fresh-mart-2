// =====================================================================
// lib/seo.ts
// SINGLE SOURCE OF TRUTH for everything SEO.
// Fix the values here ONCE and the whole site stays consistent.
// Google penalises sites where the address/phone differ page to page.
// =====================================================================

// When you buy a custom domain, change ONLY this line.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fresh-mart-2.vercel.app";

export const SITE = {
  name: "FreshMart Local",
  legalName: "FreshMart Local",
  tagline: "Groceries delivered in 30 minutes",
  description:
    "Fresh organic produce, dairy, bakery and household essentials delivered to your door in 30 minutes. Order online or collect in store.",

  // ⚠️ REPLACE THESE — right now your header says Mumbai and your footer
  // says "104 Green Valley Blvd, Greenfield, State 90210". Pick ONE.
  // Use the exact same string in your footer component too.
  address: {
    street: "REPLACE_WITH_REAL_STREET",
    locality: "Mumbai",          // city
    region: "Maharashtra",       // state
    postalCode: "400050",
    country: "IN",
  },

  // ⚠️ REPLACE — "(555) 234-MART" and "+91 98201-FRESH" are placeholders.
  // Must be a dialable E.164 number or Google ignores the whole block.
  telephone: "+912212345678",
  email: "support@freshmartlocal.example",

  // ⚠️ REPLACE with the real shop coordinates (right-click in Google Maps
  // → the first number is latitude). Only include if the shop is real.
  geo: {
    latitude: 19.0596,
    longitude: 72.8295,
  },

  openingHours: {
    days: [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday",
    ],
    opens: "07:00",
    closes: "23:00",
  },

  currency: "INR",
  locale: "en_IN",

  // Add real profiles only. Delete any you don't have — fake links hurt.
  sameAs: [
    // "https://www.facebook.com/yourpage",
    // "https://www.instagram.com/yourpage",
    // "https://g.page/your-google-business-profile",
  ],

  // Paste the content value from Google Search Console's
  // "HTML tag" verification method here.
  googleSiteVerification: "PASTE_GSC_VERIFICATION_CODE",
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
