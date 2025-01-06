import React from 'react';

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {message}
    </div>
  );
}

export function LoadingMessage({ isLoading }) {
  if (!isLoading) return null;
  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
      Đang khởi tạo kết nối video...
    </div>
  );
} 