import { Input } from "../ui/input";
import { Label } from "../ui/label";
import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export default function FormField({
  id,
  label,
  error,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        {...inputProps}
        className={error ? "border-red-500" : inputProps.className}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
