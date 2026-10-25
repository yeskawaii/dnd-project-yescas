import mongoose from "mongoose";
import Character from "../models/Character.js";
import { tokenIcon } from "../../shared/mapTokens.mjs";

// Icons are read live: changing a character's emblem doesn't require the DM to
// remove/recreate the token or save an old encounter snapshot again.
export async function campaignTokenIcons(campaign) {
  const entries = [...(campaign.dmWorkspace?.combat?.combatants || []),
    ...(campaign.dmWorkspace?.map?.participants || [])];
  const ids = [...new Set(entries.filter((entry) => entry.kind === "player" &&
    mongoose.isValidObjectId(entry.sourceId)).map((entry) => entry.sourceId))];
  const characters = ids.length ? await Character.find({
    campaign: campaign._id, _id: { $in: ids },
  }).select("_id appearance.emblem") : [];
  const emblems = new Map(characters.map((entry) => [String(entry._id), entry.appearance?.emblem]));
  return Object.fromEntries(entries.map((entry) => [entry.id, tokenIcon({
    kind: entry.kind, icon: entry.kind === "player" ? emblems.get(entry.sourceId) : undefined,
  })]));
}
