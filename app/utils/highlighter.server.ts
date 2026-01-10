import { createHighlighter } from "shiki";

// Singleton highlighter instance to avoid recreating it on every request
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter() {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ["github-dark"],
            langs: ["javascript", "typescript", "python", "html", "css", "json", "bash", "sql", "java", "go", "ruby", "rust", "php", "cpp"],
        });
    }
    return highlighterPromise;
}

export type HighlightResult = {
    content: string; // The original content (without the fence if parsed)
    language: string;
    html: string;
};

// Regex for markdown code fence
const FENCE_REGEX = /^```(\w+)?\n([\s\S]*?)\n```$/;

export function detectLanguage(input: string): { language: string, content: string } {
    const match = input.trim().match(FENCE_REGEX);
    if (match) {
        return {
            language: match[1] || "text",
            content: match[2]
        };
    }
    return { language: "text", content: input };
}

export async function highlightCode(input: string): Promise<HighlightResult> {
    const highlighter = await getHighlighter();
    const { language, content } = detectLanguage(input);

    // Default to text if language not found or supported
    let html = "";
    try {
        html = highlighter.codeToHtml(content, {
            lang: language,
            theme: "github-dark",
        });
    } catch (e) {
        // Fallback to text if language is unknown
        html = highlighter.codeToHtml(content, {
            lang: "text",
            theme: "github-dark",
        });
    }

    return {
        content,
        language,
        html,
    };
}
