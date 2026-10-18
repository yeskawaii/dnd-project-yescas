import mongoose from "mongoose";
import { dmWorkspaceSchema } from "./DMWorkspace.js";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dmWorkspace: { type: dmWorkspaceSchema, default: () => ({}) },
    workspaceRevision: { type: Number, default: 0 },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Campaign", campaignSchema);
