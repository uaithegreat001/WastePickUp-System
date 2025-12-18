import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import UserLayout from "../../components/layouts/UserLayout";
import ServiceForm from "../../components/user/ServiceForm";
import { userService } from "../../services/userService";
import toast from "react-hot-toast";

export default function OrderBin() {
  const { userData, currentUser } = useAuth();

  const user = userData || { fullName: "User", email: "", phone: "" };

  const handleSubmit = async (formData) => {
    try {   
      const completeData = {
        ...formData,
        userName: user.fullName,
        userEmail: user.email,
        userPhone: user.phone,
        userId: currentUser?.uid || "",
      };

      await userService.createBinOrder(completeData);

      toast.success("Bin ordered successfully!");
    } catch (error) {
      console.error("Failed to submit bin order:", error);
      toast.error("Failed to submit order. Please try again.");
    }
  };

  return (
    <UserLayout userName={user.fullName}>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-md font-medium text-gray-900">Order Waste Bin</h1>
        </div>

        <ServiceForm type="order" onSubmit={handleSubmit} userData={user} />
      </div>
    </UserLayout>
  );
}
