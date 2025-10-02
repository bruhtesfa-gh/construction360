import React from "react";

export default function SuccessMessage({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-2">
      {message}
    </div>
  );
}
