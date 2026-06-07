import React, { useState } from 'react';
import { TeamMember } from '../types';
import { api } from '../api/client';

interface Props {
  members: TeamMember[];
  onClose: () => void;
  onMembersChange: () => void;
}

export function TeamMembersPanel({ members, onClose, onMembersChange }: Props) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.addMember(newName.trim());
      setNewName('');
      onMembersChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remove ${name} from the team? Their chores will be unassigned.`)) return;
    try {
      await api.deleteMember(id);
      onMembersChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Team Members</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Add member form */}
        <form onSubmit={handleAdd} className="px-5 py-4 border-b dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Member</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !newName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </form>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {members.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-8">No team members yet.</p>
          ) : (
            <ul className="space-y-2">
              {members.map(member => (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{member.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
