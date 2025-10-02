import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { DialogFooter } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { GenericForm } from "../../molecules/GenericForm";
import { FormInput } from "../../molecules/form/FormInput";
import { customerFormSchema } from "@/core/schemas/customer.schema";
import { FormCheckbox } from "@/components/molecules/form/FormCheckbox";
import { useCreateCustomerMutation } from "@/store/apis/customersApi";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: any;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  cancelLabel: string;
  onSubmit?: (values: any) => void;
}

export const CustomerDialog: React.FC<CustomerDialogProps> = ({
  open,
  onOpenChange,
  title,
  initialValues,
  onCancel,
  loading,
  submitLabel,
  cancelLabel,
}) => {
  const [createCustomer] = useCreateCustomerMutation();
  const handleSubmit = async (values: any) => {
    console.log("Submitting customer", values);
    try {
      await createCustomer(values).unwrap();
      onOpenChange(false); // close dialog on success
    } catch (err) {
      // Optionally, show error to user (e.g., toast, alert)
      console.error("Failed to create customer", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <GenericForm
          schema={customerFormSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel={submitLabel}
          id="customer-form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-0 gap-x-6">
            <FormCheckbox
              name="customer_is_a_company"
              label="Customer is a Company"
              containerClassName="col-span-2 mb-4"
            />
            <FormInput
              containerClassName="col-span-2"
              name="customer_name"
              label="Name *"
              required
            />
            <FormInput
              containerClassName="col-span-2"
              name="email"
              label="Email"
              type="email"
            />
            <FormInput name="cell_phone" label="Cell Phone" />
            <FormInput name="home_phone" label="Home Phone" />
            <FormInput name="work_phone" label="Work Phone" />

            <FormInput name="address1" label="Address 1" />
            <FormInput name="address2" label="Address 2" />
            <FormInput name="city" label="City" />
            <FormInput name="state" label="State" maxLength={2} />
            <FormInput name="zip" label="ZIP Code" />
            <FormInput
              containerClassName="col-span-2"
              name="company_name"
              label="Company"
            />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </GenericForm>
      </DialogContent>
    </Dialog>
  );
};
