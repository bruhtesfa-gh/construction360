import { GenericForm } from "../../molecules/GenericForm";
import { FormInput } from "../../molecules/form/FormInput";
import { FormSelect } from "../../molecules/form/FormSelect";
import { FormTextarea } from "../../molecules/form/FormTextarea";
import { contactFormSchema } from "@/core/schemas/contact.schema";
import { DialogFooter } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";

export function ContactForm({
  initialValues,
  onSubmit,
  loading,
}: {
  initialValues: any;
  onSubmit: (values: any) => void;
  loading?: boolean;
}) {
  return (
    <GenericForm
      schema={contactFormSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel="Save Contact"
      id="contact-form"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 gap-x-6">
        <div className="space-y-4">
          <FormSelect
            name="contact_type"
            label="Contact Type"
            options={[
              { value: "Customer", label: "Customer" },
              { value: "Vendor", label: "Vendor" },
              { value: "Partner", label: "Partner" },
              { value: "Employee", label: "Employee" },
              { value: "Other", label: "Other" },
            ]}
          />
          <FormInput name="company_name" label="Company Name" />
          <FormInput name="first_name" label="First Name" />
          <FormInput name="last_name" label="Last Name" />
        </div>
        <div className="space-y-4">
          <FormInput name="email" label="Email" type="email" />
          <FormInput name="phone" label="Phone" />
          <FormInput name="mobile_phone" label="Mobile Phone" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <FormInput name="address1" label="Address 1" />
        <FormInput name="address2" label="Address 2" />
        <FormInput name="city" label="City" />
        <FormInput name="state" label="State" />
        <FormInput name="zip" label="ZIP Code" />
        <FormInput name="country" label="Country" />
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <FormTextarea name="notes" label="Notes" />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </GenericForm>
  );
}
