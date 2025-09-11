import React from "react";
import { Icon } from "@iconify/react";

// ✅ Reusable Success Popup Component (Responsive, Smooth Slide Animation)
export default function SuccessPopup({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 ">
      <div
        className="
          bg-gray-50 rounded-lg border border-gray-300 px-6 py-5 flex flex-col items-center 
          w-11/12 max-w-sm sm:max-w-xs
          transform transition-all duration-500 ease-out
          animate-slideDown
        "
      >
        {/* Success Icon (Iconify) */}
        <Icon
          icon="mdi:check-circle-outline"
          className="w-12 h-12 sm:w-10 sm:h-10 text-green-500 mb-3"
        />

        {/* Success Text */}
        <h3 className="text-base sm:text-lg font-semibold text-green-500 mb-2">
          Success!
        </h3>
        <p className="text-gray-600 text-center text-sm sm:text-base">
          {message || "Operation completed successfully!"}
        </p>
      </div>
    </div>
  );
}
