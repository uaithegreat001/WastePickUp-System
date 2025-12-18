import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import { adminService } from "../../services/adminService";
import { Icon } from "@iconify/react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    // Real-time listener
    const unsubscribe = adminService.subscribeToUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      (error) => {
        console.error("Subscription error:", error);
        setLoading(false); // Ensure loading stops even on error
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName &&
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
  );

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-md font-medium text-gray-900">
            Registered Users{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({users.length})
            </span>
          </h1>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    User
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Address
                  </th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 capitalize tracking-wider">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.id ? user.id.substring(0, 6) : "..."}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-600">
                            {user.email}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-500">
                        {user.address || "N/A"}
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-500">
                        {user.createdAt
                          ? `${new Date(
                              user.createdAt
                            ).toLocaleDateString()} ${new Date(
                              user.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
