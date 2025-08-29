
import React, { useState, useEffect, useCallback } from 'react';
import { getResources, createResource } from '../services/mockApi';
import { Resource, ResourceType, CreateResourceData } from '../types';
import Spinner from './Spinner';

const Resources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedResources = await getResources();
            setResources(fetchedResources);
        } catch (err) {
            setError('Failed to fetch resources.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleCreateResource = async (data: CreateResourceData) => {
        try {
            await createResource(data);
            setShowForm(false);
            fetchResources(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Failed to create resource.');
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
                <h1 className="text-3xl font-bold text-gray-800">Resources</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Add New Resource'}
                </button>
            </div>

            {showForm && <CreateResourceForm onCreate={handleCreateResource} />}

            <div className="space-y-4">
                {resources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
        </div>
    );
};

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
            <h3 className="font-bold text-lg text-gray-800">{resource.title}</h3>
            <p className="text-sm text-gray-600">{resource.description}</p>
            <p className="text-xs text-gray-400 mt-1">Shared by {resource.author.name}</p>
        </div>
        <div>
            {resource.type === ResourceType.LINK && resource.content && (
                <a href={resource.content} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm">
                    Open Link
                </a>
            )}
             {resource.type === ResourceType.FILE && resource.file_url && (
                <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">
                    Download File
                </a>
            )}
        </div>
    </div>
);

const CreateResourceForm: React.FC<{ onCreate: (data: CreateResourceData) => Promise<void> }> = ({ onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ResourceType>(ResourceType.LINK);
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const data: CreateResourceData = { title, description, type };
        if (type === ResourceType.LINK) data.content = content;
        if (type === ResourceType.FILE) data.file = file || undefined;
        await onCreate(data);
        setLoading(false);
    };
    
    return (
         <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4">New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
                <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-md" rows={3} />
                <select value={type} onChange={e => setType(e.target.value as ResourceType)} className="w-full px-4 py-2 border rounded-md bg-white">
                    <option value={ResourceType.LINK}>Link</option>
                    <option value={ResourceType.FILE}>File</option>
                </select>
                {type === ResourceType.LINK && <input type="url" placeholder="https://example.com" value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />}
                {type === ResourceType.FILE && <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" required />}
                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-teal-300">
                        {loading ? <Spinner /> : 'Submit for Approval'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Resources;
