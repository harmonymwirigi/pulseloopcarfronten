
import React, { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost as apiCreatePost } from '../services/mockApi';
import { Post, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CreatePostForm from './CreatePostForm';
import PostCard from './PostCard';
import Spinner from './Spinner';

interface FeedProps {
    navigateToPost: (post: Post) => void;
}

const Feed: React.FC<FeedProps> = ({ navigateToPost }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPosts = await getPosts();
            setPosts(fetchedPosts);
        } catch (err) {
            setError('Failed to fetch posts.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (text: string, mediaFile: File | null) => {
        if (!user) return;
        try {
            const newPost = await apiCreatePost(user.id, text, mediaFile);
            setPosts(prevPosts => [newPost, ...prevPosts]);
        } catch (err) {
            // FIX: A subtle parsing issue in the original catch block caused a cascade of compiler errors.
            // This refactored, type-safe error handling resolves the issue.
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while creating the post.');
            }
        }
    };
    
    if (loading) {
        return <div className="flex justify-center mt-16"><Spinner size="lg"/></div>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-8">{error}</p>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            {user && user.role === Role.NURSE && <CreatePostForm onCreatePost={handleCreatePost} />}
            {user && user.role === Role.PENDING && (
                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">Account Pending</p>
                    <p>Your account is awaiting admin approval. You can view posts, but you cannot post, comment, or react yet.</p>
                </div>
            )}
             {user && user.role === Role.ADMIN && (
                 <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">Admin View</p>
                    <p>You are viewing the feed as an Admin. You can view content but do not have posting privileges on the main feed.</p>
                </div>
            )}
            <div className="space-y-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onUpdate={fetchPosts} onNavigateToPost={navigateToPost} />
                ))}
            </div>
        </div>
    );
};

export default Feed;
