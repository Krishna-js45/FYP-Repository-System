import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectReview extends Document {
    _id: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    reviewedBy: mongoose.Types.ObjectId;
    action: "approved" | "rejected";
    comment: string;
    reviewedAt: Date;
}

const ProjectReviewSchema = new Schema<IProjectReview>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
        studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reviewedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, enum: ["approved", "rejected"], required: true },
        comment: { type: String, required: true, trim: true, maxlength: 1000 },
        reviewedAt: { type: Date, default: () => new Date() },
    },
    { timestamps: false }
);

ProjectReviewSchema.index({ projectId: 1, reviewedAt: -1 });
ProjectReviewSchema.index({ studentId: 1 });
ProjectReviewSchema.index({ reviewedBy: 1 });

const ProjectReview: Model<IProjectReview> =
    mongoose.models.ProjectReview ||
    mongoose.model<IProjectReview>("ProjectReview", ProjectReviewSchema);

export default ProjectReview;
