import { app } from 'electron';
import { join } from 'node:path';

const DB_FILE_NAME = 'cotidiano.db';

export function resolveDatabasePath(): string {
  if (process.env.COTIDIANO_DB_PATH) {
    return process.env.COTIDIANO_DB_PATH;
  }

  return join(app.getPath('userData'), DB_FILE_NAME);
}
