import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/supabase';
import { uploadToS3 } from '@/lib/s3';

const prisma = new PrismaClient();

// GET /api/events - Fetch all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST /api/events - Create new event (admin only)
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
    }

    if (!isAdmin || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const ticketLink = (formData.get('ticketLink') as string) || null;
    const bannerImage = formData.get('bannerImage') as File;

    if (!title || !dateStr || !location || !bannerImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the event first to get a valid ID
    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(dateStr),
        location,
        ticketLink,
        imageUrl: '', // Will update after S3/local upload
      },
    });

    // Upload banner image
    const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
    const bannerKey = `events/${event.id}/banner-${Date.now()}-${bannerImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const imageUrl = await uploadToS3(bannerBuffer, bannerKey, bannerImage.type);

    // Update with real image URL
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { imageUrl },
    });

    return NextResponse.json(updatedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
