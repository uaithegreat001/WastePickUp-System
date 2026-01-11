import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import AdminLayout from "./AdminLayout";
import { Icon } from "@iconify/react";
import { userService } from "../user/userService";
import { FormInput } from "../../components/reusable/FormInput";
import toast from "react-hot-toast";

export default function AdminProfile() {
  const auth = useAuth();
  const userData = auth?.userData;
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    fullName: "",
    email: "",
    phone: "",
    joinedDate: new Date(),
  });

  useEffect(() => {
    if (userData) {
      setAdminData({
        fullName: userData.fullName || "Admin User",
        email: userData.email || "",
        phone: userData.phone || "",
        joinedDate: userData.createdAt
          ? new Date(userData.createdAt)
          : new Date(),
      });
    }
  }, [userData]);

  const [isSaving, setIsSaving] = useState(false);

  // Helper to get initials (matches Header)
  const getInitials = (name) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSave = async () => {
    if (!auth?.currentUser?.uid) return;

    setIsSaving(true);
    try {
      await userService.updateUserProfile(auth.currentUser.uid, {
        fullName: adminData.fullName,
        phone: adminData.phone,
      });

      setIsEditing(false);
      toast.success("Changes Saved!");

      // Reload to refresh context
      window.location.reload();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage administrative account settings and system preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                {getInitials(adminData.fullName)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {adminData.fullName}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {isEditing ? (
                <FormInput
                  label="Full Name"
                  value={adminData.fullName}
                  onChange={(e) =>
                    setAdminData({ ...adminData, fullName: e.target.value })
                  }
                />
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Full Name
                  </label>
                  <p className="text-gray-700 font-medium">
                    {adminData.fullName}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-2">
                Email
              </label>
              <p className="text-gray-700 font-medium">{adminData.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              {isEditing ? (
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={adminData.phone}
                  onChange={(e) =>
                    setAdminData({ ...adminData, phone: e.target.value })
                  }
                />
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Phone Number
                  </label>
                  <p className="text-gray-700 font-medium">{adminData.phone}</p>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
