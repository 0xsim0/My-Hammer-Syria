import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "plumbing", name: "Plumbing", nameAr: "سباكة", icon: "🔧" },
  { slug: "electrical", name: "Electrical", nameAr: "كهرباء", icon: "⚡" },
  { slug: "carpentry", name: "Carpentry", nameAr: "نجارة", icon: "🪚" },
  { slug: "painting", name: "Painting", nameAr: "دهان", icon: "🎨" },
  { slug: "tiling", name: "Tiling & Flooring", nameAr: "بلاط وأرضيات", icon: "🏠" },
  { slug: "hvac", name: "HVAC & Cooling", nameAr: "تدفئة وتبريد", icon: "❄️" },
  { slug: "masonry", name: "Masonry", nameAr: "بناء وحجر", icon: "🧱" },
  { slug: "welding", name: "Welding", nameAr: "لحام", icon: "🔩" },
  { slug: "cleaning", name: "Cleaning", nameAr: "تنظيف", icon: "🧹" },
  { slug: "moving", name: "Moving & Transport", nameAr: "نقل عفش", icon: "🚚" },
  { slug: "garden", name: "Garden & Landscaping", nameAr: "حدائق", icon: "🌿" },
  { slug: "roofing", name: "Roofing", nameAr: "سقف وعزل", icon: "🏗️" },
  { slug: "appliance", name: "Appliance Repair", nameAr: "تصليح أجهزة", icon: "🔌" },
  { slug: "security", name: "Security Systems", nameAr: "أنظمة أمن", icon: "🔐" },
];

const GOVERNORATES = [
  "Damascus",
  "Aleppo",
  "Homs",
  "Hama",
  "Latakia",
  "Deir ez-Zor",
  "Raqqa",
  "Hasakah",
  "Daraa",
  "Idlib",
  "Quneitra",
  "Tartus",
  "As-Suwayda",
  "Rural Damascus",
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed categories
  console.log("📂 Seeding categories...");
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Seed test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@myhammersyria.com" },
    update: {},
    create: {
      email: "admin@myhammersyria.com",
      name: "Admin",
      nameAr: "مدير",
      password: hashedPassword,
      "role": "ADMIN",
      governorate: "Damascus",
      isVerified: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Customer user
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      name: "Ahmad Al-Hassan",
      nameAr: "أحمد الحسن",
      password: hashedPassword,
      "role": "CUSTOMER",
      governorate: "Damascus",
      phone: "+963-11-1234567",
      isVerified: true,
    },
  });
  console.log("✅ Customer created:", customer.email);

  // Craftsman user
  const craftsman = await prisma.user.upsert({
    where: { email: "craftsman@test.com" },
    update: {},
    create: {
      email: "craftsman@test.com",
      name: "Khaled Al-Najjar",
      nameAr: "خالد النجار",
      password: hashedPassword,
      "role": "CRAFTSMAN",
      governorate: "Aleppo",
      phone: "+963-21-9876543",
      avgRating: 4.5,
      totalReviews: 12,
      isVerified: true,
    },
  });
  console.log("✅ Craftsman created:", craftsman.email);

  // Create craftsman profile
  const plumbingCategory = await prisma.category.findUnique({
    where: { slug: "plumbing" },
  });
  const electricalCategory = await prisma.category.findUnique({
    where: { slug: "electrical" },
  });

  await prisma.craftsmanProfile.upsert({
    where: { userId: craftsman.id },
    update: {},
    create: {
      userId: craftsman.id,
      businessName: "Al-Najjar Plumbing Services",
      businessNameAr: "خدمات السباكة النجار",
      bio: "Professional plumber with 10+ years experience in Damascus and Aleppo.",
      bioAr: "سباك محترف مع أكثر من 10 سنوات خبرة في دمشق وحلب.",
      yearsExperience: 10,
      isAvailable: true,
      categories: {
        connect: [
          ...(plumbingCategory ? [{ id: plumbingCategory.id }] : []),
          ...(electricalCategory ? [{ id: electricalCategory.id }] : []),
        ],
      },
    },
  });

  // Seed sample jobs
  const categories = await prisma.category.findMany({ take: 3 });

  const sampleJobs = [
    {
      title: "Fix kitchen sink plumbing",
      titleAr: "إصلاح سباكة حوض المطبخ",
      description: "Kitchen sink is leaking under the cabinet. Need urgent repair.",
      descriptionAr: "حوض المطبخ يتسرب تحت الخزانة. أحتاج إصلاحاً عاجلاً.",
      "status": "OPEN",
      budgetMin: 50,
      budgetMax: 150,
      "currency": "USD",
      governorate: "Damascus",
      categoryId: categories[0]?.id || "",
      customerId: customer.id,
    },
    {
      title: "Electrical wiring for new apartment",
      titleAr: "تمديدات كهربائية لشقة جديدة",
      description: "New apartment needs complete electrical installation. 3 rooms.",
      descriptionAr: "شقة جديدة تحتاج تمديدات كهربائية كاملة. 3 غرف.",
      "status": "OPEN",
      budgetMin: 500000,
      budgetMax: 1500000,
      "currency": "SYP",
      governorate: "Aleppo",
      categoryId: categories[1]?.id || categories[0]?.id || "",
      customerId: customer.id,
    },
  ];

  for (const job of sampleJobs) {
    if (job.categoryId) {
      const existing = await prisma.job.findFirst({
        where: { title: job.title, customerId: job.customerId },
      });
      if (!existing) {
        await prisma.job.create({ data: job });
        console.log("✅ Job created:", job.title);
      }
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nTest accounts:");
  console.log("  Admin:     admin@myhammersyria.com / password123");
  console.log("  Customer:  customer@test.com / password123");
  console.log("  Craftsman: craftsman@test.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
