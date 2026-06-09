import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyWebhookSignature } from '@/lib/midtrans';

const prisma = new PrismaClient();

// POST /api/payment/webhook - Handle Midtrans payment notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = body;

    // Verify signature
    const isValid = verifyWebhookSignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: order_id },
      include: { plan: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Handle payment status
    let newStatus = transaction.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'success';
        
        // Create subscription if transaction is for a plan
        if (transaction.planId) {
          const plan = transaction.plan!;
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + plan.durationDays);

          await prisma.subscription.create({
            data: {
              userId: transaction.userId,
              planId: transaction.planId,
              startDate,
              endDate,
              status: 'active',
              autoRenew: false,
            },
          });
        } else {
          // Process individual edition purchases stored in transaction metadata
          const responseJson = transaction.midtransResponse as any;
          const editionIds = responseJson?.metadata?.editionIds;
          if (Array.isArray(editionIds)) {
            for (const editionId of editionIds) {
              await prisma.purchase.upsert({
                where: {
                  userId_editionId: {
                    userId: transaction.userId,
                    editionId: Number(editionId),
                  }
                },
                create: {
                  userId: transaction.userId,
                  editionId: Number(editionId),
                  transactionId: transaction.id,
                },
                update: {
                  transactionId: transaction.id,
                }
              });
            }
          }

          // Process individual book purchases stored in transaction metadata
          const bookIds = responseJson?.metadata?.bookIds;
          if (Array.isArray(bookIds)) {
            for (const bookId of bookIds) {
              await prisma.purchase.upsert({
                where: {
                  userId_bookId: {
                    userId: transaction.userId,
                    bookId: bookId,
                  }
                },
                create: {
                  userId: transaction.userId,
                  bookId: bookId,
                  transactionId: transaction.id,
                },
                update: {
                  transactionId: transaction.id,
                }
              });
            }
          }
        }
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      newStatus = 'failed';
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        midtransResponse: body,
      },
    });

    return NextResponse.json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}