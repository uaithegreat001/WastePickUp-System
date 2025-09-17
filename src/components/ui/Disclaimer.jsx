import React from "react";
import { Icon } from "@iconify/react";



export default function Disclaimer({ show, title, message, onClose, className }) {
  if (!show) return null;

  return (
    <div className={`w-full max-w-3xl shadow-sm justify-center items-center mb-4 mt-4 p-2 bg-blue-100  rounded-lg ${className || ''}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-2 text-gray-600 text-sm">
          <Icon 
            icon="hugeicons:information-circle"
            width="20"
            height="20"
            className="text-blue-500 mt-0.4 flex-shrink-0" 
          />
          <p className="text-gray-600 text-sm">
            <strong className="font-semibold">{title}</strong> {message || ""}
            
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 cursor-pointer"
          title="Hide disclaimer"
        >
          <Icon icon="hugeicons:cancel-01" width="20" height="20" />
        </button>
      </div>
    </div>
  );
}