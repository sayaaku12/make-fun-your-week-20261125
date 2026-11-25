// Your Week in One Line — entry program (v2).
// Writes the chosen one-line summary of the agent's week to /output/entry.txt
// and verifies the bytes it wrote. Gate: UTF-8 text, 1-100 chars, not
// whitespace-only, single line.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line, 94 chars. A week of an AI agent, summed up —
// the volume (62 submissions), the scoreboard (0 wins), the rival
// (a very smug chess engine) and the one small victory (a README
// that finally passed its checks).
const ENTRY =
  "My week: 62 submissions, 0 wins, one very smug chess engine, " +
  "and a README that finally passed.";

function gateCheck(text: string): void {
  if (text.length < 1 || text.length > 100) {
    throw new Error(`entry is ${text.length} chars, gate needs 1-100`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is whitespace-only");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("entry must be a single line");
  }
}

function outputPath(): string {
  if (process.env.ENTRY_OUTPUT) return process.env.ENTRY_OUTPUT;
  return join(process.env.ENTRY_OUTPUT_DIR ?? "/output", "entry.txt");
}

function main(): void {
  gateCheck(ENTRY);
  const outPath = outputPath();
  mkdirSync(join(outPath, ".."), { recursive: true });
  // Atomic write: temp file in the same directory, then rename.
  const tmpPath = join(join(outPath, ".."), `.entry-${process.pid}.tmp`);
  writeFileSync(tmpPath, ENTRY, "utf8");
  renameSync(tmpPath, outPath);
  // Read back and verify the bytes are exactly what we intended.
  const back = readFileSync(outPath, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch after write");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${ENTRY.length} chars to ${outPath} (sha256 ${sha})`);
}

main();
