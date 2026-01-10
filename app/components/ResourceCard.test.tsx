import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResourceCard, type Resource } from "./ResourceCard";
import userEvent from "@testing-library/user-event";

// Helper for user-event
function renderWithUser(ui: React.ReactElement) {
    return {
        user: userEvent.setup(),
        ...render(ui),
    };
}

// Mock dependencies
vi.mock("react-router", () => ({
    Form: ({ children }: any) => <form>{children}</form>,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    useNavigation: () => ({ state: "idle" }),
}));

describe("ResourceCard Component", () => {
    const mockResource: Resource = {
        id: 1,
        title: "Test Resource",
        description: "Test Description",
        type: "Code Snippet",
        tags: ["test"],
        link: "http://example.com",
        authorId: 1,
        createdAt: new Date().toISOString(),
        codeSnippet: "console.log('test')",
        highlightedCode: null
    };

    const onEdit = vi.fn();
    const onDelete = vi.fn();

    it("renders basic info correctly", () => {
        render(<ResourceCard resource={mockResource} onEdit={onEdit} onDelete={onDelete} />);

        expect(screen.getByText("Test Resource")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
        expect(screen.getByText("Code Snippet")).toBeInTheDocument();
        expect(screen.getByText("test")).toBeInTheDocument(); // Tag
    });

    it("renders highlighted code when provided", () => {
        const resourceWithHighlight = {
            ...mockResource,
            highlightedCode: "<pre class='shiki'><code>colored code</code></pre>"
        };

        render(<ResourceCard resource={resourceWithHighlight} />);

        // We look for the text content inside the HTML
        expect(screen.getByText("colored code")).toBeInTheDocument();
        // optionally check for class if possible via container, 
        // but testing-library focuses on visible text usually.
        // We can check if the link is NOT present as fallback
        expect(screen.queryByText("View code")).not.toBeInTheDocument();
    });

    it("renders link fallback when highlightedCode is missing", () => {
        render(<ResourceCard resource={mockResource} />);
        expect(screen.getByText(/View code/i)).toBeInTheDocument();
    });

    it("calls onEdit and onDelete handlers", async () => {
        const { user } = renderWithUser(<ResourceCard resource={mockResource} onEdit={onEdit} onDelete={onDelete} />);

        await user.click(screen.getByLabelText("Edit resource"));
        expect(onEdit).toHaveBeenCalledWith(mockResource);

        await user.click(screen.getByLabelText("Delete resource"));
        expect(onDelete).toHaveBeenCalledWith(mockResource.id);
    });
});
