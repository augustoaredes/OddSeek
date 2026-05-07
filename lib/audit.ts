import { getDb } from './db/client';
import { auditLog } from './db/schema';
import { logger } from './logger';

interface AuditEntry {
  userId?: string;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
  ipHash?: string;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const db = getDb();
    await db.insert(auditLog).values({
      userId:  entry.userId ?? null,
      action:  entry.action,
      target:  entry.target ?? null,
      meta:    entry.meta ?? null,
      ipHash:  entry.ipHash ?? null,
    });
  } catch (err) {
    logger.warn({ err, entry }, 'audit write failed');
  }
}
