import React, {
  InputHTMLAttributes,
  forwardRef,
  type ChangeEventHandler,
  type FocusEventHandler,
} from "react";
import { useField } from "formik";
import { Input } from "../../ui/input";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  name: string;
  containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(
    { label, error, name, containerClassName, ...props },
    ref
  ) {
    const [field, meta] = useField<
      string | number | readonly string[] | undefined
    >(name);

    const { onBlur, onChange, value, className, ...rest } = props;

    const fieldError =
      error ?? (meta.touched ? (meta.error as string) : undefined);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      field.onChange(event);
      onChange?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      field.onBlur(event);
      onBlur?.(event);
    };

    type FieldValue = string | number | readonly string[] | undefined;
    const fieldValue = field.value as FieldValue;
    const inputValue: FieldValue =
      value !== undefined ? value : fieldValue !== undefined ? fieldValue : "";

    const inputClassName = [
      "w-full rounded border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`space-y-1 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <Input
          ref={ref}
          name={field.name}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClassName}
          {...rest}
        />
        {fieldError && (
          <span className="text-xs text-red-600">{fieldError}</span>
        )}
      </div>
    );
  }
);
