import React, {
  forwardRef,
  type ChangeEventHandler,
  type FocusEventHandler,
} from "react";
import { useField } from "formik";
import { Textarea } from "../../atoms/textarea";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  name: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  function FormTextarea(
    { label, error, name, className, containerClassName, onChange, onBlur, value, ...rest },
    ref
  ) {
    const [field, meta] = useField<string | undefined>(name);

    const fieldError = error ?? (meta.touched ? meta.error : undefined);

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
      field.onChange(event);
      onChange?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (event) => {
      field.onBlur(event);
      onBlur?.(event);
    };

    const textareaValue = value ?? field.value ?? "";

    const containerClasses = ["space-y-1", containerClassName]
      .filter(Boolean)
      .join(" ");

    const textareaClassName = [className].filter(Boolean).join(" ");

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <Textarea
          ref={ref}
          name={field.name}
          value={textareaValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={textareaClassName}
          {...rest}
        />
        {fieldError && (
          <span className="text-xs text-red-600">{fieldError}</span>
        )}
      </div>
    );
  }
);
