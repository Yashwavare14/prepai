// Shared queries for admin pages
export const fetchExams = async () => {
  const res = await fetch('/api/filters/exams');
  if (!res.ok) {
    throw new Error('Failed to load exams');
  }
  return res.json();
};

export const fetchTopics = async ({ queryKey }) => {
  const [, exam] = queryKey;
  const res = await fetch(`/api/filters/topics?exam=${encodeURIComponent(exam)}`);
  if (!res.ok) {
    throw new Error('Failed to load topics');
  }
  return res.json();
};

export const uploadPdf = async (formData) => {
  const res = await fetch('/api/admin/upload-pdf', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload PDF');
  }

  return data;
};

export const extractPdfSections = async (formData) => {
  const res = await fetch('/api/admin/upload-pdf/sections', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to extract sections from PDF');
  }

  return data;
};

export const saveExtractedQuestions = async (payload) => {
  const res = await fetch('/api/admin/upload-pdf/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save questions');
  }

  return data;
};
