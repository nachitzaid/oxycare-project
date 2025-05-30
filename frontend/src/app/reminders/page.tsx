"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ReminderManagement from "@/components/reminders/ReminderManagement";
import { useRouter } from "next/navigation";
import Spinner from "@/components/common/Spinner";
import { AlertCircle } from "lucide-react";

export default function RemindersPage() {
  const { user, isAuthenticated, isTechnician, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated() && isClient) {
      router.push("/login?redirect=/reminders");
    }
  }, [isAuthenticated, loading, router, isClient]);

  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Redirect handled by useEffect
  }

  if (!isTechnician()) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-500">
            Votre rôle ne permet pas d'accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-5">
          <ReminderManagement />
        </main>
      </div>
    </div>
  );
} 