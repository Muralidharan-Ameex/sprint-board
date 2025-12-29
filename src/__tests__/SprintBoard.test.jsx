import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import SprintBoard from "../SprintBoard";
import { use } from "react";

// Clear localStorage before each test because SprintBoard uses it
beforeEach(() => {
  localStorage.clear();
});

describe("SprintBoard - Basic rendering", () => {
  it("renders Sprint Board title", async() => {
    render(<SprintBoard />);
    expect(await screen.findByText("Sprint Board")).toBeInTheDocument();
  });
});

describe("Create User validation", () => {
  it("shows errors when name and email are empty", async () => {
    render(<SprintBoard />);

    // await userEvent.click(screen.findByText("+ New User"));
    // await userEvent.click(screen.findByText("Create"));

    const newUserBtn = await
    screen.findByText("+ New User");
    await userEvent.click(newUserBtn);

    const createBtn = await
    screen.findByText("Create");
    await userEvent.click(createBtn);

    expect(await screen.findByText("Name is required")).toBeTruthy();
    expect(await screen.findByText("Email is required")).toBeTruthy();
  });

  it("prevents duplicate name and duplicate email", async () => {
    render(<SprintBoard />);

    const newUserBtn = await
    screen.findByText("+ New User");
    await userEvent.click(newUserBtn);

    const nameInput = await
    screen.findByLabelText(/name/i);
    const emailInput = await
    screen.findByLabelText(/email/i)

    await userEvent.type(
      nameInput, "Admin"
    );
    await userEvent.type(
      emailInput, "admin@example.com"
    );

    const createBtn = await
    screen.findByText("Create");
    await userEvent.click(createBtn);


    expect(
      await screen.findByText("This name already exists")
    ).toBeTruthy();

    expect(
      await screen.findByText("This email already exists")
    ).toBeTruthy();
  });
});

describe("Create Task validation", () => {
  it("shows errors when title and description are empty", async () => {
    render(<SprintBoard />);

    // await userEvent.click(screen.findByText("+ New Task"));
    // await userEvent.click(screen.findByText("Create"));

    const newTaskBtn = await
    screen.findByText("+ New Task");
    await userEvent.click(newTaskBtn);

    const createBtn = await
    screen.findByText("Create");
    await userEvent.click(createBtn);

    expect(await screen.findByText("Title is Required")).toBeTruthy();
    expect(await screen.findByText("Description is Required")).toBeTruthy();
  });
});

describe("Edit Task flow", () => {
  it("allows editing a task title and saving", async () => {
    render(<SprintBoard />);

    // Click Edit on the default task
    const editButtons = await
    screen.findAllByText("Edit")
    await userEvent.click(editButtons[0]);
    // await userEvent.click(screen.findByText("Edit"));

    // const titleInput = screen.getByLabelText(/title/i);
    const titleInput = await
    screen.findByLabelText(/title/i);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated Task Title");

    // await userEvent.click(screen.findByText("Save"));
    const saveBtn = await
    screen.findByText("Save");
    await userEvent.click(saveBtn);

    const updatedTitles = await
    screen.findAllByText("Updated Task Title");

    expect(updatedTitles.length).toBeGreaterThan(0);

    // expect(
    //   await screen.findByText("Updated Task Title")
    // ).toBeTruthy();
  });
});

// describe("Keyboard accessibility", () => {
//   it("closes edit modal on Escape key", async () => {
//     render(<SprintBoard />);

//     await userEvent.click(screen.findByText("Edit"));

//     // Modal should be open
//     expect(screen.findByText("Edit Task")).toBeInTheDocument();

//     await userEvent.keyboard("{Escape}");

//     // Modal should be closed
//     expect(
//       screen.queryByText("Edit Task")
//     ).not.toBeInTheDocument();
//   });
// });