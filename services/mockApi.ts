import { User, Post, Comment, Reaction, ReactionType, Resource, Blog, CreateResourceData, CreateBlogData, ChatMessage } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const handleApiResponse = async (response: Response) => {
    if (response.status === 401) {
        // Unauthorized, clear session and reload
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.reload();
        throw new Error('Unauthorized');
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errorData.error || response.statusText);
    }
    return response.json();
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    const headers = { ...getAuthHeaders(), ...options.headers };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    return handleApiResponse(response);
};

// --- AUTH ---
export const login = async (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleApiResponse(response);
};

export const signup = async (name: string, email: string, password: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    return handleApiResponse(response);
};

export const getUserById = (userId: string): Promise<User> => fetchWithAuth(`/users/${userId}`);

// --- POSTS ---
export const getPosts = (): Promise<Post[]> => fetchWithAuth('/posts');

export const createPost = (authorId: string, text: string, mediaFile: File | null): Promise<Post> => {
    const formData = new FormData();
    formData.append('text', text);
    if (mediaFile) {
        formData.append('mediaFile', mediaFile);
    }
    return fetchWithAuth('/posts', {
        method: 'POST',
        body: formData,
    });
};

// --- REACTIONS ---
export const toggleReaction = (postId: string, userId: string, type: ReactionType): Promise<{ message: string }> => {
    return fetchWithAuth(`/posts/${postId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ type }),
    });
};

// --- COMMENTS ---
export const addComment = (postId: string, authorId: string, text: string): Promise<Comment> => {
    return fetchWithAuth(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};

// --- ADMIN ---
export const getPendingUsers = (): Promise<User[]> => fetchWithAuth('/admin/pending-users');
export const approveUser = (userId: string): Promise<User> => fetchWithAuth(`/admin/approve-user/${userId}`, { method: 'PUT' });

export const getPendingResources = (): Promise<Resource[]> => fetchWithAuth('/admin/pending-resources');
export const approveResource = (resourceId: string): Promise<Resource> => fetchWithAuth(`/admin/approve-resource/${resourceId}`, { method: 'PUT' });

export const getPendingBlogs = (): Promise<Blog[]> => fetchWithAuth('/admin/pending-blogs');
export const approveBlog = (blogId: string): Promise<Blog> => fetchWithAuth(`/admin/approve-blog/${blogId}`, { method: 'PUT' });


// --- RESOURCES ---
export const getResources = (): Promise<Resource[]> => fetchWithAuth('/resources');

export const createResource = (data: CreateResourceData): Promise<Resource> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    if (data.description) formData.append('description', data.description);
    if (data.content) formData.append('content', data.content);
    if (data.file) formData.append('file', data.file);

    return fetchWithAuth('/resources', {
        method: 'POST',
        body: formData,
    });
};

// --- BLOGS ---
export const getBlogs = (): Promise<Blog[]> => fetchWithAuth('/blogs');

export const createBlog = (data: CreateBlogData): Promise<Blog> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
    }

    return fetchWithAuth('/blogs', {
        method: 'POST',
        body: formData,
    });
};

// --- AI CHAT ---
export const getAiChatResponse = (message: string, history: ChatMessage[]): Promise<{ reply: string }> => {
    return fetchWithAuth('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    });
};
