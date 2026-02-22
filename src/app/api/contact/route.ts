import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Log contact message in development; in production configure an email service.
    if (process.env.NODE_ENV === "development") {
      console.log("[Contact Form]", { name, email, message });
    }

    // TODO: Send email via RESEND_API_KEY or SMTP when configured.
    // import { sendContactEmail } from "@/lib/mail";
    // await sendContactEmail({ name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
