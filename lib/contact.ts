/**
 * The studio's public contact details, in one place because they appear in the
 * page, the JSON-LD and the form's fallback copy.
 */
export const CONTACT = {
  email: "bridvance@gmail.com",
  /**
   * International format, digits only, no "+" — e.g. "919876543210". Empty
   * until there is a number to publish: the WhatsApp link renders only when
   * this is set, so an unset value costs nothing rather than shipping a link
   * that goes nowhere.
   */
  whatsapp: "",
} as const;

export const whatsappUrl = (message: string) =>
  CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
    : null;
