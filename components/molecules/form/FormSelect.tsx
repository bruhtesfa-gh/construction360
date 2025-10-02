import { forwardRef, type FocusEventHandler } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../atoms/select";
import { useField } from "formik";

export interface FormSelectProps {
  label?: string;
  name: string;
  required?: boolean;
  error?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  function FormSelect(
    {
      label,
      error,
      name,
      value,
      required,
      onValueChange,
      options,
      placeholder,
      disabled,
      className,
    },
    ref
  ) {
    const [field, meta, helpers] = useField<string | undefined>(name);

    const fieldError = error ?? (meta.touched ? meta.error : undefined);

    const resolvedValue = (() => {
      const current = value ?? field.value;
      return current === "" ? undefined : current;
    })();

    const handleValueChange = (val: string) => {
      helpers.setValue(val);
      helpers.setTouched(true, true);
      onValueChange?.(val);
    };

    const handleBlur: FocusEventHandler<HTMLButtonElement> = (event) => {
      field.onBlur(event);
      helpers.setTouched(true, true);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <Select
          name={field.name}
          value={resolvedValue}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger ref={ref} className={className} onBlur={handleBlur}>
            <SelectValue placeholder={placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError && (
          <span className="text-xs text-red-600">{fieldError}</span>
        )}
      </div>
    );
  }
);
