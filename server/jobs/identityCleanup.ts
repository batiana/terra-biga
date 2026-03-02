import { and, isNotNull, lt } from "drizzle-orm";
import { identities } from "../../drizzle/schema";
import { getDb } from "../db";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export async function cleanupIdentityDocuments(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const cutoff = new Date(Date.now() - SIX_MONTHS_MS);

  await db
    .update(identities)
    .set({ documentImageUrl: null })
    .where(
      and(
        isNotNull(identities.documentImageUrl),
        lt(identities.createdAt, cutoff)
      )
    );
}

export function scheduleIdentityDocumentCleanup(): void {
  void cleanupIdentityDocuments();
  setInterval(() => {
    void cleanupIdentityDocuments();
  }, ONE_DAY_MS);
}
