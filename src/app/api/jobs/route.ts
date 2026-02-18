import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createJobSchema, filterJobsSchema } from "@/lib/validations/job";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = filterJobsSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { categoryId, governorate, currency, status, search, page, limit } =
      parsed.data;

    const where: Prisma.JobWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    if (governorate) where.governorate = governorate;
    if (currency) where.currency = currency;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { titleAr: { contains: search } },
      ];
    }

    // Filter by authenticated customer when customerId=me is passed
    const customerId = searchParams.get("customerId");
    if (customerId === "me") {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      where.customerId = session.user.id;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          category: true,
          customer: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              image: true,
              avgRating: true,
              governorate: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Parse images from JSON string to array for clients
    const parsedJobs = jobs.map((job) => ({
      ...job,
      images: JSON.parse((job.images as string) || "[]"),
    }));

    return NextResponse.json({
      jobs: parsedJobs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { images, ...rest } = parsed.data;
    const job = await prisma.job.create({
      data: {
        ...rest,
        images: JSON.stringify(images),
        customerId: session.user.id,
        deadline: rest.deadline
          ? new Date(rest.deadline)
          : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
