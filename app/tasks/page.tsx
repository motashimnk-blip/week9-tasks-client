"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";

type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  due_date?: string | null;
  createdAt?: string;
  created_at?: string;

  project?: {
    id: number;
    name: string;
  } | null;

  assignee?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

type CreateTaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  projectId: number;
};

export default function TasksPage() {
  const router = useRouter();

  const {
    token,
    user,
    loading: authLoading,
    signOut,
  } = useAuth();

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<TaskStatus>("todo");

  const [priority, setPriority] =
    useState(1);

  const [projectId, setProjectId] =
    useState(1);

  /*
   * Protect the tasks page.
   */
  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token, router]);

  async function loadTasks() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = statusFilter
        ? `?status=${encodeURIComponent(
            statusFilter,
          )}`
        : "";

      const data =
        await api<Task[]>(
          `/tasks${query}`,
        );

      setTasks(data);
    } catch (err) {
      if (err instanceof ApiError) {
        /*
         * 401 is handled centrally by api.ts.
         * Other errors are displayed here.
         */
        if (err.status !== 401) {
          setError(err.message);
        }
      } else {
        setError(
          "Failed to load tasks.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && token) {
      loadTasks();
    }
  }, [
    authLoading,
    token,
    statusFilter,
  ]);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setError(
        "Description is required.",
      );
      return;
    }

    if (
      priority < 1 ||
      priority > 5
    ) {
      setError(
        "Priority must be between 1 and 5.",
      );
      return;
    }

    if (projectId < 1) {
      setError(
        "Project ID must be at least 1.",
      );
      return;
    }

    setCreating(true);
    setError("");

    const newTask: CreateTaskInput = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId,
    };

    try {
      await api<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify(newTask),
      });

      /*
       * Clear the form only after successful creation.
       */
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority(1);
      setProjectId(1);

      await loadTasks();
    } catch (err) {
      /*
       * Keep all form values when creation fails.
       * This is required for validation/error handling.
       */
      if (err instanceof ApiError) {
        if (err.status !== 401) {
          setError(
            err.messages.length > 0
              ? err.messages.join(", ")
              : err.message,
          );
        }
      } else {
        setError(
          "Failed to create task.",
        );
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(
    id: number,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");

    try {
      await api<void>(
        `/tasks/${id}`,
        {
          method: "DELETE",
        },
      );

      setTasks((current) =>
        current.filter(
          (task) => task.id !== id,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status !== 401) {
          setError(err.message);
        }
      } else {
        setError(
          "Failed to delete task.",
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  /*
   * While restoring the saved session,
   * don't render protected content yet.
   */
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Checking session...
        </p>
      </main>
    );
  }

  /*
   * Prevent a brief flash of the tasks page
   * before the redirect happens.
   */
  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Tasks
            </h1>

            <p className="text-sm text-gray-600">
              {user?.email
                ? `Signed in as ${user.email}`
                : "Manage your tasks"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Create Task
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Add a new task to your project.
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter task title"
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value,
                  )
                }
                placeholder="Enter task description"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as TaskStatus,
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="todo">
                  Todo
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="done">
                  Done
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Priority
              </label>

              <input
                type="number"
                min={1}
                max={5}
                value={priority}
                onChange={(e) =>
                  setPriority(
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Project ID
              </label>

              <input
                type="number"
                min={1}
                value={projectId}
                onChange={(e) =>
                  setProjectId(
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create Task"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">
                Tasks
              </h2>

              <p className="text-sm text-gray-600">
                {tasks.length} task
                {tasks.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div>
              <label className="mr-2 text-sm font-medium">
                Filter:
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value,
                  )
                }
                className="rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">
                  All
                </option>

                <option value="todo">
                  Todo
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="done">
                  Done
                </option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="py-10 text-center text-gray-600">
              Loading tasks...
            </div>
          )}

          {!loading &&
            !error &&
            tasks.length === 0 && (
              <div className="rounded-md border border-dashed border-gray-300 py-10 text-center">
                <h3 className="font-semibold">
                  No tasks found
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  Create a task or change
                  the filter.
                </p>
              </div>
            )}

          {!loading &&
            tasks.length > 0 && (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {task.title}
                          </h3>

                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                            {task.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {task.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>
                            Priority:{" "}
                            {task.priority}
                          </span>

                          {task.project && (
                            <span>
                              Project:{" "}
                              {
                                task.project
                                  .name
                              }
                            </span>
                          )}

                          {task.assignee && (
                            <span>
                              Assignee:{" "}
                              {task.assignee
                                .name ??
                                task.assignee
                                  .email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              task.id,
                            )
                          }
                          disabled={
                            deletingId ===
                            task.id
                          }
                          className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId ===
                          task.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}