import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPaymentIntent } from "@/lib/stripe";
import { z } from "zod";

const createPaymentSchema = z.object({
  jobId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(["usd", "syp"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { jobId, amount, currency } = parsed.data;

    const paymentIntent = await createPaymentIntent(amount, currency, {
      jobId,
      userId: session.user.id,
    });

    await prisma.payment.create({
      data: {
        jobId,
        userId: session.user.id,
        amount,
        currency: currency === "usd" ? "USD" : "SYP",
        method: "STRIPE",
        status: "PENDING",
        stripePaymentId: paymentIntent.id,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
