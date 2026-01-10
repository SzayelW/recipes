import { loader, action } from "./dashboard";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Utils
vi.mock("../utils/highlighter.server", () => ({
    highlightCode: vi.fn().mockResolvedValue({
        language: "js",
        html: "<span class='shiki'>mock path</span>"
    }),
    detectLanguage: vi.fn().mockReturnValue({
        language: "javascript",
        content: "console.log('test')"
    })
}));

// Mock DB
const { mockDb } = vi.hoisted(() => {
    const chain = {
        from: vi.fn().mockReturnThis(),
        $dynamic: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue(true), // Resolved promise
        set: vi.fn().mockReturnThis(),
        // To handle await on query builder
        then: vi.fn((resolve) => resolve([]))
    };

    return {
        mockDb: {
            select: vi.fn(() => chain),
            insert: vi.fn(() => chain),
            update: vi.fn(() => chain),
            delete: vi.fn(() => chain),
            chain // expose for assertions/setup
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


describe("Dashboard Route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default resolve for select
        mockDb.chain.then.mockImplementation((resolve: any) => resolve([]));
    });

    describe("loader", () => {
        it("returns resources with highlighted code", async () => {
            const mockResources = [
                {
                    id: 1,
                    title: "Test",
                    tags: "[\"tag\"]",
                    codeSnippet: "```js\ncode\n```",
                    createdAt: new Date(),
                    authorId: 1
                }
            ];

            // Setup resolve for this specific test
            mockDb.chain.then.mockImplementation((resolve: any) => resolve(mockResources));

            const request = new Request("http://localhost:3000/");
            const response = await loader({ request, params: {}, context: {} } as any);

            expect(response.resources).toHaveLength(1);
            expect(response.resources[0].highlightedCode).toBe("<span class='shiki'>mock path</span>");
        });

        it("redirects if no token", async () => {
            // Override session mock for this test
            const { getSession } = await import("../sessions.server");
            (getSession as any).mockResolvedValueOnce({
                get: () => null
            });

            const request = new Request("http://localhost:3000/");

            await expect(loader({ request, params: {}, context: {} } as any))
                .rejects
                .toThrow(); // Redirect throws a 302 response
        });
        it("filters resources by search query", async () => {
            const request = new Request("http://localhost:3000/?q=react");
            await loader({ request, params: {}, context: {} } as any);
            expect(mockDb.chain.where).toHaveBeenCalled();
        });

        it("filters resources by type", async () => {
            const request = new Request("http://localhost:3000/?type=blog");
            await loader({ request, params: {}, context: {} } as any);
            expect(mockDb.chain.where).toHaveBeenCalled();
        });

        it("filters resources by tag", async () => {
            const request = new Request("http://localhost:3000/?tag=javascript");
            await loader({ request, params: {}, context: {} } as any);
            expect(mockDb.chain.where).toHaveBeenCalled();
        });
    });

    describe("action", () => {
        it("creates a new resource with detected language", async () => {
            const formData = new FormData();
            formData.append("intent", "create");
            formData.append("title", "New Post");
            formData.append("description", "A description");
            formData.append("type", "Code Snippet");
            formData.append("code_snippet", "```javascript console.log('test') ```");
            formData.append("tags", "[]");

            const request = new Request("http://localhost:3000/", {
                method: "POST",
                body: formData
            });

            await action({ request, params: {}, context: {} } as any);

            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.chain.values).toHaveBeenCalledWith(expect.objectContaining({
                title: "New Post",
                description: "A description",

                type: "Code Snippet",
                tags: "[]",
                link: "#", // default in action
                codeSnippet: "```javascript console.log('test') ```",
                language: "javascript",
                authorId: 1
            }));
        });
    });
});
