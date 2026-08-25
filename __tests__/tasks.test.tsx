import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

type Task = {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: number;
};

function TaskListTestComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      const data = await api<Task[]>("/tasks");
      setTasks(data);
      setLoading(false);
    }

    loadTasks();
  }, []);

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div>
        <h2>No tasks found</h2>
        <p>Create a task or change the filter.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Tasks</h2>

      {tasks.map((task) => (
        <article key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>{task.status}</span>
        </article>
      ))}
    </div>
  );
}

describe("task list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tasks returned by the API", async () => {
    (
      api as jest.MockedFunction<typeof api>
    ).mockResolvedValue([
      {
        id: 1,
        title: "Test Task",
        description: "Testing task list",
        status: "todo",
        priority: 3,
      },
    ]);

    render(<TaskListTestComponent />);

    expect(
      screen.getByText("Loading tasks..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Test Task"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Testing task list"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("todo"),
    ).toBeInTheDocument();
  });

  it("renders the empty state when the API returns no tasks", async () => {
    (
      api as jest.MockedFunction<typeof api>
    ).mockResolvedValue([]);

    render(<TaskListTestComponent />);

    await waitFor(() => {
      expect(
        screen.getByText("No tasks found"),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "Create a task or change the filter.",
      ),
    ).toBeInTheDocument();
  });
});