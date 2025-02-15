"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { List, Calendar, Lock, ListTodo, LogIn, UserPlus } from "lucide-react";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <ListTodo className="h-20 w-20 text-blue-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Organize Your Tasks
              <span className="text-blue-600"> Effortlessly!</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              A simple and intuitive todo application to help you stay organized
              and productive.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/signin" className="flex items-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signup" className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <List className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Task Management
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Create, update, and organize your tasks with ease.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Due Dates</h3>
                <p className="mt-2 text-base text-gray-500">
                  Set due dates and never miss a deadline again.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Secure Access
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Your tasks are private and secure with user authentication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
