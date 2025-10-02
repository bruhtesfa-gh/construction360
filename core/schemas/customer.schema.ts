import { object, string, boolean } from "yup";
import type { InferType } from "yup";


export const customerFormSchema = object({
  customer_name: string().min(1, "Name is required"),
  email: string().email("Invalid email").notRequired(),
  cell_phone: string().notRequired(),
  home_phone: string().notRequired(),
  work_phone: string().notRequired(),
  address1: string().notRequired(),
  address2: string().notRequired(),
  city: string().notRequired(),
  state: string().max(2, "State abbreviation").notRequired(),
  zip: string().notRequired(),
  company_name: string().notRequired(),
  customer_is_a_company: boolean().notRequired(),
}).required();

export const createCustomerSchema = customerFormSchema.shape({
  region_id: string().min(1, "Region ID is required").required(),
  builder_id: string().min(1, "Builder ID is required").required(),
});


export type CustomerFormInput = InferType<typeof customerFormSchema>;
export type CreateCustomerInput = InferType<typeof createCustomerSchema>;
