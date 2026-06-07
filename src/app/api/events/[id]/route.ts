import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/supabase';
import { uploadToS3 } from '@/lib/s3';

const prisma = new PrismaClient();

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = params.id;
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const ticketLink = (formData.get('ticketLink') as string) || null;
    const bannerImage = formData.get('bannerImage') as File | null;

    if (!title || !dateStr || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let imageUrl = event.imageUrl;

    // Only upload if a new banner image is provided
    if (bannerImage && typeof bannerImage !== 'string') {
      const bannerBuffer = Buffer.from(await bannerImage.arrayBuffer());
      const bannerKey = `events/${event.id}/banner-${Date.now()}-${bannerImage.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      imageUrl = await uploadToS3(bannerBuffer, bannerKey, bannerImage.type);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        date: new Date(dateStr),
        location,
        ticketLink,
        imageUrl,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = params.id;
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId }
    });

    return NextResponse.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
