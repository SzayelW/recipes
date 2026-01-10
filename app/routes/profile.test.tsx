import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Profile from "./profile";
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

// Mock Header to avoid complex rendering or dependencies
vi.mock("../components/Header", () => ({
    Header: ({ userEmail }: { userEmail: string }) => <div data-testid="header">{userEmail}</div>
}));

describe("Profile Page", () => {
    const mockUser = {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
    };

    const mockLoaderData = {
        userEmail: "test@example.com",
        user: mockUser,
    };

    it("renders profile with user data", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue(undefined);

        // We can pass loaderData directly as it's a prop in the component definition
        // @ts-ignore - Route.ComponentProps is complex to mock fully, but we just need loaderData
        const element = <Profile loaderData={mockLoaderData} />;

        const router = createMemoryRouter([
            { path: "/profile", element }
        ], { initialEntries: ["/profile"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByRole("heading", { name: /my profile/i })).toBeInTheDocument();
        expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
        expect(screen.getByDisplayValue("User")).toBeInTheDocument();
        expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    });

    it("displays success message upon update", () => {
        vi.mocked(ReactRouter.useActionData).mockReturnValue({ success: "Profile updated successfully!" });

        // @ts-ignore
        const element = <Profile loaderData={mockLoaderData} />;

        const router = createMemoryRouter([
            { path: "/profile", element }
        ], { initialEntries: ["/profile"] });

        render(<RouterProvider router={router} />);

        expect(screen.getByText("Profile updated successfully!")).toBeInTheDocument();
    });
});
