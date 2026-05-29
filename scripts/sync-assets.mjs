import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const pairs = [
  ["assets/css", "public/assets/css"],
  ["assets/js", "public/assets/js"],
  ["assets/images", "public/assets/images"]
];

async function syncPair(fromRel, toRel) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  await mkdir(to, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
}

async function main() {
  for (const [from, to] of pairs) {
    await syncPair(from, to);
  }
  console.log("Synced assets -> public/assets");
}

main().catch((error) => {
  console.error("Asset sync failed:", error);
  process.exitCode = 1;
});
