import { readFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const root = process.cwd();
const appDataFile = path.join(root, "data", "app-data.json");
const formsFile = path.join(root, "data", "form-submissions.ndjson");

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase().slice(0, 180);
}

function normalizeRole(value) {
  const role = String(value || "professional").toLowerCase().trim();
  if (["admin", "enterprise", "professional", "student"].includes(role)) {
    return role;
  }
  return "professional";
}

async function migrateUsers() {
  let users = [];

  try {
    const raw = await readFile(appDataFile, "utf8");
    const parsed = parseJson(raw, {});
    if (Array.isArray(parsed.users)) {
      users = parsed.users;
    }
  } catch {
    users = [];
  }

  for (const item of users) {
    const email = normalizeEmail(item.email);
    if (!email) {
      continue;
    }

    const plainPassword = String(item.password || "");
    let passwordHash = String(item.passwordHash || "");

    if (!passwordHash.startsWith("$2") && plainPassword) {
      passwordHash = await bcrypt.hash(plainPassword, 12);
    }

    if (!passwordHash.startsWith("$2")) {
      continue;
    }

    await prisma.user.upsert({
      where: { email },
      update: {
        fullName: String(item.fullName || "FinReady User").slice(0, 160),
        passwordHash,
        role: normalizeRole(item.role)
      },
      create: {
        fullName: String(item.fullName || "FinReady User").slice(0, 160),
        email,
        passwordHash,
        role: normalizeRole(item.role)
      }
    });
  }
}

async function migrateLeads() {
  let lines = [];

  try {
    const raw = await readFile(formsFile, "utf8");
    lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    lines = [];
  }

  for (const line of lines) {
    const row = parseJson(line, null);
    if (!row || typeof row !== "object") {
      continue;
    }

    const submittedAt = row.submittedAt ? new Date(row.submittedAt) : new Date();

    await prisma.leadSubmission.create({
      data: {
        formName: String(row.formName || "general-contact").slice(0, 120),
        page: String(row.page || "unknown").slice(0, 240),
        message: String(row.message || "").slice(0, 4000),
        fields: row.fields && typeof row.fields === "object" ? row.fields : {},
        ipAddress: String(row.ipAddress || "unknown").slice(0, 100),
        userAgent: String(row.userAgent || "unknown").slice(0, 400),
        createdAt: Number.isNaN(submittedAt.getTime()) ? new Date() : submittedAt
      }
    });
  }
}

async function main() {
  await migrateUsers();
  await migrateLeads();
  console.log("Migration from local files to database completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
