import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  department?: string;
  team?: string;
  location?: string;
  country?: string;
  remoteStatus?: "Remote" | "Hybrid" | "On-site" | "Unknown";
  employmentType?: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  estimatedSalary?: {
    min: number;
    max: number;
    currency: string;
    confidence: string;
    isEstimate: boolean;
  };
  benefits: string[];
  workSchedule?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  educationRequirements?: string;
  experienceRequirements?: string;
  applicationDeadline?: Date;
  jobUrl: string;
  postingDate?: Date;
  sourceUrl: string;
  originalHtml?: string;
  extractedText?: string;
  crawlSessionId?: string;
  analysis?: {
    executiveSummary: string;
    difficulty: "Junior" | "Mid-level" | "Senior" | "Staff" | "Lead";
    skillImportance: {
      critical: string[];
      important: string[];
      niceToHave: string[];
    };
    competitiveness: "Easy" | "Moderate" | "Competitive" | "Highly Competitive";
    careerGrowth: {
      level: "Low" | "Medium" | "High";
      reasoning: string;
    };
  };
  userId?: mongoose.Types.ObjectId;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    department: { type: String },
    team: { type: String },
    location: { type: String, index: true },
    country: { type: String },
    remoteStatus: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site", "Unknown"],
      default: "Unknown",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "USD" },
      period: { type: String, default: "yearly" },
    },
    estimatedSalary: {
      min: Number,
      max: Number,
      currency: String,
      confidence: String,
      isEstimate: { type: Boolean, default: true },
    },
    benefits: [{ type: String }],
    workSchedule: { type: String },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    responsibilities: [{ type: String }],
    qualifications: [{ type: String }],
    educationRequirements: { type: String },
    experienceRequirements: { type: String },
    applicationDeadline: { type: Date },
    jobUrl: { type: String, required: true },
    postingDate: { type: Date },
    sourceUrl: { type: String, required: true },
    originalHtml: { type: String },
    extractedText: { type: String },
    crawlSessionId: { type: String, index: true },
    analysis: {
      executiveSummary: String,
      difficulty: {
        type: String,
        enum: ["Junior", "Mid-level", "Senior", "Staff", "Lead"],
      },
      skillImportance: {
        critical: [String],
        important: [String],
        niceToHave: [String],
      },
      competitiveness: {
        type: String,
        enum: ["Easy", "Moderate", "Competitive", "Highly Competitive"],
      },
      careerGrowth: {
        level: { type: String, enum: ["Low", "Medium", "High"] },
        reasoning: String,
      },
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

JobSchema.index({ title: "text", company: "text", location: "text" });
JobSchema.index({ createdAt: -1 });

const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
