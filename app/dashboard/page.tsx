"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  Trash2,
  PlusCircle,
  Edit,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string | null;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: null as Date | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      if (!session?.user) {
        console.error("No user in session:", session);
        router.push("/auth/signin");
      }
      fetchTasks();
    }
  }, [status, router, session]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      const rawResponse = await res.text();
      console.log("Raw response:", rawResponse);

      if (!res.ok) {
        const errorData = rawResponse
          ? JSON.parse(rawResponse)
          : { message: "Failed to create task" };
        console.error("Error response:", errorData);
        throw new Error("Failed to create task");
      }

      const task = JSON.parse(rawResponse);
      setTasks([task, ...tasks]);
      setNewTask({ title: "", description: "", dueDate: null });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating task:", error.message);
      } else {
        console.error("Error creating task:", error);
      }
    }
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    const taskToUpdate = tasks.find((task) => task.id === taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToUpdate),
      });

      if (!res.ok) throw new Error("Failed to update task");

      toast({
        title: "Task updated!",
        description: "Your task has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Create a New Task</h1>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <div className="flex items-center justify-between space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTask.dueDate ? (
                      format(newTask.dueDate, "PPP")
                    ) : (
                      <span>Pick a due date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate || undefined}
                    onSelect={(date) =>
                      setNewTask({ ...newTask, dueDate: date || null })
                    }
                    disabled={{ before: startOfDay(new Date()) }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="submit"
                className="flex-shrink-0"
                disabled={!newTask.title || !newTask.dueDate}
                onClick={() => {
                  toast({
                    title: "Task added!",
                    description: "Your task has been added successfully.",
                  });
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </form>
        </div>
        <ScrollArea className="h-[480px] w-[896px] rounded-md border p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              tasks.map((task) => (
                <Card
                  key={task.id}
                  className={`transition-all duration-300 ${
                    task.completed
                      ? "bg-gray-100 border-l-4 border-blue-500 opacity-70"
                      : "bg-white"
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center h-full">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) => {
                            handleToggleComplete(task.id, checked as boolean);
                            if (checked) {
                              toast({
                                title: "Task completed!",
                                description:
                                  "Great job on completing your task! 🎉",
                              });
                            } else {
                              toast({
                                title: "Task marked as incomplete!",
                                description:
                                  "Don't worry, you can always get back to it! 🚀",
                              });
                            }
                          }}
                        />
                      </div>

                      <div>
                        <h3
                          className={`font-medium ${
                            task.completed ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                        )}
                        {task.dueDate && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span>
                              Due: {format(new Date(task.dueDate), "PPP")}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              {isBefore(
                                startOfDay(new Date(task.dueDate)),
                                startOfDay(new Date())
                              )
                                ? "Overdue"
                                : `Remaining: ${formatDistanceToNow(
                                    new Date(task.dueDate),
                                    {
                                      addSuffix: false,
                                    }
                                  )}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this task? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleDeleteTask(task.id);
                                toast({
                                  title: "Task deleted!",
                                  description:
                                    "Your task has been deleted successfully.",
                                });
                              }}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Edit Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Make changes to your task below.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <form
                            onSubmit={(e) => handleEditTask(e, task.id)}
                            className="space-y-4"
                          >
                            <Input
                              placeholder="Task title"
                              value={task.title}
                              onChange={(e) =>
                                setTasks(
                                  tasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, title: e.target.value }
                                      : t
                                  )
                                )
                              }
                              required
                            />
                            <Textarea
                              placeholder="Task description (optional)"
                              value={task.description}
                              onChange={(e) =>
                                setTasks(
                                  tasks.map((t) =>
                                    t.id === task.id
                                      ? { ...t, description: e.target.value }
                                      : t
                                  )
                                )
                              }
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {task.dueDate ? (
                                    format(new Date(task.dueDate), "PPP")
                                  ) : (
                                    <span>Pick a due date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    task.dueDate
                                      ? new Date(task.dueDate)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (
                                      date &&
                                      isBefore(
                                        startOfDay(date),
                                        startOfDay(new Date())
                                      )
                                    ) {
                                      alert("You cannot select a past date.");
                                      return;
                                    }

                                    setTasks(
                                      tasks.map((t) =>
                                        t.id === task.id
                                          ? {
                                              ...t,
                                              dueDate:
                                                date?.toISOString() || null,
                                            }
                                          : t
                                      )
                                    );
                                  }}
                                  disabled={{ before: startOfDay(new Date()) }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction type="submit">
                                Save
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No tasks yet. Create one to get started!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
