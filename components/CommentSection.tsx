
import React, { useState } from 'react';
import { Comment, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (text: string) => Promise<void>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
    const { user } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || user.role === Role.PENDING) return;
        
        setLoading(true);
        await onAddComment(newComment);
        setNewComment('');
        setLoading(false);
    };

    const canComment = user && user.role !== Role.PENDING;

    return (
        <div className="mt-4">
            {canComment && (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-4">
                    <img src={user?.avatarUrl} alt={user?.name} className="w-9 h-9 rounded-full object-cover" />
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 border bg-gray-50 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                    <button type="submit" disabled={loading || !newComment.trim()} className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 disabled:bg-teal-300">
                        {loading ? <Spinner /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                        <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-9 h-9 rounded-full object-cover" />
                        <div className="bg-gray-100 rounded-lg p-2 flex-1">
                            <p className="font-semibold text-sm text-gray-800">{comment.author.name}</p>
                            <p className="text-sm text-gray-600">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
