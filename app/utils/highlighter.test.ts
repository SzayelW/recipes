import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectLanguage, highlightCode } from "./highlighter.server";

// Mock Shiki
const mockCodeToHtml = vi.fn();
vi.mock("shiki", () => ({
    createHighlighter: vi.fn().mockResolvedValue({
        codeToHtml: (code: string, options: any) => mockCodeToHtml(code, options)
    })
}));

describe("highlighter.server", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("detectLanguage", () => {
        it("detects language from markdown fence", () => {
            const input = "```javascript\nconsole.log('hi');\n```";
            const result = detectLanguage(input);
            expect(result).toEqual({
                language: "javascript",
                content: "console.log('hi');"
            });
        });

        it("defaults to text if no language specified in fence", () => {
            const input = "```\nplain text\n```";
            const result = detectLanguage(input);
            expect(result).toEqual({
                language: "text",
                content: "plain text"
            });
        });

        it("defaults to text if no fence present", () => {
            const input = "const a = 1;";
            const result = detectLanguage(input);
            expect(result).toEqual({
                language: "text",
                content: "const a = 1;"
            });
        });

        it("handles multi-line content correctly", () => {
            const input = "```python\ndef foo():\n    return 1\n```";
            const result = detectLanguage(input);
            expect(result.language).toBe("python");
            expect(result.content).toBe("def foo():\n    return 1");
        });
    });

    describe("highlightCode", () => {
        it("calls shiki with valid language", async () => {
            mockCodeToHtml.mockReturnValue("<span class='shiki'>html</span>");
            const input = "```css\n.class { color: red; }\n```";

            const result = await highlightCode(input);

            expect(result.language).toBe("css");
            expect(result.html).toBe("<span class='shiki'>html</span>");
            expect(mockCodeToHtml).toHaveBeenCalledWith(".class { color: red; }", expect.objectContaining({
                lang: "css",
                theme: "github-dark"
            }));
        });

        it("falls back to text if shiki throws error", async () => {
            // Setup mock to throw once then return valid html
            mockCodeToHtml.mockImplementationOnce(() => {
                throw new Error("Unknown lang");
            });
            mockCodeToHtml.mockReturnValue("<span class='shiki'>text html</span>");

            const input = "```unknown\nstuff\n```";
            const result = await highlightCode(input);

            expect(result.language).toBe("unknown"); // The detected language is still passed back
            // But highlight should have been called with "text" in the catch block
            expect(mockCodeToHtml).toHaveBeenCalledTimes(2);
            expect(mockCodeToHtml).toHaveBeenLastCalledWith("stuff", expect.objectContaining({
                lang: "text"
            }));
            expect(result.html).toBe("<span class='shiki'>text html</span>");
        });
    });
});
