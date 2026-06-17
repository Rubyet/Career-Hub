import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningPlan extends Document {
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  skill: string;
  overview: {
    whatItIs: string;
    whyCompaniesNeedIt: string;
    realWorldUsage: string;
  };
  roadmap: {
    beginner: { concepts: string[]; duration: string };
    intermediate: { projects: string[]; duration: string };
    advanced: { topics: string[]; duration: string };
    expert: { interviewMastery: string[]; duration: string };
  };
  resources: {
    documentation: string[];
    books: string[];
    tutorials: string[];
    openSourceProjects: string[];
    githubRepos: string[];
    practiceWebsites: string[];
  };
  projects: {
    level: "Beginner" | "Intermediate" | "Advanced" | "Portfolio";
    title: string;
    goal: string;
    features: string[];
    deliverables: string[];
    skillsLearned: string[];
  }[];
  interviewQuestions: {
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    question: string;
    answer: string;
    explanation: string;
    commonMistakes: string[];
  }[];
  practicalChallenges: {
    type: "coding" | "design" | "problem-solving";
    title: string;
    description: string;
    difficulty: string;
  }[];
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const LearningPlanSchema = new Schema<ILearningPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    skill: { type: String, required: true },
    overview: {
      whatItIs: String,
      whyCompaniesNeedIt: String,
      realWorldUsage: String,
    },
    roadmap: {
      beginner: { concepts: [String], duration: String },
      intermediate: { projects: [String], duration: String },
      advanced: { topics: [String], duration: String },
      expert: { interviewMastery: [String], duration: String },
    },
    resources: {
      documentation: [String],
      books: [String],
      tutorials: [String],
      openSourceProjects: [String],
      githubRepos: [String],
      practiceWebsites: [String],
    },
    projects: [
      {
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Portfolio"],
        },
        title: String,
        goal: String,
        features: [String],
        deliverables: [String],
        skillsLearned: [String],
      },
    ],
    interviewQuestions: [
      {
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        question: String,
        answer: String,
        explanation: String,
        commonMistakes: [String],
      },
    ],
    practicalChallenges: [
      {
        type: { type: String, enum: ["coding", "design", "problem-solving"] },
        title: String,
        description: String,
        difficulty: String,
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

LearningPlanSchema.index({ userId: 1, skill: 1 });

const LearningPlan: Model<ILearningPlan> =
  mongoose.models.LearningPlan ||
  mongoose.model<ILearningPlan>("LearningPlan", LearningPlanSchema);

export default LearningPlan;
