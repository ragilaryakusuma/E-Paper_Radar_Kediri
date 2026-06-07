// Type definitions for Radar Kediri E-Paper

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
}

export interface Plan {
  id: number;
  name: string;
  durationDays: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface Subscription {
  id: number;
  userId: string;
  planId: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
  plan?: Plan;
}

export interface Edition {
  id: number;
  title: string;
  publishDate: Date;
  coverImageUrl: string;
  pdfUrl: string;
  pageCount: number;
  price: number;
  isPublished: boolean;
}

export interface Transaction {
  id: number;
  userId: string;
  planId?: number;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'expired';
  paymentMethod?: string;
  midtransOrderId: string;
  createdAt: Date;
}

export interface Purchase {
  id: number;
  userId: string;
  editionId: number;
  transactionId?: number;
  purchasedAt: Date;
  edition?: Edition;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  features: string[];
}

export interface CartItem {
  edition: Edition;
  quantity: number;
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export interface PaymentWebhook {
  transaction_status: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  fraud_status?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  publishDate: Date | string;
  coverUrl: string;
  price: number;
  description?: string | null;
  category: string;
}


export interface Event {
  id: string;
  title: string;
  date: Date | string;
  imageUrl: string;
  location: string;
  ticketLink?: string | null;
}