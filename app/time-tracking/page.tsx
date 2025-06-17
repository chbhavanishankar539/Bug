'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Task, TimeEntry } from '@prisma/client';
import { format, differenceInMinutes } from 'date-fns';

interface TaskWithTimeEntries extends Task {
  timeEntries: TimeEntry[];
}

export default function TimeTrackingPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskWithTimeEntries[]>([]);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [selectedTask, setSelectedTask] = useState<string>('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);

  const startTimeTracking = async (taskId: string) => {
    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          startTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to start time tracking');

      const timeEntry = await response.json();
      setActiveTimeEntry(timeEntry);
      setSelectedTask(taskId);
    } catch (error) {
      console.error('Error starting time tracking:', error);
    }
  };

  const stopTimeTracking = async () => {
    if (!activeTimeEntry) return;

    try {
      const response = await fetch(`/api/time-entries/${activeTimeEntry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to stop time tracking');

      const updatedTimeEntry = await response.json();
      setActiveTimeEntry(null);
      setSelectedTask('');

      // Update the task's time entries
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTimeEntry.taskId
            ? {
                ...task,
                timeEntries: [
                  ...task.timeEntries.filter((te) => te.id !== updatedTimeEntry.id),
                  updatedTimeEntry,
                ],
              }
            : task
        )
      );
    } catch (error) {
      console.error('Error stopping time tracking:', error);
    }
  };

  const calculateTotalTime = (timeEntries: TimeEntry[]) => {
    return timeEntries.reduce((total, entry) => {
      if (entry.endTime) {
        return total + differenceInMinutes(new Date(entry.endTime), new Date(entry.startTime));
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Time Tracking</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Task
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Total Time
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => {
                      const totalMinutes = calculateTotalTime(task.timeEntries);
                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;

                      return (
                        <tr key={task.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {task.title}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {task.status}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {`${hours}h ${minutes}m`}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            {activeTimeEntry && activeTimeEntry.taskId === task.id ? (
                              <button
                                onClick={stopTimeTracking}
                                className="text-red-600 hover:text-red-900"
                              >
                                Stop
                              </button>
                            ) : (
                              <button
                                onClick={() => startTimeTracking(task.id)}
                                disabled={!!activeTimeEntry}
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Start
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTimeEntry && (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
          <div className="max-w-screen-xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
              <div className="flex items-center justify-between flex-wrap">
                <div className="w-0 flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-indigo-800">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <p className="ml-3 font-medium text-white truncate">
                    <span className="md:hidden">Time tracking in progress</span>
                    <span className="hidden md:inline">
                      Time tracking in progress for task: {tasks.find((t) => t.id === activeTimeEntry.taskId)?.title}
                    </span>
                  </p>
                </div>
                <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                  <button
                    onClick={stopTimeTracking}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    Stop tracking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 