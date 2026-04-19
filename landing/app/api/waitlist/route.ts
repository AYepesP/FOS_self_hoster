import { LoopsClient } from "loops";
import { NextRequest, NextResponse } from "next/server";

const loops = new LoopsClient(process.env.LOOPS_API_KEY!);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const { email, firstName } = await req.json();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  try {
    await loops.updateContact({ email, properties: { firstName: firstName || undefined, subscribed: true } });

    const transactionalId = process.env.LOOPS_TRANSACTIONAL_ID;
    if (transactionalId) {
      await loops.sendTransactionalEmail({
        transactionalId,
        email,
        dataVariables: { firstName: firstName || "there" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[waitlist] Loops error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
