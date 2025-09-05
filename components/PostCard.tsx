
import React, { useState } from 'react';
import { Post, ReactionType, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toggleReaction as apiToggleReaction, addComment as apiAddComment, updatePost as apiUpdatePost } from '../services/mockApi';
import CommentSection from './CommentSection';
import Spinner from './Spinner';

interface PostCardProps {
    post: Post;
    onUpdate: () => void;
    isSingleView?: boolean;
    onNavigateToPost?: (post: Post) => void;
    onTagClick?: (tag: string) => void;
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


const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, isSingleView = false, onNavigateToPost, onTagClick }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(post.text);
    const [editedTags, setEditedTags] = useState(post.tags?.join(', ') || '');
    const [isSaving, setIsSaving] = useState(false);
    const [phiConfirmedOnEdit, setPhiConfirmedOnEdit] = useState(false);

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

    const handleSaveEdit = async () => {
        const textChanged = editedText.trim() !== post.text;
        const tagsChanged = editedTags !== (post.tags?.join(', ') || '');

        if ((!textChanged && !tagsChanged) || !phiConfirmedOnEdit) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            const tagsArray = editedTags.split(',').map(t => t.trim()).filter(Boolean);
            await apiUpdatePost(post.id, editedText.trim(), tagsArray);
            onUpdate(); // This refreshes the data from the parent
        } catch (error) {
            console.error("Failed to update post", error);
            // Revert changes on failure
            setEditedText(post.text);
            setEditedTags(post.tags?.join(', ') || '');
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditedText(post.text);
        setEditedTags(post.tags?.join(', ') || '');
        setIsEditing(false);
        setPhiConfirmedOnEdit(false);
    };

    const userHasReacted = (type: ReactionType) => user && post.reactions.some(r => r.userId === user.id && r.type === type);
    const countReactions = (type: ReactionType) => post.reactions.filter(r => r.type === type).length;

    const heartsCount = countReactions(ReactionType.HEART);
    const supportCount = countReactions(ReactionType.SUPPORT);

    const canInteract = user && user.role !== Role.PENDING;
    const isAuthor = user && user.id === post.author.id;

    const displayName = post.displayName || post.author.name;
    const isAnonymous = post.displayName === 'Anonymous';

    const AvatarDisplay = () => {
        if (isAnonymous) {
            return (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )
        }
        return <img src={post.author.avatarUrl} alt={post.author.name} className="w-12 h-12 rounded-full object-cover mr-4" />;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <AvatarDisplay />
                        <div>
                             <div className="flex items-center space-x-2">
                                <p className="font-bold text-gray-800">{displayName}</p>
                                {!isAnonymous && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRoleBadgeClasses(post.author.role)}`}>
                                        {post.author.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        {isAuthor && !isEditing && (
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setPhiConfirmedOnEdit(false);
                                }}
                                className="text-gray-500 hover:text-blue-600 p-1 rounded-full transition-colors"
                                aria-label="Edit post"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                            </button>
                        )}
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
                </div>
                {isEditing ? (
                    <div className="mb-4">
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 resize-y"
                            rows={Math.max(4, editedText.split('\n').length)}
                            autoFocus
                        />
                         <input
                            type="text"
                            value={editedTags}
                            onChange={(e) => setEditedTags(e.target.value)}
                            placeholder="Edit tags (e.g., cardiology, pediatrics)..."
                            className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                        />
                        <div className="mt-4 flex items-start space-x-3 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                            <input
                                id={`phi_confirm_edit_${post.id}`}
                                name="phi_confirm_edit"
                                type="checkbox"
                                checked={phiConfirmedOnEdit}
                                onChange={(e) => setPhiConfirmedOnEdit(e.target.checked)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
                            />
                            <div className="text-sm">
                                <label htmlFor={`phi_confirm_edit_${post.id}`} className="font-medium text-gray-800 cursor-pointer">
                                    I confirm I have removed patient identification information (PHI).
                                </label>
                                <p className="text-yellow-800">
                                    Please double-check your post for any patient identifiers before saving.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={handleCancelEdit} className="px-4 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdit} disabled={isSaving || !phiConfirmedOnEdit || (editedText.trim() === post.text && editedTags === (post.tags?.join(', ') || ''))} className="px-4 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center justify-center w-20">
                                {isSaving ? <Spinner /> : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.text}</p>
                )}
                
                {!isEditing && post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                            <button
                                key={tag}
                                onClick={onTagClick ? () => onTagClick(tag) : undefined}
                                className={`text-xs font-medium px-2.5 py-1 rounded-full ${onTagClick ? 'bg-teal-100 text-teal-800 hover:bg-teal-200 cursor-pointer' : 'bg-gray-100 text-gray-800'}`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
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
                 {(heartsCount > 0 || supportCount > 0) && (
                    <div className="text-sm text-gray-600 pb-2 flex items-center">
                        {heartsCount > 0 && <span>{heartsCount} Heart{heartsCount !== 1 ? 's' : ''}</span>}
                        {heartsCount > 0 && supportCount > 0 && <span className="mx-2">&middot;</span>}
                        {supportCount > 0 && <span>{supportCount} Support{supportCount !== 1 ? 's' : ''}</span>}
                    </div>
                )}
                <div className="border-t border-gray-200 py-2 flex justify-around">
                    <button
                        onClick={() => handleReaction(ReactionType.HEART)}
                        disabled={!canInteract}
                        className={`flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors rounded-md p-2 disabled:cursor-not-allowed disabled:text-gray-400 ${userHasReacted(ReactionType.HEART) ? 'text-red-500 font-semibold' : ''}`}
                    >
                        <svg className="w-6 h-6" fill={userHasReacted(ReactionType.HEART) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <span>Heart</span>
                    </button>
                    <button
                        onClick={() => handleReaction(ReactionType.SUPPORT)}
                        disabled={!canInteract}
                        className={`flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors rounded-md p-2 disabled:cursor-not-allowed disabled:text-gray-400 ${userHasReacted(ReactionType.SUPPORT) ? 'text-blue-500 font-semibold' : ''}`}
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