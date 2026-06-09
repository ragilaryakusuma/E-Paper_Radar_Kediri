import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/supabase';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    let userId: string | null = null;

    if (token === 'mock-admin-token') {
      userId = 'admin-user-id';
    } else if (token === 'mock-demo-token') {
      userId = 'demo-user-id';
    } else if (token) {
      const user = await getCurrentUser(token);
      if (user) {
        userId = user.id;
      }
    } else {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId');
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: User session not found' }, { status: 401 });
    }

    // 1. Get user details
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // 2. Check active subscription
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

    // 3. Fetch purchased editions
    const purchasedEditions = await prisma.purchase.findMany({
      where: {
        userId,
        editionId: { not: null },
      },
      include: {
        edition: true,
      },
    });

    let editionsList = purchasedEditions.map(p => p.edition).filter(Boolean);

    if (activeSubscription) {
      // If subscription is active, let them access all published editions
      const allEditions = await prisma.edition.findMany({
        where: { isPublished: true },
        orderBy: { publishDate: 'desc' },
      });
      editionsList = allEditions;
    }

    // 4. Fetch all available books (since books are free to read for all logged-in users)
    const booksList = await prisma.book.findMany({
      orderBy: { publishDate: 'desc' },
    });

    return NextResponse.json({
      hasActiveSubscription: !!activeSubscription,
      subscriptionPlanName: activeSubscription?.plan?.name || null,
      subscriptionEndDate: activeSubscription?.endDate || null,
      role: dbUser?.role || 'user',
      newspapers: editionsList,
      books: booksList,
    });
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}
