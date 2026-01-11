import React, { useState } from "react";
import CollectorSidebar from "./CollectorSidebar";
import CollectorHeader from "./CollectorHeader";

export default function CollectorLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CollectorSidebar isOpen={isSidebarOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 pt-14">
        <CollectorHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
