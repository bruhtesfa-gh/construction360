import { CustomerService } from '@/core/services/customer.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBuilderId } from '../_utils';
import { createCustomerSchema } from '@/core/schemas/customer.schema';

const customerService = new CustomerService();

export async function GET(req: NextRequest) {
  const builderId = getBuilderId(req);
  if (!builderId) {
    return NextResponse.json({ error: 'Invalid query', details: 'Builder ID is required' }, { status: 400 });
  }
  const customers = await customerService.getAll(builderId);
  return NextResponse.json(customers);
} 

export async function POST(req: NextRequest) {
  const body = await req.json();
  const builder_id = getBuilderId(req);
  const region_id = "405d94a3-f9a7-450a-9bb3-b4ad5d28f9d1";

  const parse = await createCustomerSchema.validate({...body, builder_id, region_id });
  const customer = await customerService.create(parse);
  return NextResponse.json(customer, { status: 201 });
}
