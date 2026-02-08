import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq } from 'drizzle-orm';
import { users } from '@onlysnow/db';
import type { UserPreferences } from '@onlysnow/types';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Helper to extract user ID from Supabase JWT
function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    // Decode JWT payload (verification done by Supabase middleware in production)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export const GET = withLogging(async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const prefs: UserPreferences = {
    passType: user.passType,
    location: user.location,
    driveRadius: user.driveRadius,
    chaseWillingness: user.chaseWillingness,
    persona: user.persona,
    preferences: user.preferences as Record<string, unknown> | null,
  };

  return NextResponse.json(prefs);
});

export const PUT = withLogging(async function PUT(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Partial<UserPreferences>;
  const db = getDb();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.passType !== undefined) updateData.passType = body.passType;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.driveRadius !== undefined) updateData.driveRadius = body.driveRadius;
  if (body.chaseWillingness !== undefined) updateData.chaseWillingness = body.chaseWillingness;
  if (body.persona !== undefined) updateData.persona = body.persona;
  if (body.preferences !== undefined) updateData.preferences = body.preferences;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const prefs: UserPreferences = {
    passType: updated.passType,
    location: updated.location,
    driveRadius: updated.driveRadius,
    chaseWillingness: updated.chaseWillingness,
    persona: updated.persona,
    preferences: updated.preferences as Record<string, unknown> | null,
  };

  return NextResponse.json(prefs);
});
