import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResourceForm } from "./ResourceForm";
import userEvent from "@testing-library/user-event";

// Mock Form since it's from react-router
vi.mock("react-router", async () => {
    return {
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
        useNavigation: () => ({ state: "idle" }),
    };
});

describe("ResourceForm Component", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        initialData: null,
    };

    it("renders correctly when open", () => {
        render(<ResourceForm {...defaultProps} />);
        expect(screen.getByText(/share a resource/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        render(<ResourceForm {...defaultProps} isOpen={false} />);
        expect(screen.queryByText(/share a resource/i)).not.toBeInTheDocument();
    });

    it("displays dynamic fields based on resource type", async () => {
        const user = userEvent.setup();
        render(<ResourceForm {...defaultProps} />);

        const typeSelect = screen.getByLabelText(/type/i);

        // Default is Article (or first option), checking default state
        // Assuming Article selected by default or we select it.
        // Let's select "Code Snippet".

        await user.selectOptions(typeSelect, "Code Snippet");

        // Should show Code Snippet field
        expect(screen.getByLabelText(/code snippet/i)).toBeInTheDocument();

        // Select "Article"
        await user.selectOptions(typeSelect, "Article");

        // Should show URL field
        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
        // Should NOT show Code Snippet field (if logic hides it)
        expect(screen.queryByLabelText(/code snippet/i)).not.toBeInTheDocument();
    });

    it("pre-fills data when editing", () => {
        const mockData = {
            id: 1,
            title: "Existing Post",
            description: "Desc",
            type: "Article",
            tags: ["react"],
            link: "http://example.com",
            authorId: 1,
            createdAt: "2023-01-01",
            codeSnippet: null
        };

        render(<ResourceForm {...defaultProps} initialData={mockData} />);

        expect(screen.getByText(/edit resource/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue("Existing Post")).toBeInTheDocument();
    });
});
