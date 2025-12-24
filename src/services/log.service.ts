import { getClient } from './db';

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  requestId: string;
  transactionId?: string;
  level: LogLevel;
  message: string;
  metadata?: any;
}

export async function log({
  requestId,
  transactionId,
  level,
  message,
  metadata,
}: LogPayload) {
  const client = await getClient();

  try {
    await client.query(
      `
      INSERT INTO logs
      (request_id, transaction_id, level, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        requestId,
        transactionId || null,
        level,
        message,
        metadata || null,
      ]
    );
  } catch (err) {
    console.error('LOGGING_FAILED', err);
  } finally {
    client.release();
  }
}
