import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
    });
    const role = userRecord?.role || 'user';

    if (activeSubscription) {
      return NextResponse.json({
        hasActiveSubscription: true,
        planName: activeSubscription.plan.name,
        endDate: activeSubscription.endDate.toISOString(),
        role,
      });
    }

    return NextResponse.json({
      hasActiveSubscription: false,
      role,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
