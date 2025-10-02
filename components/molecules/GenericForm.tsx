import { Formik } from "formik";
import type { AnyObjectSchema, InferType } from "yup";
import { ReactNode } from "react";

export interface GenericFormProps<TSchema extends AnyObjectSchema> {
  schema: TSchema;
  initialValues: InferType<TSchema>;
  onSubmit: (values: InferType<TSchema>) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
  id?: string;
  className?: string;
  children: ReactNode;
}

export function GenericForm<TSchema extends AnyObjectSchema>({
  schema,
  initialValues,
  onSubmit,
  className,
  id = "generic-form",
  children,
}: GenericFormProps<TSchema>) {
  type FormValues = InferType<TSchema>;

  const formClassName = ["space-y-4", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (values, helpers) => {
        try {
          await onSubmit(values);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
      enableReinitialize
    >
      {(formik) => (
        <form id={id} className={formClassName} onSubmit={formik.handleSubmit}>
          {children}
        </form>
      )}
    </Formik>
  );
}
