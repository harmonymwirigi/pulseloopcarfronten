import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Feed from './components/Feed';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Resources from './components/Resources';
import Blogs from './components/Blogs';
import LandingPage from './components/LandingPage';
import { Post, Role } from './types';
import Spinner from './components/Spinner';
import SinglePostView from './components/SinglePostView';
import Chatbot from './components/Chatbot';

// FIX: Added 'LOGIN' and 'SIGNUP' to the View type to make it compatible with the Header component's navigateTo prop.
type View = 'FEED' | 'ADMIN' | 'PROFILE' | 'RESOURCES' | 'BLOGS' | 'SINGLE_POST' | 'LOGIN' | 'SIGNUP';

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState<View>('FEED');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const navigateTo = (view: View) => {
        setCurrentView(view);
    };

    const navigateToPost = (post: Post) => {
        setSelectedPost(post);
        setCurrentView('SINGLE_POST');
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Header navigateTo={navigateTo} />
            <main className="container mx-auto px-4 py-8">
                {currentView === 'FEED' && <Feed navigateToPost={navigateToPost} />}
                {currentView === 'PROFILE' && <Profile />}
                {currentView === 'RESOURCES' && <Resources />}
                {currentView === 'BLOGS' && <Blogs />}
                {currentView === 'SINGLE_POST' && selectedPost && <SinglePostView post={selectedPost} navigateTo={navigateTo} />}
                {currentView === 'ADMIN' && user.role === Role.ADMIN && <AdminDashboard />}
                {currentView === 'ADMIN' && user.role !== Role.ADMIN && <p className="text-center text-red-500">Access Denied. You are not an admin.</p>}
            </main>
            <Chatbot />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;