import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../auth/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useLocation } from "react-router-dom";
import StatusBadge from "../../components/reusable/StatusBadge";

export default function UserHeader({ toggleSidebar, userName = "User" }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const unread = querySnapshot.size > 0;
      setHasUnread(unread);
      if (!unread) setShowBadge(false);
      else if (location.pathname !== "/user/notifications") setShowBadge(true);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, location.pathname]);

  // Fade out badge after 5 seconds on notifications page
  useEffect(() => {
    if (location.pathname === "/user/notifications" && hasUnread) {
      const timer = setTimeout(() => setShowBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, hasUnread]);

  // getting initials of user name
  const getInitials = (name) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Truncate user name to 15 chars
  const getDisplayName = (name) => {
    if (name.length > 15) {
      return name.slice(0, 15) + "...";
    }
    return name;
  };

  return (
    <header className="fixed top-0 right-0 z-30 flex h-14 w-full lg:w-[calc(100%-16rem)] items-center justify-between bg-white px-6 border-b border-gray-200 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
        >
          <Icon icon="hugeicons:menu-01" className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/user/notifications"
          className="relative p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <Icon icon="hugeicons:notification-01" className="w-6 h-6" />
          {hasUnread && showBadge && (
            <div className="absolute top-0 right-2.5">
              <StatusBadge status="dot" />
            </div>
          )}
        </Link>
        <div className="border-l border-l-gray-300 h-10"></div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {getDisplayName(userName)}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {getInitials(userName)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
