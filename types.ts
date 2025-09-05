

export enum Role {
    ADMIN = 'ADMIN',
    NURSE = 'NURSE',
    PENDING = 'PENDING',
}

// FIX: Added a shared View type to resolve type conflicts.
export type View = 'FEED' | 'ADMIN' | 'PROFILE' | 'RESOURCES' | 'BLOGS' | 'SINGLE_POST' | 'LOGIN' | 'SIGNUP' | 'SINGLE_RESOURCE' | 'SINGLE_BLOG' | 'INVITATIONS';

export enum DisplayNamePreference {
    FullName = 'FullName',
    Initials = 'Initials',
    Anonymous = 'Anonymous',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string;
    title?: string;
    department?: string;
    state?: string;
    bio?: string;
    profileCompletionPercentage?: number;
}

export enum ReactionType {
    HEART = 'HEART',
    SUPPORT = 'SUPPORT',
}

export interface Reaction {
    id: string;
    userId: string;
    postId: string;
    type: ReactionType;
}

export interface Comment {
    id: string;
    text: string;
    author: User;
    createdAt: string;
}

export interface Post {
    id: string;
    author: User;
    text: string;
    tags?: string[];
    displayName?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    createdAt: string;
    comments: Comment[];
    reactions: Reaction[];
}

export enum ResourceType {
    FILE = 'FILE',
    LINK = 'LINK',
}

export enum ContentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
}

export interface Resource {
    id: string;
    author: User;
    title: string;
    description?: string;
    type: ResourceType;
    content?: string; // For links
    file_url?: string; // For files
    status: ContentStatus;
    created_at: string;
}

export interface Blog {
    id: string;
    author: User;
    title: string;
    content: string;
    coverImageUrl?: string;
    status: ContentStatus;
    created_at: string;
}

export interface CreateResourceData {
    title: string;
    type: ResourceType;
    description?: string;
    content?: string; // for LINK
    file?: File; // for FILE
}

export interface CreateBlogData {
    title: string;
    content: string;
    coverImage?: File;
}

export type MessageSender = 'USER' | 'AI';

export interface ChatMessage {
    sender: MessageSender;
    text: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED';

export interface Invitation {
    id: string;
    invitee_email: string;
    status: InvitationStatus;
    created_at: string;
}