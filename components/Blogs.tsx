
import React, { useState, useEffect, useCallback } from 'react';
import { getBlogs, createBlog } from '../services/mockApi';
import { Blog, CreateBlogData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

const Blogs: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedBlogs = await getBlogs();
            setBlogs(fetchedBlogs);
        } catch (err) {
            setError('Failed to fetch blogs.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleCreateBlog = async (data: CreateBlogData) => {
        try {
            await createBlog(data);
            setShowForm(false);
            fetchBlogs(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Failed to create blog post.');
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-16"><Spinner size="lg"/></div>;
    }

    if (error) {
        return <p className="text-center text-red-500 mt-8">{error}</p>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Blogs</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Create New Blog'}
                </button>
            </div>

            {showForm && <CreateBlogForm onCreate={handleCreateBlog} />}

            <div className="space-y-6">
                {blogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} />
                ))}
            </div>
        </div>
    );
};


const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {blog.cover_image_url && (
            <img src={blog.cover_image_url} alt={blog.title} className="w-full h-56 object-cover" />
        )}
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <img src={blog.author.avatarUrl} alt={blog.author.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                <span>{blog.author.name}</span>
                <span className="mx-2">&middot;</span>
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{blog.content.substring(0, 200)}...</p>
        </div>
    </div>
);


const CreateBlogForm: React.FC<{ onCreate: (data: CreateBlogData) => Promise<void> }> = ({ onCreate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setLoading(true);
        await onCreate({ title, content, coverImage: coverImage || undefined });
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">New Blog Post</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Blog Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
                <textarea placeholder="Write your content here..." value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 border rounded-md" rows={8} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cover Image (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300">
                        {loading ? <Spinner /> : 'Publish'}
                    </button>
                </div>
            </form>
        </div>
    );
};


export default Blogs;
