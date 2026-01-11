import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { adminService } from "./adminService";
import { Icon } from "@iconify/react";
import { formatDate } from "../../lib/dateUtils";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all registered users in the system.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            {user.fullName?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : user.role === "collector"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
