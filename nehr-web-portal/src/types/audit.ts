export interface AuditEntry {
  entryId: number;
  actorDid: string | null;
  action: string;
  targetDid: string | null;
  targetType: string | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
}
