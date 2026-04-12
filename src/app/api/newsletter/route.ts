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

        const backendBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const proxyRes = await fetch(`${backendBase}/api/newsletter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        const data = await proxyRes.json().catch(() => ({ success: false, message: "Failed to subscribe" }));
        if (!proxyRes.ok || !data?.success) {
            return NextResponse.json(data, { status: proxyRes.status || 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, message: "Failed to subscribe" }, { status: 500 });
    }
}
