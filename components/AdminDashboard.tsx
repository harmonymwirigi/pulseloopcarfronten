
import React, { useState, useEffect, useCallback } from 'react';
import { getPendingUsers, approveUser, getPendingResources, approveResource, getPendingBlogs, approveBlog } from '../services/mockApi';
import { User, Resource, Blog } from '../types';
import Spinner from './Spinner';

type Tab = 'USERS' | 'RESOURCES' | 'BLOGS';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('USERS');
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [pendingResources, setPendingResources] = useState<Resource[]>([]);
    const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'USERS') {
                const users = await getPendingUsers();
                setPendingUsers(users);
            } else if (activeTab === 'RESOURCES') {
                const resources = await getPendingResources();
                setPendingResources(resources);
            } else if (activeTab === 'BLOGS') {
                const blogs = await getPendingBlogs();
                setPendingBlogs(blogs);
            }
        } catch (err) {
            setError(`Failed to fetch pending ${activeTab.toLowerCase()}.`);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        try {
            if (activeTab === 'USERS') {
                await approveUser(id);
                setPendingUsers(prev => prev.filter(item => item.id !== id));
            } else if (activeTab === 'RESOURCES') {
                await approveResource(id);
                setPendingResources(prev => prev.filter(item => item.id !== id));
            } else if (activeTab === 'BLOGS') {
                await approveBlog(id);
                setPendingBlogs(prev => prev.filter(item => item.id !== id));
            }
        } catch (err) {
            setError(`Failed to approve ${activeTab.slice(0, -1).toLowerCase()}.`);
        } finally {
            setApprovingId(null);
        }
    };
    
    const renderContent = () => {
        if (loading) return <div className="flex justify-center mt-8"><Spinner size="lg" /></div>;
        if (error) return <p className="text-center text-red-500 mt-4">{error}</p>;

        switch(activeTab) {
            case 'USERS':
                return pendingUsers.length > 0 ? (
                    <UserTable users={pendingUsers} onApprove={handleApprove} approvingId={approvingId} />
                ) : <p className="text-gray-500 text-center py-8">No pending user approvals.</p>;
            case 'RESOURCES':
                 return pendingResources.length > 0 ? (
                    <ResourceTable resources={pendingResources} onApprove={handleApprove} approvingId={approvingId} />
                ) : <p className="text-gray-500 text-center py-8">No pending resource approvals.</p>;
            case 'BLOGS':
                return pendingBlogs.length > 0 ? (
                    <BlogTable blogs={pendingBlogs} onApprove={handleApprove} approvingId={approvingId} />
                ) : <p className="text-gray-500 text-center py-8">No pending blog approvals.</p>;
            default:
                return null;
        }
    }

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Admin Dashboard</h2>
            <div className="flex border-b mb-6">
                <TabButton title="Users" activeTab={activeTab} onClick={() => setActiveTab('USERS')} />
                <TabButton title="Resources" activeTab={activeTab} onClick={() => setActiveTab('RESOURCES')} />
                <TabButton title="Blogs" activeTab={activeTab} onClick={() => setActiveTab('BLOGS')} />
            </div>
            {renderContent()}
        </div>
    );
};

const TabButton: React.FC<{title: string, activeTab: string, onClick: () => void}> = ({ title, activeTab, onClick }) => {
    const isActive = activeTab === title.toUpperCase();
    return (
        <button
            onClick={onClick}
            className={`py-2 px-4 font-medium text-sm ${isActive ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            {title}
        </button>
    );
}

const UserTable: React.FC<{users: User[], onApprove: (id: string) => void, approvingId: string | null}> = ({ users, onApprove, approvingId }) => (
    <TableWrapper headers={["User", "Email", "Status", "Action"]}>
        {users.map(user => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                    <div className="flex items-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                        <span>{user.name}</span>
                    </div>
                </td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4"><StatusBadge text={user.role} /></td>
                <td className="py-3 px-4"><ApproveButton id={user.id} onApprove={onApprove} approvingId={approvingId} /></td>
            </tr>
        ))}
    </TableWrapper>
);

const ResourceTable: React.FC<{resources: Resource[], onApprove: (id: string) => void, approvingId: string | null}> = ({ resources, onApprove, approvingId }) => (
    <TableWrapper headers={["Author", "Title", "Type", "Status", "Action"]}>
        {resources.map(res => (
            <tr key={res.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{res.author.name}</td>
                <td className="py-3 px-4">{res.title}</td>
                <td className="py-3 px-4">{res.type}</td>
                <td className="py-3 px-4"><StatusBadge text={res.status} /></td>
                <td className="py-3 px-4"><ApproveButton id={res.id} onApprove={onApprove} approvingId={approvingId} /></td>
            </tr>
        ))}
    </TableWrapper>
);

const BlogTable: React.FC<{blogs: Blog[], onApprove: (id: string) => void, approvingId: string | null}> = ({ blogs, onApprove, approvingId }) => (
     <TableWrapper headers={["Author", "Title", "Status", "Action"]}>
        {blogs.map(blog => (
            <tr key={blog.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{blog.author.name}</td>
                <td className="py-3 px-4">{blog.title}</td>
                <td className="py-3 px-4"><StatusBadge text={blog.status} /></td>
                <td className="py-3 px-4"><ApproveButton id={blog.id} onApprove={onApprove} approvingId={approvingId} /></td>
            </tr>
        ))}
    </TableWrapper>
);

const TableWrapper: React.FC<{headers: string[], children: React.ReactNode}> = ({ headers, children }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
                <tr>
                    {headers.map(h => <th key={h} className="text-left py-3 px-4 font-semibold text-sm text-gray-600 uppercase tracking-wider">{h}</th>)}
                </tr>
            </thead>
            <tbody className="text-gray-700">{children}</tbody>
        </table>
    </div>
);

const ApproveButton: React.FC<{id: string, onApprove: (id: string) => void, approvingId: string | null}> = ({ id, onApprove, approvingId }) => (
    <button onClick={() => onApprove(id)} disabled={approvingId === id} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 flex items-center justify-center w-28">
        {approvingId === id ? <Spinner /> : 'Approve'}
    </button>
);

const StatusBadge: React.FC<{text: string}> = ({ text }) => (
    <span className="bg-yellow-200 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{text}</span>
);

export default AdminDashboard;
