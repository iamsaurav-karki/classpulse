'use client';

import { useEffect, useState } from 'react';
import { subjectService, Subject } from '@/services/subject.service';
import toast from 'react-hot-toast';

interface SubjectFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  includeAll?: boolean;
  allLabel?: string;
}

export default function SubjectFilter({
  value,
  onChange,
  className = '',
  includeAll = true,
  allLabel = 'All Subjects',
}: SubjectFilterProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <select
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
    >
      {includeAll && <option value="">{allLabel}</option>}
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.name}>
          {subject.name} {subject.usageCount > 0 && `(${subject.usageCount})`}
        </option>
      ))}
    </select>
  );
}

