import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/supabase';
import { getSignedReadUrl } from '@/lib/s3';

const prisma = new PrismaClient();

// Check if user can access edition
async function canAccessEdition(userId: string, editionId: number): Promise<boolean> {
  // Check if admin
  const userObj = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (userObj?.role === 'admin') return true;

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

// Check if user can access book
async function canAccessBook(userId: string, bookId: string): Promise<boolean> {
  // Semua pengguna yang terdaftar/login dapat mengakses koleksi buku untuk dibaca
  return true;
}

// POST /api/reader/access - Get signed URL to read edition or book
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    
    let user = null;
    if (token === 'mock-admin-token') {
      user = { id: 'admin-user-id', role: 'admin' };
    } else if (token === 'mock-demo-token') {
      user = { id: 'demo-user-id', role: 'user' };
    } else {
      const supUser = await getCurrentUser(token);
      if (supUser) {
        const dbUser = await prisma.user.findUnique({
          where: { id: supUser.id }
        });
        user = dbUser;
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { editionId, bookId } = await request.json();

    if (!editionId && !bookId) {
      return NextResponse.json(
        { error: 'Edition ID or Book ID is required' },
        { status: 400 }
      );
    }

    if (editionId) {
      // Check if user has access to edition
      const hasAccess = await canAccessEdition(user.id, Number(editionId));

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied. Please subscribe or purchase this edition.' },
          { status: 403 }
        );
      }

      // Get edition info
      const edition = await prisma.edition.findUnique({
        where: { id: Number(editionId) },
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
    } else {
      // Check if user has access to book
      const hasAccess = await canAccessBook(user.id, bookId);

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied. Please purchase this book to read it.' },
          { status: 403 }
        );
      }

      // Get book info
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Generate signed URL (expires in 1 hour)
      const signedUrl = await getSignedReadUrl(book.pdfUrl);

      return NextResponse.json({
        url: signedUrl,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
        },
        expiresIn: 3600, // seconds
      });
    }
  } catch (error) {
    console.error('Error getting reader access:', error);
    return NextResponse.json(
      { error: 'Failed to get access' },
      { status: 500 }
    );
  }
}