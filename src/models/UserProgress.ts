import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  activitiesCompleted: number;
  skillsStudied: string[];
  questionsAnswered: number;
  projectsWorkedOn: string[];
  studyMinutes: number;
  createdAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    activitiesCompleted: { type: Number, default: 0 },
    skillsStudied: [{ type: String }],
    questionsAnswered: { type: Number, default: 0 },
    projectsWorkedOn: [{ type: String }],
    studyMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, date: -1 });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;
