import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewPlan extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  plan30Day: {
    week: number;
    focus: string;
    tasks: string[];
    milestones: string[];
  }[];
  plan60Day: {
    week: number;
    focus: string;
    tasks: string[];
    milestones: string[];
  }[];
  plan90Day: {
    week: number;
    focus: string;
    tasks: string[];
    milestones: string[];
  }[];
  requiredProjects: {
    title: string;
    description: string;
    skills: string[];
    estimatedTime: string;
  }[];
  certifications: {
    name: string;
    provider: string;
    relevance: string;
    estimatedTime: string;
    url?: string;
  }[];
  resumeOptimization: {
    missingSkills: string[];
    suggestions: string[];
    keywordImprovements: string[];
  };
  riskAnalysis: {
    weakAreas: string[];
    missingExperience: string[];
    missingSkills: string[];
    improvements: string[];
  };
  skillGap: {
    missingSkills: string[];
    missingProjects: string[];
    missingExperience: string[];
    readinessScore: number;
  };
  mockInterviews: {
    type: "technical" | "behavioral" | "scenario";
    questions: {
      question: string;
      expectedAnswer: string;
      tips: string[];
    }[];
  }[];
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const InterviewPlanSchema = new Schema<IInterviewPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    plan30Day: [
      {
        week: Number,
        focus: String,
        tasks: [String],
        milestones: [String],
      },
    ],
    plan60Day: [
      {
        week: Number,
        focus: String,
        tasks: [String],
        milestones: [String],
      },
    ],
    plan90Day: [
      {
        week: Number,
        focus: String,
        tasks: [String],
        milestones: [String],
      },
    ],
    requiredProjects: [
      {
        title: String,
        description: String,
        skills: [String],
        estimatedTime: String,
      },
    ],
    certifications: [
      {
        name: String,
        provider: String,
        relevance: String,
        estimatedTime: String,
        url: String,
      },
    ],
    resumeOptimization: {
      missingSkills: [String],
      suggestions: [String],
      keywordImprovements: [String],
    },
    riskAnalysis: {
      weakAreas: [String],
      missingExperience: [String],
      missingSkills: [String],
      improvements: [String],
    },
    skillGap: {
      missingSkills: [String],
      missingProjects: [String],
      missingExperience: [String],
      readinessScore: { type: Number, default: 0 },
    },
    mockInterviews: [
      {
        type: { type: String, enum: ["technical", "behavioral", "scenario"] },
        questions: [
          {
            question: String,
            expectedAnswer: String,
            tips: [String],
          },
        ],
      },
    ],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "not-started",
    },
  },
  { timestamps: true }
);

InterviewPlanSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const InterviewPlan: Model<IInterviewPlan> =
  mongoose.models.InterviewPlan ||
  mongoose.model<IInterviewPlan>("InterviewPlan", InterviewPlanSchema);

export default InterviewPlan;
