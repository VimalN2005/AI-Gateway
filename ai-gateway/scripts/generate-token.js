#!/usr/bin/env node
/**
 * CLI tool to generate JWT API tokens for the AI Gateway.
 * Usage: node scripts/generate-token.js --user "vimal" --tier "pro"
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const userId = get("--user") || `user_${uuidv4().slice(0, 8)}`;
const tier = get("--tier") || "free";
const expiresIn = get("--expires") || "30d";

const VALID_TIERS = ["free", "pro", "enterprise"];
if (!VALID_TIERS.includes(tier)) {
  console.error(`❌ Invalid tier "${tier}". Must be one of: ${VALID_TIERS.join(", ")}`);
  process.exit(1);
}

const secret = process.env.JWT_SECRET || "dev-secret-change-me";
const payload = { userId, tier };
const token = jwt.sign(payload, secret, { expiresIn });

console.log("\n✅ Token generated successfully!\n");
console.log(`   User   : ${userId}`);
console.log(`   Tier   : ${tier}`);
console.log(`   Expires: ${expiresIn}`);
console.log("\n📋 Token:\n");
console.log(`   ${token}\n`);
console.log("💡 Usage:\n");
console.log(`   curl -H "Authorization: Bearer ${token}" \\`);
console.log(`        -H "Content-Type: application/json" \\`);
console.log(`        -d '{"text":"Hello world"}' \\`);
console.log(`        http://localhost:8000/api/nlp/analyze\n`);
