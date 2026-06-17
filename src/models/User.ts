import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  role: "user" | "admin";
  preferences: {
    theme: "light" | "dark" | "system";
    defaultModel: string;
    jobExtractionModel: string;
    skillAnalysisModel: string;
    learningRoadmapModel: string;
    interviewPrepModel: string;
  };
  profile: {
    title?: string;
    skills: string[];
    experience: number;
    education?: string;
    resumeText?: string;
  };
  stats: {
    jobsAnalyzed: number;
    jobsSaved: number;
    skillsLearning: number;
    interviewPlans: number;
    studyStreak: number;
    lastStudyDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Date },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
      defaultModel: { type: String, default: "llama3:8b" },
      jobExtractionModel: { type: String, default: "llama3:8b" },
      skillAnalysisModel: { type: String, default: "gemma2:9b" },
      learningRoadmapModel: { type: String, default: "qwen3:14b" },
      interviewPrepModel: { type: String, default: "qwen3:14b" },
    },
    profile: {
      title: { type: String },
      skills: [{ type: String }],
      experience: { type: Number, default: 0 },
      education: { type: String },
      resumeText: { type: String },
    },
    stats: {
      jobsAnalyzed: { type: Number, default: 0 },
      jobsSaved: { type: Number, default: 0 },
      skillsLearning: { type: Number, default: 0 },
      interviewPlans: { type: Number, default: 0 },
      studyStreak: { type: Number, default: 0 },
      lastStudyDate: { type: Date },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
