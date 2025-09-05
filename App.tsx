import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Feed from './components/Feed';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import Resources from './components/Resources';
import Blogs from './components/Blogs';
import LandingPage from './components/LandingPage';
// FIX: Import shared View type to resolve conflict with Header component.
import { Post, Role, Resource, View, Blog } from './types';
import Spinner from './components/Spinner';
import SinglePostView from './components/SinglePostView';
import Chatbot from './components/Chatbot';
import SingleResourceView from './components/SingleResourceView';
import SingleBlogView from './components/SingleBlogView';
import ProfileCompletionBanner from './components/ProfileCompletionBanner';
import InviteModal from './components/InviteModal';
import Invitations from './components/Invitations';

// FIX: Removed local View type definition. The shared type is now imported from types.ts.

const AppContent: React.FC = () => {
    const { user, loading } = useAuth();
    const [currentView, setCurrentView] = useState<View>('FEED');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const navigateTo = (view: View) => {
        setCurrentView(view);
    };

    const navigateToPost = (post: Post) => {
        setSelectedPost(post);
        setCurrentView('SINGLE_POST');
    };

    const navigateToResource = (resource: Resource) => {
        setSelectedResource(resource);
        setCurrentView('SINGLE_RESOURCE');
    };

    const navigateToBlog = (blog: Blog) => {
        setSelectedBlog(blog);
        setCurrentView('SINGLE_BLOG');
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Spinner size="lg" color="teal"/>
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    const MainContent: React.FC = () => {
        switch (currentView) {
            case 'FEED': return <Feed navigateToPost={navigateToPost} />;
            case 'PROFILE': return <Profile />;
            case 'RESOURCES': return <Resources navigateToResource={navigateToResource} />;
            case 'BLOGS': return <Blogs navigateToBlog={navigateToBlog} />;
            case 'INVITATIONS': return <Invitations openInviteModal={() => setIsInviteModalOpen(true)} />;
            case 'SINGLE_POST': return selectedPost && <SinglePostView post={selectedPost} navigateTo={navigateTo} />;
            case 'SINGLE_RESOURCE': return selectedResource && <SingleResourceView resource={selectedResource} navigateTo={navigateTo} />;
            case 'SINGLE_BLOG': return selectedBlog && <SingleBlogView blog={selectedBlog} navigateTo={navigateTo} />;
            case 'ADMIN': 
                return user.role === Role.ADMIN 
                    ? <AdminDashboard /> 
                    : <p className="text-center text-red-500">Access Denied. You are not an admin.</p>;
            default: return <Feed navigateToPost={navigateToPost} />;
        }
    };

    const NavLink: React.FC<{ view?: View; label: string; icon: JSX.Element; onClick?: () => void }> = ({ view, label, icon, onClick }) => {
        const isCurrent = view && currentView === view;
        const action = onClick || (view ? () => navigateTo(view) : () => {});
        
        return (
            <button
                onClick={action}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left font-semibold transition-colors ${
                    isCurrent
                        ? 'bg-teal-500 text-white'
                        : 'text-gray-600 hover:bg-slate-200'
                }`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };


    return (
        <div className="min-h-screen bg-slate-100 font-sans text-gray-800">
            <Header navigateTo={navigateTo} currentView={currentView} />
            <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
            <main className="container mx-auto px-4 py-8">
                 {user && (user.profileCompletionPercentage ?? 0) < 100 && currentView !== 'PROFILE' && (
                    <ProfileCompletionBanner user={user} navigateTo={navigateTo} />
                )}
                {currentView === 'FEED' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Sidebar */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24 bg-white p-4 rounded-lg shadow-md space-y-2">
                                <NavLink view="FEED" label="Feed" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>} />
                                <NavLink view="RESOURCES" label="Resources" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h9" /></svg>} />
                                <NavLink view="BLOGS" label="Blogs" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
                                <NavLink view="INVITATIONS" label="My Invitations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                                <NavLink label="Invite a Colleague" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} onClick={() => setIsInviteModalOpen(true)} />
                                {user.role === Role.ADMIN && <NavLink view="ADMIN" label="Admin Panel" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />}
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                           <MainContent />
                        </div>
                        
                        {/* Right Sidebar (Placeholder) */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24 bg-white p-4 rounded-lg shadow-md">
                                <h3 className="font-bold text-lg mb-4">Trending Topics</h3>
                                <p className="text-sm text-gray-500">Feature coming soon...</p>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <MainContent />
                )}
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
