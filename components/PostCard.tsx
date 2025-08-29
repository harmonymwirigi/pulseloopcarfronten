import React from 'react';
import { Post, ReactionType, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toggleReaction as apiToggleReaction, addComment as apiAddComment } from '../services/mockApi';
import CommentSection from './CommentSection';

interface PostCardProps {
    post: Post;
    onUpdate: () => void;
    isSingleView?: boolean;
    onNavigateToPost?: (post: Post) => void;
}

const getRoleBadgeClasses = (role: Role) => {
    switch (role) {
        case Role.ADMIN:
            return 'bg-purple-200 text-purple-800';
        case Role.NURSE:
            return 'bg-green-200 text-green-800';
        case Role.PENDING:
            return 'bg-yellow-200 text-yellow-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};


const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, isSingleView = false, onNavigateToPost }) => {
    const { user } = useAuth();

    const handleReaction = async (type: ReactionType) => {
        if (!user || user.role === Role.PENDING) return;
        try {
            await apiToggleReaction(post.id, user.id, type);
            onUpdate();
        } catch (error) {
            console.error("Failed to toggle reaction", error);
        }
    };

    const handleAddComment = async (text: string) => {
        if (!user || user.role === Role.PENDING) return;
        try {
            await apiAddComment(post.id, user.id, text);
            onUpdate();
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    const userHasReacted = (type: ReactionType) => user && post.reactions.some(r => r.userId === user.id && r.type === type);
    const countReactions = (type: ReactionType) => post.reactions.filter(r => r.type === type).length;

    const heartsCount = countReactions(ReactionType.HEART);
    const supportCount = countReactions(ReactionType.SUPPORT);

    const canInteract = user && user.role !== Role.PENDING;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                        <div>
                             <div className="flex items-center space-x-2">
                                <p className="font-bold text-gray-800">{post.author.name}</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeClasses(post.author.role)}`}>
                                    {post.author.role}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    {!isSingleView && onNavigateToPost && (
                        <button 
                            onClick={() => onNavigateToPost(post)} 
                            className="text-gray-500 hover:text-teal-600 p-1 rounded-full transition-colors"
                            aria-label="View post details"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                    )}
                </div>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.text}</p>
            </div>
            {post.mediaUrl && (
                <div className="bg-gray-100">
                   {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="Post media" className="w-full object-contain max-h-96" />
                   ) : (
                        <video src={post.mediaUrl} controls className="w-full object-contain max-h-96"></video>
                   )}
                </div>
            )}
            <div className="p-4">
                <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
                    <div className="flex space-x-2">
                        {heartsCount > 0 && <span>{heartsCount} Hearts</span>}
                        {supportCount > 0 && <span>{supportCount} Supports</span>}
                    </div>
                    <span>{post.comments.length} Comments</span>
                </div>
                <div className="border-t border-b border-gray-200 py-2 flex justify-around">
                    <button
                        onClick={() => handleReaction(ReactionType.HEART)}
                        disabled={!canInteract}
                        className={`flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors rounded-md p-2 disabled:cursor-not-allowed disabled:text-gray-400 ${userHasReacted(ReactionType.HEART) ? 'text-red-500' : ''}`}
                    >
                        <svg className="w-6 h-6" fill={userHasReacted(ReactionType.HEART) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <span>Heart</span>
                    </button>
                    <button
                        onClick={() => handleReaction(ReactionType.SUPPORT)}
                        disabled={!canInteract}
                        className={`flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors rounded-md p-2 disabled:cursor-not-allowed disabled:text-gray-400 ${userHasReacted(ReactionType.SUPPORT) ? 'text-blue-500' : ''}`}
                    >
                       <svg className="w-6 h-6" fill={userHasReacted(ReactionType.SUPPORT) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.062 3.65A1 1 0 015.57 10H5a2 2 0 00-2 2v5a2 2 0 002 2h2.57m7.43-12l-2.062 3.65" /></svg>
                        <span>Support</span>
                    </button>
                </div>
                <CommentSection comments={post.comments} onAddComment={handleAddComment} />
            </div>
        </div>
    );
};

export default PostCard;