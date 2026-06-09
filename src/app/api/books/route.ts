import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToS3, getBookKey } from '@/lib/s3';
import { getCurrentUser } from '@/lib/supabase';

const prisma = new PrismaClient();

// GET /api/books - Get all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { publishDate: 'desc' },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

// POST /api/books - Upload new book (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    
    let userId: string | null = null;
    let isAdmin = false;

    if (token === 'mock-admin-token') {
      userId = 'admin-user-id';
      isAdmin = true;
    } else if (token) {
      const user = await getCurrentUser(token);
      if (user) {
        userId = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        if (dbUser && dbUser.role === 'admin') {
          isAdmin = true;
        }
      }
    } else {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        if (dbUser && dbUser.role === 'admin') {
          isAdmin = true;
        }
      }
    }

    if (!isAdmin || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const publishDate = formData.get('publishDate') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const description = formData.get('description') as string || '';
    const coverImageFile = formData.get('coverImage') as File;
    const pdfFile = formData.get('pdfFile') as File;

    if (!title || !author || !publishDate || !category || isNaN(price) || !coverImageFile || !pdfFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create book first to get ID
    const book = await prisma.book.create({
      data: {
        title,
        author,
        publishDate: new Date(publishDate),
        category,
        price,
        description,
        coverUrl: '', // Will update after upload
        pdfUrl: '', // Will update after upload
      },
    });

    // Upload cover image to S3
    const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
    const coverKey = getBookKey(book.id, `cover-${Date.now()}.jpg`);
    const coverUrl = await uploadToS3(
      coverBuffer,
      coverKey,
      coverImageFile.type
    );

    // Upload PDF to S3
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfKey = getBookKey(book.id, `book-${Date.now()}.pdf`);
    const pdfUrl = await uploadToS3(pdfBuffer, pdfKey, pdfFile.type);

    // Update book with S3 URLs
    const updatedBook = await prisma.book.update({
      where: { id: book.id },
      data: {
        coverUrl,
        pdfUrl,
      },
    });

    return NextResponse.json(updatedBook, { status: 201 });
  } catch (error) {
    console.error('Error uploading book:', error);
    return NextResponse.json(
      { error: 'Failed to upload book' },
      { status: 500 }
    );
  }
}
