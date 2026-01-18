import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../auth/AuthContext";
import UserLayout from "./UserLayout";
import { userService } from "./userService";

export default function Notifications() {
  const { userData, currentUser } = useAuth();
  const user = userData || { fullName: "User", email: "", phone: "" };
  const [notifications, setNotifications] = useState([]);
  const [visibleHighlights, setVisibleHighlights] = useState(new Set());

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifs);

      // Handle unread notifications
      const unreadIds = notifs
        .filter((n) => !(n.Read || n.read))
        .map((n) => n.id);
      if (unreadIds.length > 0) {
        setVisibleHighlights(new Set(unreadIds));
      }
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handle fade out highlights and mark as read after 5 seconds
  useEffect(() => {
    if (visibleHighlights.size > 0) {
      const timer = setTimeout(() => {
        setVisibleHighlights(new Set());
        // Persist read status to database 
        if (currentUser?.uid) {
          userService.markAllNotificationsAsRead(currentUser.uid);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visibleHighlights, currentUser?.uid]);

  return (
    <UserLayout userName={user.fullName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                You'll see your pickups and orders schedules notifications here
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const hasHighlight = visibleHighlights.has(notification.id);
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    hasHighlight
                      ? "ring-2 ring-gray-600 border-gray-600 bg-white"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {notification.Title || notification.title}
                      </h4>
                      <div
                        className="text-gray-600 mt-1"
                        dangerouslySetInnerHTML={{
                          __html: notification.message,
                        }}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(
                          notification.createdAt?.toDate?.() ||
                            notification.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </UserLayout>
  );
}
