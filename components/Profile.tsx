
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

const Profile: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        // This should theoretically not be reached if navigation is set up correctly in App.tsx
        return <p className="text-center text-red-500">You must be logged in to view this page.</p>;
    }

    const getRoleBadgeClasses = (role: Role) => {
        switch (role) {
            case Role.ADMIN:
                return 'bg-purple-200 text-purple-800';
            case Role.NURSE:
                return 'bg-green-200 text-green-800';
            case Role.PENDING:
                return 'bg-yellow-200 text-yellow-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 self-start">My Profile</h2>
                <img
                    src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-teal-500 shadow-md"
                />
                <h3 className="text-2xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-500 mt-1 mb-4">{user.email}</p>
                <div>
                    <span className={`text-sm font-medium px-4 py-1 rounded-full ${getRoleBadgeClasses(user.role)}`}>
                        {user.role}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Profile;
