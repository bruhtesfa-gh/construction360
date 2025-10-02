import { createContactFormSchema } from '@/core/schemas/contact.schema';
import { ContactService } from '@/core/services/contact.service';
import { NextRequest, NextResponse } from 'next/server';
import { getBuilderId } from '../_utils';
import { object, string, ValidationError } from 'yup';

const contactQuerySchema = object({
  builderId: string()
    .uuid('Invalid builder ID')
    .required('Builder ID is required'),
});

const contactService = new ContactService();

const validationOptions = { abortEarly: false, stripUnknown: true } as const;

const formatValidationError = (error: ValidationError) => {
  const issues = error.inner.length ? error.inner : [error];
  return issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
};

export async function GET(req: NextRequest) {
  const builderId = getBuilderId(req);
  try {
    const { builderId: validatedBuilderId } = await contactQuerySchema.validate(
      { builderId },
      validationOptions
    );
    const contacts = await contactService.getAll(validatedBuilderId);
    return NextResponse.json(contacts);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Invalid query', details: formatValidationError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const builder_id = getBuilderId(req);
  const data = { ...body, builder_id };
  try {
    const validatedData = await createContactFormSchema.validate(
      data,
      validationOptions
    );
    const contact = await contactService.createContact(validatedData);
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to create contact', details: error }, { status: 500 });
  }
}
