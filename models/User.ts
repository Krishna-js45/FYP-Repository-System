import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    role: "student" | "staff";

    // Student-only fields
    registerNumber?: string;
    name?: string;
    department?: string;
    batch?: string;
    section?: string;
    phone?: string;
    avatarUrl?: string;

    // Staff-only fields
    email?: string;
    staffName?: string;
    designation?: string;
    staffDepartment?: string;

    // Auth
    passwordHash: string;

    createdAt: Date;
    updatedAt: Date;
}

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "CSD", "OTHER"];

const UserSchema = new Schema<IUser>(
    {
        role: {
            type: String,
            enum: ["student", "staff"],
            required: true,
        },

        // Student fields
        registerNumber: {
            type: String,
            uppercase: true,
            trim: true,
            sparse: true,
            unique: true,
        },
        name: { type: String, trim: true },
        department: { type: String, enum: DEPARTMENTS },
        batch: { type: String, trim: true },
        section: { type: String, uppercase: true, trim: true },
        phone: { type: String, trim: true },
        avatarUrl: { type: String, default: "" },

        // Staff fields
        email: {
            type: String,
            lowercase: true,
            trim: true,
            sparse: true,
            unique: true,
        },
        staffName: { type: String, trim: true },
        designation: { type: String, trim: true },
        staffDepartment: { type: String, enum: DEPARTMENTS },

        // Auth
        passwordHash: { type: String, required: true },
    },
    { timestamps: true }
);

UserSchema.index({ registerNumber: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
