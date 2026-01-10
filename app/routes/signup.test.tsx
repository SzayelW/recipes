import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Signup from "./signup";
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

describe("Signup Page", () => {
    it("renders signup form elements", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue(undefined);

        const router = createMemoryRouter([
            { path: "/signup", element: <Signup /> }
        ], { initialEntries: ["/signup"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByRole("heading", { name: /create an account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    });

    it("displays error message from action", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue({ error: "Passwords do not match" });

        const router = createMemoryRouter([
            { path: "/signup", element: <Signup /> }
        ], { initialEntries: ["/signup"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
});
