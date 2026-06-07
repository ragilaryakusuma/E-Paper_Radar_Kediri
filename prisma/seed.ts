import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  
  // Clear tables in reverse dependency order
  await prisma.purchase.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.edition.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.book.deleteMany();
  await prisma.event.deleteMany();

  console.log('Seeding plans...');
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Harian',
        durationDays: 1,
        price: 3000,
        description: 'Akses penuh ke e-paper selama 1 hari',
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Mingguan',
        durationDays: 7,
        price: 15000,
        description: 'Akses penuh ke e-paper selama 7 hari',
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Bulanan',
        durationDays: 30,
        price: 50000,
        description: 'Akses penuh ke e-paper selama 30 hari',
        isActive: true,
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Tahunan',
        durationDays: 365,
        price: 500000,
        description: 'Akses penuh ke e-paper selama 1 tahun (365 hari)',
        isActive: true,
      },
    }),
  ]);

  const [planHarian, planMingguan, planBulanan, planTahunan] = plans;
  console.log(`Seeded ${plans.length} plans.`);

  console.log('Seeding users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'budi.santoso@example.com',
      name: 'Budi Santoso',
      phone: '081234567890',
      role: 'user',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'siti.rahma@example.com',
      name: 'Siti Rahma',
      phone: '082345678901',
      role: 'user',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'joko.widodo@example.com',
      name: 'Joko Widodo',
      phone: '083456789012',
      role: 'user',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-user-id',
      email: 'admin@radarkediri.id',
      name: 'Super Admin',
      phone: '08123456789',
      role: 'admin',
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      id: 'demo-user-id',
      email: 'demo@radarkediri.id',
      name: 'Demo User',
      phone: '08123456789',
      role: 'user',
    },
  });

  console.log('Seeded users.');

  console.log('Seeding editions...');
  const edition1 = await prisma.edition.create({
    data: {
      title: 'Radar Kediri - Edisi 01 Juni 2026',
      publishDate: new Date('2026-06-01T00:00:00.000Z'),
      coverImageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400',
      pdfUrl: 'editions/radar-kediri-2026-06-01.pdf',
      pageCount: 16,
      price: 3000,
      isPublished: true,
    },
  });

  const edition2 = await prisma.edition.create({
    data: {
      title: 'Radar Kediri - Edisi 02 Juni 2026',
      publishDate: new Date('2026-06-02T00:00:00.000Z'),
      coverImageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400',
      pdfUrl: 'editions/radar-kediri-2026-06-02.pdf',
      pageCount: 16,
      price: 3000,
      isPublished: true,
    },
  });

  const edition3 = await prisma.edition.create({
    data: {
      title: 'Radar Kediri - Edisi 03 Juni 2026',
      publishDate: new Date('2026-06-03T00:00:00.000Z'),
      coverImageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400',
      pdfUrl: 'editions/radar-kediri-2026-06-03.pdf',
      pageCount: 20,
      price: 3000,
      isPublished: true,
    },
  });

  console.log('Seeded editions.');

  console.log('Seeding subscriptions...');
  // Budi Santoso: Active Monthly Subscription (from today to 30 days later)
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);
  
  await prisma.subscription.create({
    data: {
      userId: user1.id,
      planId: planBulanan.id,
      startDate: now,
      endDate: thirtyDaysLater,
      status: 'active',
      autoRenew: true,
    },
  });

  // Siti Rahma: Expired Weekly Subscription (from 10 days ago to 3 days ago)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(now.getDate() - 10);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 3);

  await prisma.subscription.create({
    data: {
      userId: user2.id,
      planId: planMingguan.id,
      startDate: tenDaysAgo,
      endDate: threeDaysAgo,
      status: 'expired',
      autoRenew: false,
    },
  });

  console.log('Seeded subscriptions.');

  console.log('Seeding transactions and purchases...');
  // Transaction 1: Budi Santoso monthly plan (Success)
  const tx1 = await prisma.transaction.create({
    data: {
      userId: user1.id,
      planId: planBulanan.id,
      amount: 50000,
      status: 'success',
      paymentMethod: 'gopay',
      midtransOrderId: 'ORDER-10001',
      midtransResponse: {
        transaction_status: 'settlement',
        payment_type: 'gopay',
        gross_amount: '50000.00',
      },
    },
  });

  // Transaction 2: Siti Rahma weekly plan (Success)
  await prisma.transaction.create({
    data: {
      userId: user2.id,
      planId: planMingguan.id,
      amount: 15000,
      status: 'success',
      paymentMethod: 'bank_transfer',
      midtransOrderId: 'ORDER-10002',
      midtransResponse: {
        transaction_status: 'settlement',
        payment_type: 'bank_transfer',
        gross_amount: '15000.00',
      },
    },
  });

  // Transaction 3: Siti Rahma harian plan (Pending)
  await prisma.transaction.create({
    data: {
      userId: user2.id,
      planId: planHarian.id,
      amount: 3000,
      status: 'pending',
      paymentMethod: 'qris',
      midtransOrderId: 'ORDER-10003',
      midtransResponse: {
        transaction_status: 'pending',
        payment_type: 'qris',
        gross_amount: '3000.00',
      },
    },
  });

  // Transaction 4: Joko Widodo single edition purchase (Success)
  const tx4 = await prisma.transaction.create({
    data: {
      userId: user3.id,
      amount: 3000,
      status: 'success',
      paymentMethod: 'shopeepay',
      midtransOrderId: 'ORDER-10004',
      midtransResponse: {
        transaction_status: 'settlement',
        payment_type: 'shopeepay',
        gross_amount: '3000.00',
      },
    },
  });

  // Purchase for Joko Widodo (linking to Edition 1 and Transaction 4)
  await prisma.purchase.create({
    data: {
      userId: user3.id,
      editionId: edition1.id,
      transactionId: tx4.id,
    },
  });

  console.log('Seeded transactions and purchases.');

  console.log('Seeding books...');
  const booksData = [
    {
      title: 'Sejarah Kediri: Dari Kerajaan Hingga Kini',
      author: 'Tim Redaksi Radar Kediri',
      publishDate: new Date('2026-01-15T00:00:00.000Z'),
      coverUrl: '/images/books/book-sejarah.jpg',
      price: 75000,
      description: 'Menelusuri jejak sejarah Kota Kediri dari masa kerajaan hingga era modern.',
      category: 'Sejarah',
    },
    {
      title: 'Kuliner Legendaris Kediri',
      author: 'Dewi Sartika',
      publishDate: new Date('2026-01-10T00:00:00.000Z'),
      coverUrl: '/images/books/book-kuliner.jpg',
      price: 50000,
      description: 'Panduan lengkap kuliner khas Kediri yang wajib dicoba.',
      category: 'Kuliner',
    },
    {
      title: 'Wisata Alam Jawa Timur',
      author: 'Ahmad Fauzi',
      publishDate: new Date('2026-01-05T00:00:00.000Z'),
      coverUrl: '/images/books/book-wisata.jpg',
      price: 65000,
      description: 'Eksplorasi destinasi wisata alam tersembunyi di Jawa Timur.',
      category: 'Travel',
    },
    {
      title: 'UMKM Kediri: Kisah Sukses',
      author: 'Tim Ekonomi Radar Kediri',
      publishDate: new Date('2025-12-20T00:00:00.000Z'),
      coverUrl: '/images/books/book-umkm.jpg',
      price: 55000,
      description: 'Kumpulan kisah inspiratif pelaku UMKM sukses di Kediri.',
      category: 'Bisnis',
    },
    {
      title: 'Legenda & Mitos Kediri',
      author: 'Prof. Slamet Widodo',
      publishDate: new Date('2025-11-15T00:00:00.000Z'),
      coverUrl: '/images/books/book-legenda.jpg',
      price: 60000,
      description: 'Menguak cerita rakyat dan mitos yang hidup di masyarakat Kediri.',
      category: 'Budaya',
    },
    {
      title: 'Fotografi Jurnalistik: Panduan Praktis',
      author: 'Budi Santoso',
      publishDate: new Date('2025-10-10T00:00:00.000Z'),
      coverUrl: '/images/books/book-foto.jpg',
      price: 85000,
      description: 'Belajar teknik fotografi jurnalistik dari fotografer profesional.',
      category: 'Fotografi',
    },
  ];

  await Promise.all(
    booksData.map(book => prisma.book.create({ data: book }))
  );
  console.log('Seeded books.');



  console.log('Seeding events...');
  const eventsData = [
    {
      title: 'Waru Turi Fun Run 2026',
      date: new Date('2026-08-15T09:00:00.000Z'),
      imageUrl: '/images/events/waru-turi-fun-run.jpg',
      location: 'Bendungan Waru Turi, Kediri',
      ticketLink: 'https://tiket.radarkediri.id/waru-turi-fun-run',
    },
    {
      title: 'Job Fair Kediri Raya',
      date: new Date('2026-08-20T08:00:00.000Z'),
      imageUrl: '/images/events/job-fair.jpg',
      location: 'Gedung Serbaguna Kediri',
      ticketLink: 'https://tiket.radarkediri.id/job-fair',
    },
    {
      title: 'Konser Musik Rakyat',
      date: new Date('2026-09-01T19:00:00.000Z'),
      imageUrl: '/images/events/konser-musik.jpg',
      location: 'Stadion Brawijaya Kediri',
      ticketLink: 'https://tiket.radarkediri.id/konser-musik',
    },
    {
      title: 'Seminar UMKM Go Digital',
      date: new Date('2026-08-25T13:00:00.000Z'),
      imageUrl: '/images/events/seminar-umkm.jpg',
      location: 'Hotel Grand Surya Kediri',
      ticketLink: 'https://tiket.radarkediri.id/seminar-umkm',
    },
  ];

  await Promise.all(
    eventsData.map(event => prisma.event.create({ data: event }))
  );
  console.log('Seeded events.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
