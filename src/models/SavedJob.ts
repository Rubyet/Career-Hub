import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavedJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  notes: string;
  tags: string[];
  readinessScore: number;
  skillProgress: {
    skill: string;
    status: "not-started" | "learning" | "completed";
    progress: number;
  }[];
  interviewPlanId?: mongoose.Types.ObjectId;
  learningPlanId?: mongoose.Types.ObjectId;
  status: "interested" | "applied" | "interviewing" | "offered" | "rejected" | "archived";
  appliedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    notes: { type: String, default: "" },
    tags: [{ type: String }],
    readinessScore: { type: Number, default: 0, min: 0, max: 100 },
    skillProgress: [
      {
        skill: { type: String, required: true },
        status: {
          type: String,
          enum: ["not-started", "learning", "completed"],
          default: "not-started",
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
    interviewPlanId: { type: Schema.Types.ObjectId, ref: "InterviewPlan" },
    learningPlanId: { type: Schema.Types.ObjectId, ref: "LearningPlan" },
    status: {
      type: String,
      enum: ["interested", "applied", "interviewing", "offered", "rejected", "archived"],
      default: "interested",
    },
    appliedDate: { type: Date },
  },
  { timestamps: true }
);

SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob: Model<ISavedJob> =
  mongoose.models.SavedJob || mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);

export default SavedJob;
