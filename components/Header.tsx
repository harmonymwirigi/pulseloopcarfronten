import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import shared View type to resolve conflict.
import { Role, View } from '../types';

// FIX: Removed local View type definition. The shared type is now imported from types.ts.

interface HeaderProps {
    navigateTo: (view: View) => void;
    currentView: View;
}

const Header: React.FC<HeaderProps> = ({ navigateTo, currentView }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const NavButton: React.FC<{ view: View; children: React.ReactNode }> = ({ view, children }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => navigateTo(view)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-teal-500 text-white'
                        : 'text-gray-600 hover:bg-slate-100'
                }`}
            >
                {children}
            </button>
        );
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo(user ? 'FEED' : 'LOGIN')}>
                     <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <h1 className="text-2xl font-bold text-teal-600">PulseLoopCare</h1>
                </div>
                <nav className="flex items-center space-x-2">
                    {user ? (
                        <>
                            <div className="hidden md:flex items-center space-x-2">
                                <NavButton view="FEED">Feed</NavButton>
                                <NavButton view="RESOURCES">Resources</NavButton>
                                <NavButton view="BLOGS">Blogs</NavButton>
                                {user.role === Role.ADMIN && <NavButton view="ADMIN">Admin Panel</NavButton>}
                            </div>
                            
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2 ml-4 cursor-pointer">
                                    <img 
                                        src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
                                        alt={user.name} 
                                        className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                                    />
                                    <span className="font-medium hidden sm:block">{user.name}</span>
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30">
                                        <a onClick={() => { navigateTo('PROFILE'); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 cursor-pointer">My Profile</a>
                                        <a onClick={() => { logout(); setIsDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 cursor-pointer">Logout</a>
                                    </div>
                                )}
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