import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, phone, role } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'ID and Email are required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name: name || email.split('@')[0],
        phone: phone || undefined,
        role: role || undefined,
      },
      create: {
        id,
        email,
        name: name || email.split('@')[0],
        phone: phone || undefined,
        role: role || 'user',
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
