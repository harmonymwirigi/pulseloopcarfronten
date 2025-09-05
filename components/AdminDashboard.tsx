import React, { useState, useEffect, useCallback } from 'react';
import { getPendingUsers, approveUser, getPendingResources, approveResource, getPendingBlogs, approveBlog } from '../services/mockApi';
import { User, Resource, Blog } from '../types';
import Spinner from './Spinner';
import ApprovalDetailView from './ApprovalDetailView';

type Tab = 'USERS' | 'RESOURCES' | 'BLOGS';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('USERS');
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [pendingResources, setPendingResources] = useState<Resource[]>([]);
    const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [viewingItem, setViewingItem] = useState<Resource | Blog | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const users = await getPendingUsers();
            setPendingUsers(users);
            const resources = await getPendingResources();
            setPendingResources(resources);
            const blogs = await getPendingBlogs();
            setPendingBlogs(blogs);
        } catch (err) {
            setError(`Failed to fetch pending items.`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (id: string, type: 'USER' | 'RESOURCE' | 'BLOG') => {
        setApprovingId(id);
        try {
            if (type === 'USER') {
                await approveUser(id);
                setPendingUsers(prev => prev.filter(item => item.id !== id));
            } else if (type === 'RESOURCE') {
                await approveResource(id);
                setPendingResources(prev => prev.filter(item => item.id !== id));
            } else if (type === 'BLOG') {
                await approveBlog(id);
                setPendingBlogs(prev => prev.filter(item => item.id !== id));
            }
            setViewingItem(null); // Return to list view after approval
        } catch (err) {
            setError(`Failed to approve item.`);
        } finally {
            setApprovingId(null);
        }
    };
    
    if (viewingItem) {
        return (
            <ApprovalDetailView
                item={viewingItem}
                onApprove={handleApprove}
                onBack={() => setViewingItem(null)}
                isApproving={approvingId === viewingItem.id}
            />
        );
    }
    
    const renderContent = () => {
        if (loading) return <div className="flex justify-center mt-8"><Spinner size="lg" color="teal" /></div>;
        if (error) return <p className="text-center text-red-500 mt-4">{error}</p>;

        switch(activeTab) {
            case 'USERS':
                return pendingUsers.length > 0 ? (
                    <UserTable users={pendingUsers} onApprove={handleApprove} approvingId={approvingId} />
                ) : <p className="text-gray-500 text-center py-8">No pending user approvals.</p>;
            case 'RESOURCES':
                 return pendingResources.length > 0 ? (
                    <ResourceTable resources={pendingResources} onView={setViewingItem} />
                ) : <p className="text-gray-500 text-center py-8">No pending resource approvals.</p>;
            case 'BLOGS':
                return pendingBlogs.length > 0 ? (
                    <BlogTable blogs={pendingBlogs} onView={setViewingItem} />
                ) : <p className="text-gray-500 text-center py-8">No pending blog approvals.</p>;
            default:
                return null;
        }
    }

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Admin Dashboard</h2>
            <div className="flex border-b mb-6">
                <TabButton title="Users" count={pendingUsers.length} activeTab={activeTab} onClick={() => setActiveTab('USERS')} />
                <TabButton title="Resources" count={pendingResources.length} activeTab={activeTab} onClick={() => setActiveTab('RESOURCES')} />
                <TabButton title="Blogs" count={pendingBlogs.length} activeTab={activeTab} onClick={() => setActiveTab('BLOGS')} />
            </div>
            {renderContent()}
        </div>
    );
};

const TabButton: React.FC<{title: string, count: number, activeTab: string, onClick: () => void}> = ({ title, count, activeTab, onClick }) => {
    const isActive = activeTab === title.toUpperCase();
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 py-2 px-4 font-medium text-sm ${isActive ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <span>{title}</span>
            {count > 0 && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
        </button>
    );
}

const UserTable: React.FC<{users: User[], onApprove: (id: string, type: 'USER') => void, approvingId: string | null}> = ({ users, onApprove, approvingId }) => (
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
                <td className="py-3 px-4"><ApproveButton id={user.id} onApprove={() => onApprove(user.id, 'USER')} approvingId={approvingId} /></td>
            </tr>
        ))}
    </TableWrapper>
);

const ResourceTable: React.FC<{resources: Resource[], onView: (resource: Resource) => void}> = ({ resources, onView }) => (
    <TableWrapper headers={["Author", "Title", "Type", "Status", "Action"]}>
        {resources.map(res => (
            <tr key={res.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{res.author.name}</td>
                <td className="py-3 px-4">{res.title}</td>
                <td className="py-3 px-4">{res.type}</td>
                <td className="py-3 px-4"><StatusBadge text={res.status} /></td>
                <td className="py-3 px-4"><ViewButton onView={() => onView(res)} /></td>
            </tr>
        ))}
    </TableWrapper>
);

const BlogTable: React.FC<{blogs: Blog[], onView: (blog: Blog) => void}> = ({ blogs, onView }) => (
     <TableWrapper headers={["Author", "Title", "Status", "Action"]}>
        {blogs.map(blog => (
            <tr key={blog.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{blog.author.name}</td>
                <td className="py-3 px-4">{blog.title}</td>
                <td className="py-3 px-4"><StatusBadge text={blog.status} /></td>
                <td className="py-3 px-4"><ViewButton onView={() => onView(blog)} /></td>
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

const ApproveButton: React.FC<{id: string, onApprove: () => void, approvingId: string | null}> = ({ id, onApprove, approvingId }) => (
    <button onClick={onApprove} disabled={approvingId === id} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:bg-green-300 flex items-center justify-center w-28">
        {approvingId === id ? <Spinner /> : 'Approve'}
    </button>
);

const ViewButton: React.FC<{onView: () => void}> = ({ onView }) => (
     <button onClick={onView} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-semibold">
        View & Approve
    </button>
);

const StatusBadge: React.FC<{text: string}> = ({ text }) => (
    <span className="bg-yellow-200 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{text}</span>
);

export default AdminDashboard;