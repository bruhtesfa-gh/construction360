import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";

import { ContactForm } from "../form/ContactForm";
import { Button } from "../../ui/button";
import { useCreateContactMutation } from "../../../store/apis/contactsApi";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { AppApiError } from "@/types/api";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValues: any;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  width?: string;
}

export function ContactDialog({
  open,
  title,
  loading,
  onCancel,
  onOpenChange,
  initialValues,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  width = "max-w-4xl",
}: ContactDialogProps) {
  const [createContact, { isLoading, error }] = useCreateContactMutation();

  const handleSubmit = async (values: any) => {
    console.log("Submitting contact", values);
    try {
      await createContact(values).unwrap();
      onOpenChange(false); // close dialog on success
    } catch (err) {
      // Optionally, show error to user (e.g., toast, alert)
      console.error("Failed to create contact", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={width}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ContactForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={isLoading || loading}
        />
        {error && (
          <div className="text-red-600 text-sm mt-2">
            Error:{" "}
            {(error as AppApiError).message || "Failed to create contact"}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
