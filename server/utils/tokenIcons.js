import mongoose from "mongoose";
import Character from "../models/Character.js";
import { characterTokenVisual, tokenIcon } from "../../shared/mapTokens.mjs";

// Visuals are read live: changing an emblem or portrait doesn't require the DM to
// remove/recreate the token or save an old encounter snapshot again.
export async function campaignTokenVisuals(campaign) {
  const entries = [...(campaign.dmWorkspace?.combat?.combatants || []),
    ...(campaign.dmWorkspace?.map?.participants || [])];
  const ids = [...new Set(entries.filter((entry) => entry.kind === "player" &&
    mongoose.isValidObjectId(entry.sourceId)).map((entry) => entry.sourceId))];
  const characters = ids.length ? await Character.find({
    campaign: campaign._id, _id: { $in: ids },
  }).select("_id appearance.emblem appearance.portrait appearance.mapTokenStyle") : [];
  const visuals = new Map(characters.map((entry) => [String(entry._id), characterTokenVisual(entry.appearance)]));
  const tokenIcons = {}, tokenPortraits = {};
  for (const entry of entries) {
    const visual = entry.kind === "player" ? visuals.get(entry.sourceId) : null;
    tokenIcons[entry.id] = visual?.icon || tokenIcon(entry);
    if (visual?.portrait) tokenPortraits[entry.id] = visual.portrait;
  }
  return { tokenIcons, tokenPortraits };
}
