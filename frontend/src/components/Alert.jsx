import React from 'react';

const Alert = ({ type = 'info', message = '' }) => {
  if (!message) return null;

  const bgColor = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  }[type];

  return (
    <div
      className={`border-l-4 p-4 rounded mb-4 shadow-sm ${bgColor}`}
      role="alert"
    >
      <p className="font-semibold">
        {type === 'success' && '✅ Success'}
        {type === 'error' && '❌ Error'}
        {type === 'warning' && '⚠️ Warning'}
        {type === 'info' && 'ℹ️ Info'}
      </p>
      <p>{message}</p>
    </div>
  );
};

export default Alert;
