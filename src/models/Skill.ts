import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: string;
  description?: string;
  demandCount: number;
  trending: boolean;
  relatedSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    demandCount: { type: Number, default: 0 },
    trending: { type: Boolean, default: false },
    relatedSkills: [{ type: String }],
  },
  { timestamps: true }
);

SkillSchema.index({ name: "text" });

const Skill: Model<ISkill> =
  mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);

export default Skill;
