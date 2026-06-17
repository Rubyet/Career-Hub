import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalytics extends Document {
  crawlSessionId: string;
  sourceUrl: string;
  userId?: mongoose.Types.ObjectId;
  totalJobsFound: number;
  totalJobsProcessed: number;
  positionAnalysis: {
    commonRoles: { name: string; count: number }[];
    departmentDistribution: { name: string; count: number }[];
    seniorityDistribution: { name: string; count: number }[];
  };
  skillAnalysis: {
    topSkills: { name: string; count: number }[];
    skillFrequency: { name: string; percentage: number }[];
    emergingTechnologies: string[];
  };
  salaryAnalysis: {
    average: number;
    highest: number;
    lowest: number;
    byRole: { role: string; average: number }[];
    bySeniority: { level: string; average: number }[];
    currency: string;
  };
  benefitsAnalysis: {
    commonBenefits: { name: string; count: number }[];
    remoteWorkFrequency: number;
    workLifeBalance: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    crawlSessionId: { type: String, required: true, index: true },
    sourceUrl: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    totalJobsFound: { type: Number, default: 0 },
    totalJobsProcessed: { type: Number, default: 0 },
    positionAnalysis: {
      commonRoles: [{ name: String, count: Number }],
      departmentDistribution: [{ name: String, count: Number }],
      seniorityDistribution: [{ name: String, count: Number }],
    },
    skillAnalysis: {
      topSkills: [{ name: String, count: Number }],
      skillFrequency: [{ name: String, percentage: Number }],
      emergingTechnologies: [String],
    },
    salaryAnalysis: {
      average: Number,
      highest: Number,
      lowest: Number,
      byRole: [{ role: String, average: Number }],
      bySeniority: [{ level: String, average: Number }],
      currency: { type: String, default: "USD" },
    },
    benefitsAnalysis: {
      commonBenefits: [{ name: String, count: Number }],
      remoteWorkFrequency: Number,
      workLifeBalance: [String],
    },
  },
  { timestamps: true }
);

const Analytics: Model<IAnalytics> =
  mongoose.models.Analytics || mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
