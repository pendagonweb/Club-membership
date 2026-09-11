/**
 * One-off migration: run ONCE after deploying the tournament-aware
 * PlayerRegistration model, so existing registrations aren't lost.
 * Usage:  node scripts/migrateLegacyPlayers.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import Tournament from "../models/Tournament.js";
import PlayerRegistration from "../models/PlayerRegistration.js";

dotenv.config();

const LEGACY_NAME = "KINGSTAR Fan World Cup 2026";

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Drop the old single-field unique indexes if they still exist.
  for (const idx of ["userId_1", "membershipId_1"]) {
    try {
      await PlayerRegistration.collection.dropIndex(idx);
      console.log(`Dropped old index ${idx}`);
    } catch {
      console.log(`No old index ${idx} to drop (already removed).`);
    }
  }

  let legacy = await Tournament.findOne({ name: LEGACY_NAME });
  if (!legacy) {
    legacy = await Tournament.create({ name: LEGACY_NAME, isActive: false });
    console.log(`Created tournament "${LEGACY_NAME}"`);
  } else {
    console.log(`Reusing existing tournament "${LEGACY_NAME}"`);
  }

  const result = await PlayerRegistration.updateMany(
    { tournament: { $exists: false } },
    { $set: { tournament: legacy._id, tournamentName: legacy.name } },
  );

  console.log(`Migrated ${result.modifiedCount} existing registration(s) into "${legacy.name}".`);
  console.log("Activate a new tournament from the admin Player List page whenever you're ready.");

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});