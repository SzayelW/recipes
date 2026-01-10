import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Login from "./login";
import { createMemoryRouter, RouterProvider } from "react-router";
import * as ReactRouter from "react-router";

// Mock useActionData
vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router")>();
    return {
        ...actual,
        useActionData: vi.fn(),
    };
});

describe("Login Page", () => {
    it("renders login form elements", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue(undefined);

        const router = createMemoryRouter([
            { path: "/login", element: <Login /> }
        ], { initialEntries: ["/login"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
    });

    it("displays error message when action fails", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue({ error: "Invalid credentials" });

        const router = createMemoryRouter([
            { path: "/login", element: <Login /> }
        ], { initialEntries: ["/login"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
