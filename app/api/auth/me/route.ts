import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../../../../core/services/auth.service';

const authService = new AuthService();

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const payload = authService.verifyToken(token);
    return NextResponse.json({ user: payload });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
