import React from "react";

import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { api, ApiError } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: jest.fn(),

  ApiError: class ApiError extends Error {
    status: number;
    error: string;
    messages: string[];

    constructor(
      status: number,
      message: string,
      error: string,
      messages: string[] = [],
    ) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.error = error;
      this.messages = messages;
    }
  },
}));

type TaskStatus =
  | "todo"
  | "in_progress"
  | "done";

function CreateTaskTestComponent() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] =
    React.useState("");
  const [status, setStatus] =
    React.useState<TaskStatus>("todo");
  const [priority, setPriority] =
    React.useState(1);
  const [projectId, setProjectId] =
    React.useState(1);

  const [error, setError] =
    React.useState("");

  const [success, setSuccess] =
    React.useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

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

    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          projectId,
        }),
      });

      setSuccess(true);

      // Clear only after successful creation.
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority(1);
      setProjectId(1);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.messages.length > 0
            ? err.messages.join(", ")
            : err.message,
        );
      } else {
        setError(
          "Failed to create task.",
        );
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">
        Title
      </label>

      <input
        id="title"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <label htmlFor="description">
        Description
      </label>

      <textarea
        id="description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value,
          )
        }
      />

      <label htmlFor="status">
        Status
      </label>

      <select
        id="status"
        value={status}
        onChange={(e) =>
          setStatus(
            e.target.value as TaskStatus,
          )
        }
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

      <label htmlFor="priority">
        Priority
      </label>

      <input
        id="priority"
        type="number"
        value={priority}
        onChange={(e) =>
          setPriority(
            Number(e.target.value),
          )
        }
      />

      <label htmlFor="projectId">
        Project ID
      </label>

      <input
        id="projectId"
        type="number"
        value={projectId}
        onChange={(e) =>
          setProjectId(
            Number(e.target.value),
          )
        }
      />

      <button type="submit">
        Create Task
      </button>

      {error && (
        <div role="alert">
          {error}
        </div>
      )}

      {success && (
        <div>
          Task created successfully
        </div>
      )}
    </form>
  );
}

describe("create task form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a task successfully and clears the form", async () => {
    (
      api as jest.MockedFunction<typeof api>
    ).mockResolvedValue({
      id: 100,
      title: "New Task",
      description: "Test description",
      status: "todo",
      priority: 3,
      projectId: 1,
    });

    render(<CreateTaskTestComponent />);

    fireEvent.change(
      screen.getByLabelText("Title"),
      {
        target: {
          value: "New Task",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(
        "Description",
      ),
      {
        target: {
          value: "Test description",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText("Priority"),
      {
        target: {
          value: "3",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create Task",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Task created successfully",
        ),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText("Title"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText(
        "Description",
      ),
    ).toHaveValue("");

    expect(api).toHaveBeenCalledWith(
      "/tasks",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("shows validation error and preserves form values", async () => {
    render(<CreateTaskTestComponent />);

    fireEvent.change(
      screen.getByLabelText(
        "Description",
      ),
      {
        target: {
          value: "Keep this description",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create Task",
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Title is required.",
    );

    expect(
      screen.getByLabelText(
        "Description",
      ),
    ).toHaveValue(
      "Keep this description",
    );

    expect(api).not.toHaveBeenCalled();
  });

  it("preserves form values when the API returns a validation error", async () => {
    (
      api as jest.MockedFunction<typeof api>
    ).mockRejectedValue(
      new ApiError(
        400,
        "Title must be unique",
        "Bad Request",
        ["Title must be unique"],
      ),
    );

    render(<CreateTaskTestComponent />);

    fireEvent.change(
      screen.getByLabelText("Title"),
      {
        target: {
          value: "Existing Task",
        },
      },
    );

    fireEvent.change(
      screen.getByLabelText(
        "Description",
      ),
      {
        target: {
          value: "Keep my description",
        },
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Create Task",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("alert"),
      ).toHaveTextContent(
        "Title must be unique",
      );
    });

    expect(
      screen.getByLabelText("Title"),
    ).toHaveValue(
      "Existing Task",
    );

    expect(
      screen.getByLabelText(
        "Description",
      ),
    ).toHaveValue(
      "Keep my description",
    );
  });
});