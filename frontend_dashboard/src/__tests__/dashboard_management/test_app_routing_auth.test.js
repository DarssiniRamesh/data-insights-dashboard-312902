import { render, screen } from "@testing-library/react";
import App from "../../App";

test("renders login page when not authenticated", () => {
  render(<App />);
  // Login page contains multiple "Sign in" strings (title + button). Use role-based query to avoid ambiguity.
  expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
});
