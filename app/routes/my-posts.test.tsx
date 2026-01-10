import { loader, action } from "./my-posts";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Utils
vi.mock("../utils/highlighter.server", () => ({
    highlightCode: vi.fn().mockResolvedValue({
        language: "js",
        html: "<span class='shiki'>mock path</span>"
    }),
}));

// Mock DB
const { mockDb } = vi.hoisted(() => {
    const chain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        get: vi.fn(), // for single select
        values: vi.fn().mockResolvedValue(true),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve([])) // Default empty array for select
    };

    return {
        mockDb: {
            select: vi.fn(() => chain),
            insert: vi.fn(() => chain),
            update: vi.fn(() => chain),
            delete: vi.fn(() => chain),
            chain
        }
    }
});

vi.mock("../db/index.server", () => ({
    db: mockDb
}));

// Mock Sessions
vi.mock("../sessions.server", () => ({
    getSession: vi.fn().mockResolvedValue({
        get: () => "valid-token"
    }),
    destroySession: vi.fn()
}));

// Mock JWT
vi.mock("jsonwebtoken", () => ({
    default: {
        verify: vi.fn().mockReturnValue({ email: "test@example.com", userId: 1 })
    }
}));


describe("MyPosts Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockDb.chain.then.mockImplementation((resolve: any) => resolve([]));
    });

    describe("loader", () => {
        it("returns user's resources", async () => {
            const mockResources = [
                {
                    id: 1,
                    title: "My Post",
                    tags: "[\"tag\"]",
                    codeSnippet: null,
                    createdAt: new Date(),
                    authorId: 1
                }
            ];
            mockDb.chain.then.mockImplementation((resolve: any) => resolve(mockResources));

            const request = new Request("http://localhost:3000/my-posts");
            const response = await loader({ request, params: {}, context: {} } as any);

            expect(response.resources).toHaveLength(1);
            expect(response.resources[0].title).toBe("My Post");
            expect(mockDb.chain.where).toHaveBeenCalled(); // Should filter by authorId
        });

        it("redirects if no token", async () => {
            const { getSession } = await import("../sessions.server");
            (getSession as any).mockResolvedValueOnce({
                get: () => null
            });

            const request = new Request("http://localhost:3000/my-posts");

            await expect(loader({ request, params: {}, context: {} } as any))
                .rejects
                .toThrow();
        });
    });

    describe("action", () => {
        it("deletes a resource if owned by user", async () => {
            const formData = new FormData();
            formData.append("intent", "delete");
            formData.append("id", "1");

            // Mock verify ownership get
            mockDb.chain.get.mockResolvedValueOnce({ id: 1, authorId: 1 });

            const request = new Request("http://localhost:3000/my-posts", {
                method: "POST",
                body: formData
            });

            await action({ request, params: {}, context: {} } as any);

            expect(mockDb.delete).toHaveBeenCalled();
            expect(mockDb.chain.where).toHaveBeenCalled();
        });

        it("does not delete resource if not owned by user", async () => {
            const formData = new FormData();
            formData.append("intent", "delete");
            formData.append("id", "1");

            // Mock verify ownership get - different author
            mockDb.chain.get.mockResolvedValueOnce({ id: 1, authorId: 2 });

            const request = new Request("http://localhost:3000/my-posts", {
                method: "POST",
                body: formData
            });

            await action({ request, params: {}, context: {} } as any);

            // First select is called to check ownership, but delete should not be called
            expect(mockDb.delete).not.toHaveBeenCalled();
        });
    });
});
