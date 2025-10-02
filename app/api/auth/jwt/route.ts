import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@services/auth.service';
import { loginSchema } from '@schemas/auth.schema';

const authService = new AuthService();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parse = loginSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parse.error.issues }, { status: 400 });
  }
  const { user_login_id, password } = parse.data;
  const result = await authService.authenticate(user_login_id, password);
  if (!result) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json(result);
  response.cookies.set('accessToken', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
  });
  response.cookies.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  response.cookies.set('user', JSON.stringify(result.user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
  });

  return response;
}
