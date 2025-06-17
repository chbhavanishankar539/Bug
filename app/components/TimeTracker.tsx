'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  description: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface TimeTrackerProps {
  taskId: string;
}

export default function TimeTracker({ taskId }: TimeTrackerProps) {
  const { data: session } = useSession();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTimeEntries();
  }, [taskId]);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/time`);
      if (!response.ok) throw new Error('Failed to fetch time entries');
      const data = await response.json();
      setTimeEntries(data);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async () => {
    try {
      setError('');
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: new Date().toISOString(),
          description,
        }),
      });

      if (!response.ok) throw new Error('Failed to start time tracking');
      const data = await response.json();
      setCurrentEntry(data);
      setIsTracking(true);
      setDescription('');
      fetchTimeEntries();
    } catch (err) {
      console.error('Error starting time tracking:', err);
      setError('Failed to start time tracking');
    }
  };

  const stopTracking = async () => {
    if (!currentEntry) return;

    try {
      setError('');
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentEntry.id,
          endTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to stop time tracking');
      setCurrentEntry(null);
      setIsTracking(false);
      fetchTimeEntries();
    } catch (err) {
      console.error('Error stopping time tracking:', err);
      setError('Failed to stop time tracking');
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) return;

    try {
      setError('');
      const response = await fetch(`/api/tasks/${taskId}/time?id=${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete time entry');
      fetchTimeEntries();
    } catch (err) {
      console.error('Error deleting time entry:', err);
      setError('Failed to delete time entry');
    }
  };

  const formatDuration = (start: string, end: string | null) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="animate-pulse">Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      {/* Time Tracking Controls */}
      {session?.user?.role === 'DEVELOPER' && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Time Tracking</h3>
          {!isTracking ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="What are you working on?"
                />
              </div>
              <button
                onClick={startTracking}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Tracking
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Currently tracking time</span>
              </div>
              <button
                onClick={stopTracking}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Stop Tracking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Time Entries List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Time Entries</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {session?.user?.role === 'DEVELOPER' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(entry.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.endTime ? formatDateTime(entry.endTime) : 'In Progress'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(entry.startTime, entry.endTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.description || '-'}
                    </td>
                    {session?.user?.role === 'DEVELOPER' && entry.user.email === session.user.email && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 