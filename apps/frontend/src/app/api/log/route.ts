import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: "events must be an array" }, { status: 400 });
    }

    for (const event of events) {
      console.log(JSON.stringify({ type: "ui", ...event }));
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
