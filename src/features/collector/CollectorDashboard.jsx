import React, { useState, useEffect, useMemo } from "react";
import CollectorLayout from "./CollectorLayout";
import { Icon } from "@iconify/react";
import StatusBadge from "../../components/reusable/StatusBadge";
import MapComponent from "../../components/MapComponent";
import { useAuth } from "../auth/AuthContext";
import { collectorService } from "./collectorService";
import { PaystackButton } from "react-paystack";
import toast from "react-hot-toast";
import { formatDate } from "../../lib/dateUtils";

export default function CollectorDashboard() {
  const { userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentTask, setPaymentTask] = useState(null);
  const [completingTasks, setCompletingTasks] = useState(new Set());

  useEffect(() => {
    if (!userData?.fullName) return;

    setLoading(true);
    const unsubscribe = collectorService.subscribeToCollectorTasks(
      userData.fullName,
      (liveTasks) => {
        setTasks(liveTasks.filter((t) => t.status !== "collected"));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  const handleCollect = async (task) => {
    if (completingTasks.has(task.id)) return;

    if (
      task.paymentMethod === "onPickup" &&
      task.paymentStatus !== "verified"
    ) {
      setPaymentTask(task);
      toast.info("User must pay before collection can be completed");
      return;
    }

    setCompletingTasks((prev) => new Set(prev).add(task.id));
    try {
      await collectorService.completeTask(task.id);
      toast.success("Task completed successfully");
    } catch (error) {
      toast.error("Failed to complete task");
    } finally {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  const handlePaymentSuccess = async (reference) => {
    if (!paymentTask) return;
    setCompletingTasks((prev) => new Set(prev).add(paymentTask.id));
    try {
      await collectorService.completeTask(paymentTask.id, true);
      toast.success("Payment verified and task completed");
      setPaymentTask(null);
    } catch (error) {
      toast.error("Error updating task after payment");
    } finally {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(paymentTask.id);
        return newSet;
      });
    }
  };

  return (
    <CollectorLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage your assigned waste pickup schedules.
          </p>
        </div>

        <div className="border border-gray-200 bg-white rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Map View */}
            <div className="lg:col-span-2 p-0.5 rounded-xl border-2 border-gray-200 overflow-hidden relative min-h-[450px] z-10">
              <MapComponent tasks={tasks} />
            </div>

            {/* Task List */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Active Tasks</h3>
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onCollect={() => handleCollect(task)}
                      isActiveForPayment={paymentTask?.id === task.id}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentCancel={() => setPaymentTask(null)}
                      userData={userData}
                      isCompleting={completingTasks.has(task.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-sm">
                      No tasks assigned today
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollectorLayout>
  );
}

function TaskCard({
  task,
  onCollect,
  isActiveForPayment,
  onPaymentSuccess,
  onPaymentCancel,
  userData,
  isCompleting,
}) {
  const paystackConfig = useMemo(
    () => ({
      reference: `WP_COLL_${task.id}_${new Date().getTime()}`,
      email: task.userId + "@wastepickup.com", // Fallback email
      amount: (task.amount || 1000) * 100,
      publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    }),
    [task]
  );

  return (
    <div
      className={`p-4 rounded-xl border transition-all cursor-pointer group ${
        isActiveForPayment
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-gray-100 bg-gray-50 hover:border-primary/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <StatusBadge status={task.status} size="small" />
        <span className="text-[10px] font-bold text-gray-400 uppercase">
          {task.scheduledDate
            ? formatDate(task.scheduledDate, {
                dateStyle: "short",
                includeTime: true,
              })
            : "Anytime"}
        </span>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
            {task.userName || "Resident"}
          </h4>
          <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
            <Icon
              icon="hugeicons:location-01"
              className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
            />
            <span className="break-words">{task.location}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Amount
          </p>
          <p className="text-sm font-bold text-primary">
            ₦{(task.amount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {isActiveForPayment ? (
          <>
            <PaystackButton
              className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors"
              {...paystackConfig}
              text="Pay Now"
              onSuccess={onPaymentSuccess}
              onClose={onPaymentCancel}
            />
            <button
              onClick={onPaymentCancel}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-bold"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onCollect}
              disabled={isCompleting}
              className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? "Completing..." : "Mark Collected"}
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <Icon icon="hugeicons:navigation-01" className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
