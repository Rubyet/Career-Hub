import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, jobId: 1 });

const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);

export default Note;
