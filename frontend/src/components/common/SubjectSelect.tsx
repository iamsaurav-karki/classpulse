'use client';

import { useEffect, useState } from 'react';
import { subjectService, Subject } from '@/services/subject.service';
import { FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SubjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function SubjectSelect({
  value,
  onChange,
  placeholder = 'Select or add a subject',
  className = '',
  required = false,
}: SubjectSelectProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name cannot be empty');
      return;
    }

    if (newSubjectName.trim().length < 2) {
      toast.error('Subject name must be at least 2 characters');
      return;
    }

    if (newSubjectName.trim().length > 100) {
      toast.error('Subject name must be less than 100 characters');
      return;
    }

    try {
      setIsCreating(true);
      const newSubject = await subjectService.createSubject(newSubjectName.trim());
      setSubjects((prev) => [newSubject, ...prev].sort((a, b) => 
        b.usageCount - a.usageCount || a.name.localeCompare(b.name)
      ));
      onChange(newSubject.name);
      setNewSubjectName('');
      setShowAddNew(false);
      toast.success(`Subject "${newSubject.name}" created successfully`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create subject';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '__add_new__') {
      setShowAddNew(true);
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={handleSelectChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
          required={required}
          disabled={loading}
        >
          <option value="">{placeholder}</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.name}>
              {subject.name} {subject.usageCount > 0 && `(${subject.usageCount})`}
            </option>
          ))}
          <option value="__add_new__" className="text-green-600 font-semibold">
            + Add New Subject
          </option>
        </select>
      </div>

      {showAddNew && (
        <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-800">
              New Subject Name
            </label>
            <button
              onClick={() => {
                setShowAddNew(false);
                setNewSubjectName('');
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateSubject()}
              placeholder="Enter subject name (e.g., Physics, Chemistry)"
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
              maxLength={100}
              disabled={isCreating}
            />
            <button
              onClick={handleCreateSubject}
              disabled={isCreating || !newSubjectName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Subject name can contain letters, numbers, spaces, hyphens, underscores, and ampersands
          </p>
        </div>
      )}
    </div>
  );
}

