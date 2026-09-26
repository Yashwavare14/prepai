// Shared queries and mutations for student pages
export const fetchStudentProfile = async () => {
  const res = await fetch('/api/student/profile');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch student profile');
  }
  return res.json();
};

export const saveStudentProfile = async (payload) => {
  const res = await fetch('/api/student/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save student profile');
  }

  return data;
};
