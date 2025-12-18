import React, { useState } from "react";
import { Icon } from "@iconify/react";

// Displays user messages/support tickets with expandable content
export default function UserMessagesTable({ messages }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-500">No messages found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isExpanded = expandedId === msg.id;
        return (
          <div
            key={msg.id}
            className={`bg-white rounded-xl border-gray-200 border transition-all duration-300 overflow-hidden ${
              isExpanded
                ? "shadow-md ring-1 ring-primary/10"
                : "border-gray-200 shadow-sm hover:border-gray-300"
            }`}
          >
            <div
              className="p-5 flex items-start gap-4 cursor-pointer"
              onClick={() => toggleExpand(msg.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate pr-2">
                    {msg.subject || "No Subject"}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleDateString()
                        : new Date(msg.createdAt).toLocaleDateString()}{" "}
                      {msg.createdAt?.toDate
                        ? msg.createdAt.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                    <button
                      className={`text-xs font-medium transition-colors ${
                        isExpanded
                          ? "text-gray-600"
                          : "text-primary hover:text-primary-hover"
                      }`}
                    >
                      View More
                    </button>
                  </div>
                </div>
                {!isExpanded && (
                  <p className="text-sm text-gray-600 line-clamp-1 mt-2">
                    {msg.message}
                  </p>
                )}
              </div>
            </div>
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-500 tracking-wider mb-2">
                    Message
                  </h4>
                  <p className="text-gray-800 text-sm leading-relaxed bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    {msg.message}
                  </p>
                  {msg.adminResponse && (
                    <div className="mt-4 ml-6">
                      <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Icon icon="hugeicons:customer-support" /> Support
                        Response
                      </h4>
                      <p className="text-blue-900 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {msg.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
