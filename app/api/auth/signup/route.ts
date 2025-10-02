import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@schemas/signup.schema';
import { AuthService } from '@services/auth.service';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = signupSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parse.error.issues }, { status: 400 });
  }
  try {
    const result = await authService.signup(parse.data);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e || 'Signup failed' }, { status: 500 });
  }
}
