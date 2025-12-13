import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { adminService } from "../../services/adminService";
import { Icon } from "@iconify/react";
import SuccessBox from "../../components/common/SuccessBox";
import axios from "axios";

export default function UsersMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await adminService.getSupportTickets();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMessages(sorted);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setReplyText("");
    } else {
      setExpandedId(id);
      setReplyText("");
    }
  };

  const handleReply = async (e, msg) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      await axios.post("http://localhost:3000/reply-message", {
        id: msg.id,
        reply: replyText,
        userEmail: msg.email,
      });

      setShowSuccess(true);
      setReplyText("");
      setExpandedId(null);
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply. Please ensure backend is accessible.");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.subject &&
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.email &&
        msg.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (msg.message &&
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Support Messages">
      <div className="space-y-6 max-w-5xl mx-auto">
        <SuccessBox
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Reply Sent"
          message="The user has been notified via email."
        />

        <h1 className="text-md font-medium text-gray-900">
          Messages{" "}
          <span className="text-gray-400 text-sm font-normal ml-2">
            ({messages.length})
          </span>
        </h1>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Icon
                icon="hugeicons:mail-02"
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
              />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isExpanded = expandedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`bg-white rounded-xl border-gray-200 border  transition-all duration-300 overflow-hidden ${
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
                            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            className={`text-xs font-medium transition-colors ${
                              isExpanded
                                ? "text-gray-600"
                                : "text-primary hover:text-primary-hover"
                            }`}
                          >
                            Read more
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{msg.email}</p>

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
                        <h4 className="text-sm font-medium text-gray-500  tracking-wider mb-2">
                          Message
                        </h4>
                        <p className="text-gray-800 text-sm leading-relaxed bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          {msg.message}
                        </p>

                        {msg.adminResponse && (
                          <div className="mt-4 ml-6">
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Icon icon="hugeicons:arrow-right-01" /> Previous
                              Reply
                            </h4>
                            <p className="text-blue-900 text-sm bg-blue-50 p-4 rounded-lg border border-blue-100">
                              {msg.adminResponse}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">
                            Reply to {msg.email}
                          </h4>
                          <form onSubmit={(e) => handleReply(e, msg)}>
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your response here..."
                              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-3 bg-white"
                            ></textarea>
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => toggleExpand(msg.id)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={sendingReply || !replyText.trim()}
                                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                              >
                                {sendingReply ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    Send Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
