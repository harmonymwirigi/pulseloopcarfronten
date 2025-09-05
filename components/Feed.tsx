
import React, { useState, useEffect, useCallback } from 'react';
import { getPosts, createPost as apiCreatePost } from '../services/mockApi';
import { Post, Role, DisplayNamePreference } from '../types';
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
    const [filterTag, setFilterTag] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedPosts = await getPosts(filterTag || undefined);
            setPosts(fetchedPosts);
        } catch (err) {
            setError('Failed to fetch posts.');
        } finally {
            setLoading(false);
        }
    }, [filterTag]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = async (text: string, mediaFile: File | null, displayNamePreference: DisplayNamePreference, tags: string[]) => {
        if (!user) return;
        try {
            const newPost = await apiCreatePost(text, mediaFile, displayNamePreference, tags);
            // If there's a filter, clear it to show the new post
            if (filterTag) {
                setFilterTag(null);
            } else {
                setPosts(prevPosts => [newPost, ...prevPosts]);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred while creating the post.');
            }
        }
    };
    
    if (loading) {
        return <div className="flex justify-center mt-16"><Spinner size="lg" color="teal"/></div>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-8">{error}</p>;
    }

    return (
        <div>
            {user && (user.role === Role.NURSE || user.role === Role.ADMIN) && <CreatePostForm onCreatePost={handleCreatePost} />}
            {user && user.role === Role.PENDING && (
                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6" role="alert">
                    <p className="font-bold">Account Pending</p>
                    <p>Your account is awaiting admin approval. You can view posts, but you cannot post, comment, or react yet.</p>
                </div>
            )}
            {filterTag && (
                <div className="bg-teal-50 border-l-4 border-teal-500 text-teal-800 p-4 rounded-md mb-6 flex items-center justify-between">
                    <div>
                        <span className="font-semibold">Filtering by tag:</span>
                        <span className="inline-block bg-teal-200 text-teal-800 text-sm font-medium ml-2 px-2.5 py-0.5 rounded-full">{filterTag}</span>
                    </div>
                    <button onClick={() => setFilterTag(null)} className="font-semibold hover:underline">
                        Clear Filter
                    </button>
                </div>
            )}
            <div className="space-y-6">
                {posts.map(post => (
                    <PostCard key={post.id} post={post} onUpdate={fetchPosts} onNavigateToPost={navigateToPost} onTagClick={setFilterTag} />
                ))}
            </div>
        </div>
    );
};

export default Feed;