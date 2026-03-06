import mongoose, { Schema, Document, Model } from "mongoose";

export type ProjectStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

export interface ITeamMember {
    name: string;
    registerNumber: string;
}

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;

    title: string;
    abstract: string;
    techStack: string[];
    guideName: string;
    teamMembers: ITeamMember[];

    status: ProjectStatus;

    proposalUrl: string;
    reportUrl: string;
    presentationUrl: string;
    proposalPublicId: string;
    reportPublicId: string;
    presentationPublicId: string;

    latestReviewComment: string;
    latestReviewedBy: mongoose.Types.ObjectId | null;
    latestReviewedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
    {
        name: { type: String, required: true, trim: true },
        registerNumber: { type: String, required: true, uppercase: true, trim: true },
    },
    { _id: false }
);

const ProjectSchema = new Schema<IProject>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        title: { type: String, required: true, trim: true, maxlength: 200 },
        abstract: { type: String, required: true, trim: true, maxlength: 2000 },
        techStack: {
            type: [String],
            default: [],
            validate: {
                validator: (v: string[]) => v.length <= 15,
                message: "Maximum 15 tech stack items allowed",
            },
        },
        guideName: { type: String, required: true, trim: true },
        teamMembers: {
            type: [TeamMemberSchema],
            default: [],
            validate: {
                validator: (v: ITeamMember[]) => v.length <= 6,
                message: "Maximum 6 team members allowed",
            },
        },

        status: {
            type: String,
            enum: ["draft", "submitted", "under_review", "approved", "rejected"],
            default: "draft",
        },

        proposalUrl: { type: String, default: "" },
        reportUrl: { type: String, default: "" },
        presentationUrl: { type: String, default: "" },
        proposalPublicId: { type: String, default: "" },
        reportPublicId: { type: String, default: "" },
        presentationPublicId: { type: String, default: "" },

        latestReviewComment: { type: String, default: "" },
        latestReviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
        latestReviewedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

ProjectSchema.index({ studentId: 1 });
ProjectSchema.index({ status: 1 });

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
