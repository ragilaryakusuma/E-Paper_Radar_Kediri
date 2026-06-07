import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/supabase';
import { getSignedReadUrl } from '@/lib/s3';

const prisma = new PrismaClient();

// Check if user can access edition
async function canAccessEdition(userId: string, editionId: number): Promise<boolean> {
  // Check active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active',
      endDate: {
        gte: new Date(),
      },
    },
  });

  if (activeSubscription) return true;

  // Check individual purchase
  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_editionId: {
        userId,
        editionId,
      },
    },
  });

  return !!purchase;
}

// POST /api/reader/access - Get signed URL to read edition
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const user = await getCurrentUser(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { editionId } = await request.json();

    if (!editionId) {
      return NextResponse.json(
        { error: 'Edition ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access
    const hasAccess = await canAccessEdition(user.id, editionId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please subscribe or purchase this edition.' },
        { status: 403 }
      );
    }

    // Get edition info
    const edition = await prisma.edition.findUnique({
      where: { id: editionId },
    });

    if (!edition) {
      return NextResponse.json(
        { error: 'Edition not found' },
        { status: 404 }
      );
    }

    // Generate signed URL (expires in 1 hour)
    const signedUrl = await getSignedReadUrl(edition.pdfUrl);

    return NextResponse.json({
      url: signedUrl,
      edition: {
        id: edition.id,
        title: edition.title,
        pageCount: edition.pageCount,
      },
      expiresIn: 3600, // seconds
    });
  } catch (error) {
    console.error('Error getting reader access:', error);
    return NextResponse.json(
      { error: 'Failed to get access' },
      { status: 500 }
    );
  }
}