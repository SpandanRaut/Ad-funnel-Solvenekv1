import type { Application } from "~/stores/funnel";

export function applicationErrors(form: Application): Record<string, string> {
  return {
    name: form.name.trim().length >= 2 ? "" : "Please enter your full name.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? "" : "Please enter a valid email address.",
    // Any format is fine as long as it holds a plausible number of digits.
    phone: validPhone(form.phone) ? "" : "Please enter your phone number.",
    companyName: form.companyName.trim().length >= 2 && form.companyName.trim().length <= 100
      ? "" : "Please enter your company name.",
  };
}

export function validPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").length;
  return phone.trim().length <= 40 && digits >= 7 && digits <= 20;
}

/**
 * Phone in international form for Calendly, e.g. "+44 7570 730306" ->
 * "+447570730306". A leading "00" becomes "+". Numbers typed without a
 * country code are sent as digits only, since the country can't be inferred.
 */
export function internationalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return digits;
}
