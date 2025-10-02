import React from "react";
import { useFieldLabels } from "../../hooks/useFieldLabels";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface EnhancedFormFieldProps {
  tableName: string;
  columnName: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  type?: "text" | "email" | "number" | "textarea" | "password";
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
}

export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  tableName,
  columnName,
  defaultLabel,
  defaultPlaceholder,
  type = "text",
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const { getLabel, getPlaceholder, getHelpText, isVisible, isRequired } =
    useFieldLabels(tableName);

  // Don't render if field is hidden
  if (!isVisible(columnName)) {
    return null;
  }

  const label = getLabel(columnName, defaultLabel);
  const placeholder = getPlaceholder(columnName, defaultPlaceholder);
  const helpText = getHelpText(columnName);
  const required = isRequired(columnName);

  const commonProps = {
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange?.(type === "number" ? Number(e.target.value) : e.target.value),
    disabled,
    required: required ?? undefined,
    className,
  };

  return (
    <div className="space-y-1">
      <Label htmlFor={columnName}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea id={columnName} {...commonProps} rows={3} />
      ) : (
        <Input id={columnName} type={type} {...commonProps} />
      )}

      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
    </div>
  );
};

// Convenience wrapper for common form patterns
export const JobFormField: React.FC<
  Omit<EnhancedFormFieldProps, "tableName">
> = (props) => <EnhancedFormField tableName="job" {...props} />;

export const CustomerFormField: React.FC<
  Omit<EnhancedFormFieldProps, "tableName">
> = (props) => <EnhancedFormField tableName="customer" {...props} />;

export const ContactFormField: React.FC<
  Omit<EnhancedFormFieldProps, "tableName">
> = (props) => <EnhancedFormField tableName="contact" {...props} />;

export const SupplierFormField: React.FC<
  Omit<EnhancedFormFieldProps, "tableName">
> = (props) => <EnhancedFormField tableName="supplier" {...props} />;
