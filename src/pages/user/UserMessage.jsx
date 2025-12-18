import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../components/layouts/UserLayout";
import { Icon } from "@iconify/react";
import { userService } from "../../services/userService";
import { FormInput, FormTextarea } from "../../components/reusable/FormInput";
import toast from "react-hot-toast";

export default function UserMessage() {
  const { userData, currentUser } = useAuth();
  const user = userData || {
    fullName: "User",
    email: "",
    phone: "",
  };

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Message is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await userService.createSupportTicket({
        ...formData,
        userId: currentUser?.uid || "",
        userEmail: user.email,
        userName: user.fullName,
      });

      setFormData({ subject: "", message: "" });
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <UserLayout userName={user.fullName}>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-md font-medium text-gray-900">Send Message</h1>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Subject"
              value={formData.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              error={errors.subject}
              placeholder="Description of your issue"
              required
            />

            <FormTextarea
              label="Message"
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              error={errors.message}
              placeholder="Describe your issue in detail..."
              rows={5}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={
                  submitting ||
                  !formData.subject.trim() ||
                  !formData.message.trim()
                }
                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserLayout>
  );
}
