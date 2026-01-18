import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import UserLayout from "./UserLayout";
import ServiceForm from "./ServiceForm";
import { userService } from "./userService";
import { handleError } from "../../lib/errorHandler";
import { useNetwork } from "../../hooks/useNetwork";
import toast from "react-hot-toast";

export default function RequestPickup() {
  const { userData, currentUser } = useAuth();
  const { isOnline } = useNetwork();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = userData || {
    fullName: "User",
    email: "",
    phone: "",
  };

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    if (!currentUser?.uid) {
      handleError(
        new Error("User not authenticated"),
        "Pickup Request Submission",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const completeData = {
        ...formData,
        userName: user.fullName,
        userEmail: user.email,
        userPhone: user.phone,
        userId: currentUser.uid,
      };

      const result = await userService.createPickupRequest(completeData);

      if (result.offline) {
        toast.success(
          "Request saved offline. It will sync when you're back online",
          {
            duration: 5000,
          },
        );
      } else {
        toast.success("Pickup requested successfully");
      }
    } catch (error) {
      handleError(error, "Pickup Request Submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout userName={user.fullName}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Request Pickup</h1>
          <p className="text-gray-500 text-sm mt-1">
            Please fill in correct information for proper collection.
          </p>
        </div>

        <ServiceForm type="pickup" onSubmit={handleSubmit} userData={user} />
      </div>
    </UserLayout>
  );
}
