import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listIdRaw = process.env.BREVO_LIST_ID;
    const listId = Number(listIdRaw);

    if (!apiKey || !listIdRaw || Number.isNaN(listId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Newsletter service is not configured yet",
        },
        { status: 500 }
      );
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!brevoRes.ok) {
      const errorText = await brevoRes.text();
      return NextResponse.json(
        {
          success: false,
          message: "Brevo rejected the subscription",
          details: errorText,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to subscribe" }, { status: 500 });
  }
}
