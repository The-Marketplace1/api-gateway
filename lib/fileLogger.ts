import { createWriteStream, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { WriteStream } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, "../../logs");

let accessStream: WriteStream | null = null;
let errorStream: WriteStream | null = null;

function ensureLogsDir(): void {
  try { mkdirSync(LOGS_DIR, { recursive: true }); } catch {}
}

export function getAccessLogStream(): WriteStream {
  if (!accessStream) {
    ensureLogsDir();
    accessStream = createWriteStream(join(LOGS_DIR, "access.log"), { flags: "a" });
  }
  return accessStream;
}

export function getErrorLogStream(): WriteStream {
  if (!errorStream) {
    ensureLogsDir();
    errorStream = createWriteStream(join(LOGS_DIR, "error.log"), { flags: "a" });
  }
  return errorStream;
}

export function writeLine(stream: WriteStream, line: string): void {
  stream.write(line + "\n");
}
