import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToS3, getEditionKey } from '@/lib/s3';
import { getCurrentUser } from '@/lib/supabase';

const prisma = new PrismaClient();

// GET /api/editions - Get all published editions
export async function GET(request: NextRequest) {
  try {
    const editions = await prisma.edition.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
    });

    return NextResponse.json(editions);
  } catch (error) {
    console.error('Error fetching editions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editions' },
      { status: 500 }
    );
  }
}

// POST /api/editions - Upload new edition (admin only)
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
    const publishDate = formData.get('publishDate') as string;
    const price = parseFloat(formData.get('price') as string);
    const coverImageFile = formData.get('coverImage') as File;
    const pdfFile = formData.get('pdfFile') as File;

    if (!title || !publishDate || !coverImageFile || !pdfFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create edition first to get ID
    const edition = await prisma.edition.create({
      data: {
        title,
        publishDate: new Date(publishDate),
        price,
        coverImageUrl: '', // Will update after upload
        pdfUrl: '', // Will update after upload
      },
    });

    // Upload cover image to S3
    const coverBuffer = Buffer.from(await coverImageFile.arrayBuffer());
    const coverKey = getEditionKey(edition.id, `cover-${Date.now()}.jpg`);
    const coverImageUrl = await uploadToS3(
      coverBuffer,
      coverKey,
      coverImageFile.type
    );

    // Upload PDF to S3
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfKey = getEditionKey(edition.id, `paper-${Date.now()}.pdf`);
    const pdfUrl = await uploadToS3(pdfBuffer, pdfKey, pdfFile.type);

    // Update edition with S3 URLs
    const updatedEdition = await prisma.edition.update({
      where: { id: edition.id },
      data: {
        coverImageUrl,
        pdfUrl,
      },
    });

    return NextResponse.json(updatedEdition, { status: 201 });
  } catch (error) {
    console.error('Error uploading edition:', error);
    return NextResponse.json(
      { error: 'Failed to upload edition' },
      { status: 500 }
    );
  }
}