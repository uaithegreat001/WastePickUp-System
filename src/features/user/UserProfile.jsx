import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import UserLayout from "./UserLayout";
import { Icon } from "@iconify/react";
import { userService } from "./userService";
import toast from "react-hot-toast";
import { FormInput } from "../../components/reusable/FormInput";

export default function UserProfile() {
  const { userData, currentUser } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    if (userData) {
      setProfileData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await userService.updateUserProfile(currentUser.uid, {
        fullName: profileData.fullName,
        phone: profileData.phone,
      });

      setIsEditing(false);
      toast.success("Profile Updated!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserLayout userName={profileData.fullName}>
      <div className="max-w-3xl space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your account settings and profile information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                {getInitials(profileData.fullName)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.fullName}
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
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                />
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Full Name
                  </label>
                  <p className="text-gray-700 font-medium">
                    {profileData.fullName}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-2">
                Email
              </label>
              <p className="text-gray-700 font-medium">{profileData.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              {isEditing ? (
                <FormInput
                  label="Phone Number"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">
                    Phone Number
                  </label>
                  <p className="text-gray-700 font-medium">
                    {profileData.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
