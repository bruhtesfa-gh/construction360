import { object, string, boolean } from "yup";
import type { InferType } from "yup";

export const contactFormSchema = object({
  contact_type: string().required("Contact type is required"),
  company_name: string().nullable().notRequired(),
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  email: string().email("Invalid email").required("Email is required"),
  phone: string().nullable().notRequired(),
  mobile_phone: string().nullable().notRequired(),
  address1: string().nullable().notRequired(),
  address2: string().nullable().notRequired(),
  city: string().nullable().notRequired(),
  state: string().nullable().notRequired(),
  zip: string().nullable().notRequired(),
  country: string().nullable().notRequired(),
  notes: string().nullable().notRequired(),
  is_active: boolean().default(true).notRequired(),
}).required();

export const createContactFormSchema = contactFormSchema.shape({
  builder_id: string()
    .uuid("Invalid builder ID")
    .required("Builder ID is required"),
});

export type ContactFormInput = InferType<typeof contactFormSchema>;
export type IContact = InferType<typeof contactFormSchema>;
export type CreateContactFormInput = InferType<typeof createContactFormSchema>;
