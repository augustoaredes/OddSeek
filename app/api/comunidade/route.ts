import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db/client';
import { posts, users, comments, bets } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

export async function GET() {
  const db = getDb();

  const rows = await db
    .select({
      id:        posts.id,
      body:      posts.body,
      createdAt: posts.createdAt,
      userId:    posts.userId,
      userName:  users.name,
      userHandle: users.handle,
      commentCount: sql<number>`(select count(*) from comments where comments.post_id = ${posts.id})`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(30);

  return Response.json(rows, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  });
}

const postSchema = z.object({ body: z.string().min(1).max(500) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

  const db = getDb();
  const [post] = await db.insert(posts).values({
    userId: session.user.id,
    body: parsed.data.body,
  }).returning();

  return Response.json(post, { status: 201 });
}
