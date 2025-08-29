
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface HeaderProps {
    navigateTo: (view: 'FEED' | 'LOGIN' | 'SIGNUP' | 'ADMIN' | 'PROFILE' | 'RESOURCES' | 'BLOGS') => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo(user ? 'FEED' : 'LOGIN')}>
                     <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <h1 className="text-2xl font-bold text-teal-600">PulseLoopCare</h1>
                </div>
                <nav className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <button onClick={() => navigateTo('FEED')} className="text-gray-600 hover:text-teal-600 font-medium">Feed</button>
                            <button onClick={() => navigateTo('RESOURCES')} className="text-gray-600 hover:text-teal-600 font-medium">Resources</button>
                             <button onClick={() => navigateTo('BLOGS')} className="text-gray-600 hover:text-teal-600 font-medium">Blogs</button>
                            {user.role === Role.ADMIN && (
                                <button onClick={() => navigateTo('ADMIN')} className="text-gray-600 hover:text-teal-600 font-medium">Admin Panel</button>
                            )}
                            <div className="flex items-center space-x-3 ml-4">
                                <img 
                                    src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
                                    alt={user.name} 
                                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 cursor-pointer"
                                    onClick={() => navigateTo('PROFILE')}
                                />
                                <span className="font-medium hidden sm:block cursor-pointer" onClick={() => navigateTo('PROFILE')}>{user.name}</span>
                                <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Logout</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigateTo('LOGIN')} className="text-gray-600 hover:text-teal-600 font-medium">Login</button>
                            <button onClick={() => navigateTo('SIGNUP')} className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors">Sign Up</button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;