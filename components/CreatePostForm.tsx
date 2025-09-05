
import React, { useState, useRef } from 'react';
import Spinner from './Spinner';
import { useAuth } from '../contexts/AuthContext';
import { Role, DisplayNamePreference } from '../types';
import PrePostConfirmationModal from './PrePostConfirmationModal';

interface CreatePostFormProps {
    onCreatePost: (text: string, mediaFile: File | null, displayNamePreference: DisplayNamePreference, tags: string[]) => Promise<void>;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onCreatePost }) => {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setPreview(URL.createObjectURL(file));
            if (file.type.startsWith('video/')) {
                setMediaType('video');
            } else {
                setMediaType('image');
            }
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setPreview(null);
        setMediaType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInitiatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && !mediaFile) return;
        setIsModalOpen(true);
    };

    const handleConfirmPost = async (preference: DisplayNamePreference) => {
        setIsModalOpen(false);
        setLoading(true);
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        await onCreatePost(text, mediaFile, preference, tagsArray);
        setText('');
        setTags('');
        handleRemoveMedia();
        setLoading(false);
    };

    if (!user || (user.role !== Role.NURSE && user.role !== Role.ADMIN)) {
        return null;
    }

    return (
        <>
            <PrePostConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPost}
                user={user}
            />
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex items-start space-x-4">
                    <img src={user?.avatarUrl} alt={user?.name} className="w-12 h-12 rounded-full object-cover" />
                    <form onSubmit={handleInitiatePost} className="w-full">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Share your thoughts or a case study..."
                            className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                            rows={3}
                        />
                         <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Add tags (e.g., cardiology, pediatrics)..."
                            className="w-full p-2 mt-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                        />
                         {preview && (
                            <div className="mt-2 relative">
                                {mediaType === 'image' ? (
                                    <img src={preview} alt="Media preview" className="rounded-lg max-h-60 w-auto" />
                                ) : (
                                    <video src={preview} controls className="rounded-lg max-h-60 w-auto" />
                                )}
                                <button type="button" onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75">
                                    <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="hidden"
                                id="media-upload"
                            />
                            <label htmlFor="media-upload" className="cursor-pointer text-teal-500 hover:text-teal-600">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </label>
                            <button type="submit" disabled={loading || (!text.trim() && !mediaFile)} className="px-6 py-2 bg-teal-500 text-white rounded-full font-semibold hover:bg-teal-600 transition-colors disabled:bg-teal-300 disabled:cursor-not-allowed flex items-center">
                                {loading ? <Spinner /> : 'Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreatePostForm;