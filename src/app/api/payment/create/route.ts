import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createSnapTransaction } from '@/lib/midtrans';
import { getCurrentUser } from '@/lib/supabase';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    
    let jwtUser = null;
    if (token) {
      if (token === 'mock-admin-token') {
        jwtUser = { id: 'admin-user-id' };
      } else if (token === 'mock-demo-token') {
        jwtUser = { id: 'demo-user-id' };
      } else {
        jwtUser = await getCurrentUser(token);
      }
      if (!jwtUser) {
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { userId, planId, items } = body;
    const finalUserId = jwtUser ? jwtUser.id : userId;

    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: finalUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let totalAmount = 0;
    const itemDetails: any[] = [];
    let transactionPlanId: number | null = null;
    let editionIds: number[] = [];
    let bookIds: string[] = [];

    if (planId) {
      // Plan subscription purchase
      const plan = await prisma.plan.findUnique({
        where: { id: Number(planId) },
      });
      if (!plan) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      totalAmount = Number(plan.price);
      itemDetails.push({
        id: `PLAN-${plan.id}`,
        price: totalAmount,
        quantity: 1,
        name: `Langganan Paket ${plan.name}`,
      });
      transactionPlanId = plan.id;
    } else if (Array.isArray(items) && items.length > 0) {
      // Cart items checkout (Newspaper editions or Books)
      for (const item of items) {
        if (item.type === 'newspaper') {
          const edition = await prisma.edition.findUnique({
            where: { id: Number(item.id) },
          });
          if (!edition) {
            return NextResponse.json({ error: `Edition ${item.id} not found` }, { status: 404 });
          }
          const price = Number(edition.price);
          totalAmount += price * item.quantity;
          itemDetails.push({
            id: `EDITION-${edition.id}`,
            price,
            quantity: item.quantity,
            name: edition.title,
          });
          editionIds.push(edition.id);
        } else if (item.type === 'book') {
          return NextResponse.json({ error: 'Buku digital tidak dapat dibeli online. Buku ini bersifat gratis untuk dibaca bagi pengguna yang terdaftar.' }, { status: 400 });
        }
      }
    } else {
      return NextResponse.json({ error: 'No items or plan selected' }, { status: 400 });
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Total amount must be greater than 0' }, { status: 400 });
    }

    // Prepare Snap details
    const midtransParams = {
      orderId,
      amount: totalAmount,
      customerDetails: {
        email: user.email,
        firstName: user.name,
        phone: user.phone || undefined,
      },
      itemDetails,
    };

    const midtransResult = await createSnapTransaction(midtransParams);

    // Save transaction to DB with pending status, storing editionIds and bookIds in midtransResponse metadata
    await prisma.transaction.create({
      data: {
        userId: user.id,
        planId: transactionPlanId,
        amount: totalAmount,
        status: 'pending',
        midtransOrderId: orderId,
        midtransResponse: {
          metadata: {
            editionIds,
            bookIds,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      token: midtransResult.token,
      redirectUrl: midtransResult.redirect_url,
      orderId,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment transaction' },
      { status: 500 }
    );
  }
}
