// Client-safe TypeScript interfaces (no Mongoose types)

export type UserRole = "student" | "staff";
export type ProjectStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";
export type ReviewAction = "approved" | "rejected";

export type DocType = "proposal" | "report" | "presentation";

export interface IUserClient {
    id: string;
    role: UserRole;
    name: string;
    registerNumber?: string | null;
    email?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
}

export interface ITeamMemberClient {
    name: string;
    registerNumber: string;
}

export interface IProjectClient {
    _id: string;
    studentId: string;
    title: string;
    abstract: string;
    techStack: string[];
    guideName: string;
    teamMembers: ITeamMemberClient[];
    status: ProjectStatus;
    proposalUrl: string;
    reportUrl: string;
    presentationUrl: string;
    latestReviewComment: string;
    latestReviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IReviewClient {
    action: ReviewAction;
    comment: string;
    reviewedByName: string;
    reviewedAt: string;
}

export interface IStudentDetailClient {
    id: string;
    registerNumber: string;
    name: string;
    department: string;
    batch: string;
    section: string;
    avatarUrl: string;
    project: IProjectClient | null;
    reviewHistory: IReviewClient[];
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    rejected: "Rejected",
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
};

export const DEPARTMENTS = [
    "CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "CSD", "OTHER",
] as const;
