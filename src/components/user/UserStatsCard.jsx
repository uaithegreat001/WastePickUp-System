import React from "react";
import { Icon } from "@iconify/react";

export default function UserStatsCard({ title, value, icon }) {
  return (
    <div className="bg-transparent border border-gray-200 rounded-xl p-5 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
          <Icon icon={icon} className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  );
}
