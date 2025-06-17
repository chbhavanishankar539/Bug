'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Task type
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'CLOSED' | 'REOPENED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string | null;
  assignee: { name: string; email: string };
  creator: { name: string; email: string };
  createdAt: string;
}

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING_APPROVAL: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-green-100 text-green-800',
  REOPENED: 'bg-red-100 text-red-800',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, filter]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/tasks';
      if (session?.user?.role === 'MANAGER') {
        if (filter === 'OPEN') url += '?status=OPEN';
        else if (filter === 'CLOSED') url += '?status=CLOSED';
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      let data: Task[] = await res.json();
      if (session?.user?.role === 'DEVELOPER') {
        data = data.filter(task => task.assignee.email === session.user.email);
      }
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const generateTrendData = () => {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayTasks = tasks.filter(task => {
          const taskDate = new Date(task.createdAt);
          return taskDate.toDateString() === date.toDateString();
        });
        
        data.push({
          date: format(date, 'MMM dd'),
          tasks: dayTasks.length,
        });
      }
      return data;
    };

    setTrendData(generateTrendData());
  }, [tasks]);

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'OPEN').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tasks.filter(t => t.status === 'CLOSED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showFilters && session?.user?.role === 'MANAGER' && (
          <div className="mb-6 flex gap-2 p-4 bg-gray-50 rounded-lg shadow-sm">
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ALL' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('ALL')}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'OPEN' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('OPEN')}
            >
              Open
            </button>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'CLOSED' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter('CLOSED')}
            >
              Closed
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-500">Open Tasks</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 transform hover:scale-105 transition-transform duration-200">
            <h3 className="text-sm font-medium text-gray-500">Closed Tasks</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">{stats.closed}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Task Trends</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area type="monotone" dataKey="tasks" stroke="#EF4444" fill="#FECACA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {task.assignee.name[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{task.assignee.name}</div>
                          <div className="text-sm text-gray-500">{task.assignee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.dueDate ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(task.dueDate), 'h:mm a')}
                          </div>
                        </div>
                      ) : (
                        'No due date'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No tasks found</div>
                      {searchQuery && (
                        <div className="mt-2 text-sm text-gray-400">
                          Try adjusting your search or filter criteria
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 