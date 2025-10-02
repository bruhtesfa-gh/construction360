import { forwardRef, type FocusEventHandler } from "react";
import { Checkbox } from "../../atoms/checkbox";
import { useField } from "formik";

export interface FormCheckboxProps {
  label?: string;
  name: string;
  error?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  containerClassName?: string;
  disabled?: boolean;
}

export const FormCheckbox = forwardRef<HTMLButtonElement, FormCheckboxProps>(
  function FormCheckbox(
    {
      label,
      error,
      name,
      className,
      containerClassName,
      disabled,
      checked,
      onCheckedChange,
    },
    ref
  ) {
    const [field, meta, helpers] = useField<boolean | undefined>({
      name,
      type: "checkbox",
    });

    const isChecked = checked ?? Boolean(field.value);
    const fieldError = error ?? (meta.touched ? meta.error : undefined);

    const containerClasses = [
      "flex items-center space-x-2",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const handleCheckedChange = (value: boolean | "indeterminate") => {
      const nextValue = value === true;
      helpers.setValue(nextValue);
      helpers.setTouched(true, true);
      onCheckedChange?.(nextValue);
    };

    const handleBlur: FocusEventHandler<HTMLButtonElement> = (event) => {
      field.onBlur(event);
      helpers.setTouched(true, true);
    };

    return (
      <div className={containerClasses}>
        <Checkbox
          ref={ref}
          name={field.name}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          onBlur={handleBlur}
          className={className}
          disabled={disabled}
        />
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        {fieldError && (
          <span className="text-xs text-red-600 ml-2">{fieldError}</span>
        )}
      </div>
    );
  }
);
