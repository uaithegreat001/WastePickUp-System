import React from "react";

// ✅ Reusable Spinner Component (Responsive)
export default function Spinner({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center justify-center bg-gray-50   rounded-lg  px-6 py-5 w-11/12 max-w-sm sm:max-w-xs">
        {/* Circular Spinner */}
        <span className="inline-block w-12 h-12 sm:w-10 sm:h-10 border-4 border-[rgb(36,157,119)] border-t-transparent rounded-full animate-spin mb-3"></span>
        <p className="text-gray-600 text-center text-sm sm:text-base">
          {message || "Processing..."}
        </p>
      </div>
    </div>
  );
}
