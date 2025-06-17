'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { CalendarIcon, ClockIcon, PaperClipIcon, TagIcon, BugAntIcon, CommandLineIcon, CloudIcon, ComputerDesktopIcon, GlobeAltIcon, DeviceTabletIcon, UserIcon } from '@heroicons/react/24/outline';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export default function NewTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    labels: '',
    attachments: [] as File[],
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    environment: '',
    browser: '',
    operatingSystem: '',
    device: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user?.role !== UserRole.MANAGER && session.user?.role !== UserRole.DEVELOPER) {
      router.push('/dashboard');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        const filteredUsers = data.filter((user: User) => 
          session.user?.role === UserRole.MANAGER ? true : user.role === UserRole.DEVELOPER
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creatorId: session?.user?.id,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      router.push('/tasks');
    } catch (err: any) {
      setError(err.message || 'Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        attachments: Array.from(e.target.files || []),
      }));
    }
  };

  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-6 h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
            <button
              onClick={() => router.push('/tasks')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Basic Information</h2>
              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 sr-only">Title *</label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm peer"
                    placeholder="Title *"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 peer-placeholder-shown:hidden"><BugAntIcon className="h-5 w-5" /></span>
                </div>

                <div className="relative">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 sr-only">Description *</label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm peer"
                    placeholder="Description *"
                  />
                  <span className="absolute left-3 top-3 text-gray-400 peer-placeholder-shown:hidden"><CommandLineIcon className="h-5 w-5" /></span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="relative">
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 sr-only">Priority *</label>
                    <select
                      id="priority"
                      required
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }))}
                      className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm appearance-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><TagIcon className="h-5 w-5" /></span>
                  </div>

                  <div className="relative">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 sr-only">Status *</label>
                    <select
                      id="status"
                      required
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'CLOSED' | 'REOPENED' }))}
                      className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm appearance-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="CLOSED">Closed</option>
                      <option value="REOPENED">Reopened</option>
                    </select>
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><BugAntIcon className="h-5 w-5" /></span>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 sr-only">Assignee</label>
                  <select
                    id="assignee"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                    className="mt-1 block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><UserIcon className="h-5 w-5" /></span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="relative">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 sr-only">Due Date</label>
                    <input
                      type="date"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><CalendarIcon className="h-5 w-5" /></span>
                  </div>

                  <div className="relative">
                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 sr-only">Estimated Hours</label>
                    <input
                      type="number"
                      id="estimatedHours"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      placeholder="Estimated Hours"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><ClockIcon className="h-5 w-5" /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Additional Details</h2>
              <div className="space-y-5">
                <div className="relative">
                  <label htmlFor="labels" className="block text-sm font-medium text-gray-700 sr-only">Labels (comma-separated)</label>
                  <input
                    type="text"
                    id="labels"
                    value={formData.labels}
                    onChange={(e) => setFormData(prev => ({ ...prev, labels: e.target.value }))}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="Labels (e.g., UI, Backend, Critical)"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><TagIcon className="h-5 w-5" /></span>
                </div>

                <div className="relative">
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 sr-only">Attachments</label>
                  <input
                    type="file"
                    id="attachments"
                    multiple
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><PaperClipIcon className="h-5 w-5" /></span>
                </div>
              </div>
            </div>

            {/* Bug Reproduction Steps (conditional for managers/developers) */}
            {(session?.user?.role === UserRole.MANAGER || session?.user?.role === UserRole.DEVELOPER) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Bug Reproduction Steps</h2>
                <div className="space-y-5">
                  <div className="relative">
                    <label htmlFor="stepsToReproduce" className="block text-sm font-medium text-gray-700 sr-only">Steps to Reproduce</label>
                    <textarea
                      id="stepsToReproduce"
                      rows={4}
                      value={formData.stepsToReproduce}
                      onChange={(e) => setFormData(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm peer"
                      placeholder="Detailed steps to reproduce the bug..."
                    />
                    <span className="absolute left-3 top-3 text-gray-400 peer-placeholder-shown:hidden"><CommandLineIcon className="h-5 w-5" /></span>
                  </div>

                  <div className="relative">
                    <label htmlFor="expectedBehavior" className="block text-sm font-medium text-gray-700 sr-only">Expected Behavior</label>
                    <textarea
                      id="expectedBehavior"
                      rows={3}
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm peer"
                      placeholder="What was expected to happen..."
                    />
                    <span className="absolute left-3 top-3 text-gray-400 peer-placeholder-shown:hidden"><CloudIcon className="h-5 w-5" /></span>
                  </div>

                  <div className="relative">
                    <label htmlFor="actualBehavior" className="block text-sm font-medium text-gray-700 sr-only">Actual Behavior</label>
                    <textarea
                      id="actualBehavior"
                      rows={3}
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm peer"
                      placeholder="What actually happened..."
                    />
                    <span className="absolute left-3 top-3 text-gray-400 peer-placeholder-shown:hidden"><BugAntIcon className="h-5 w-5" /></span>
                  </div>
                </div>
              </div>
            )}

            {/* Environment Details (conditional for managers/developers) */}
            {(session?.user?.role === UserRole.MANAGER || session?.user?.role === UserRole.DEVELOPER) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Environment Details</h2>
                <div className="space-y-5">
                  <div className="relative">
                    <label htmlFor="environment" className="block text-sm font-medium text-gray-700 sr-only">Environment</label>
                    <input
                      type="text"
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      placeholder="e.g., Production, Staging, Development"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><CloudIcon className="h-5 w-5" /></span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="relative">
                      <label htmlFor="browser" className="block text-sm font-medium text-gray-700 sr-only">Browser</label>
                      <input
                        type="text"
                        id="browser"
                        value={formData.browser}
                        onChange={(e) => setFormData(prev => ({ ...prev, browser: e.target.value }))}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="e.g., Chrome, Firefox, Safari"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><GlobeAltIcon className="h-5 w-5" /></span>
                    </div>

                    <div className="relative">
                      <label htmlFor="operatingSystem" className="block text-sm font-medium text-gray-700 sr-only">Operating System</label>
                      <input
                        type="text"
                        id="operatingSystem"
                        value={formData.operatingSystem}
                        onChange={(e) => setFormData(prev => ({ ...prev, operatingSystem: e.target.value }))}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="e.g., Windows, macOS, Linux"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><ComputerDesktopIcon className="h-5 w-5" /></span>
                    </div>

                    <div className="relative">
                      <label htmlFor="device" className="block text-sm font-medium text-gray-700 sr-only">Device</label>
                      <input
                        type="text"
                        id="device"
                        value={formData.device}
                        onChange={(e) => setFormData(prev => ({ ...prev, device: e.target.value }))}
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        placeholder="e.g., Desktop, Mobile, Tablet"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><DeviceTabletIcon className="h-5 w-5" /></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 