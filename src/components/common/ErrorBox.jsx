import React from "react";
import { Icon } from "@iconify/react";

// Error notification box - matches SuccessBox style
export default function ErrorBox({ show, message, onClose }) {
  if (!show) return null;

  // Auto-close if onClose is provided
  React.useEffect(() => {
    if (show && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        {/* Error content */}
        <div className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Icon
              icon="hugeicons:alert-circle"
              className="w-10 h-10 text-red-600"
            />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900">Error!</h2>

          {/* Message */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {message || "Something went wrong. Please try again."}
          </p>

          {/* Close Button (optional) */}
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
