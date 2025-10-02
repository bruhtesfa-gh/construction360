import type { Contact } from "../../../types/database";

export function displayNameValueGetter(params: any) {
  const contact = params.data as Contact;
  if (contact.company_name) {
    return contact.company_name;
  } else if (contact.first_name || contact.last_name) {
    return `${contact.first_name || ""} ${contact.last_name || ""}`.trim();
  }
  return "Unnamed Contact";
}

export function fullAddressValueGetter(params: any) {
  const contact = params.data as Contact;
  const parts = [
    contact.address1,
    contact.address2,
    contact.city,
    contact.state,
    contact.zip,
  ].filter(Boolean);
  return parts.join(", ");
}
