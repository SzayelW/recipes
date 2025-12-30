import { Form, useSearchParams, useSubmit } from "react-router";

const RESOURCE_TYPES = ["Articles", "Code Snippets", "Learning Resources"];
const TAGS = [
    "Advanced",
    "Book",
    "Course",
    "CSS",
    "Frontend",
    "Fundamentals",
    "Grid",
    "Hooks",
    "JavaScript",
    "Layout",
    "Performance",
    "React",
    "Responsive",
];

export function Sidebar({ className = "" }: { className?: string }) {
    const [searchParams] = useSearchParams();
    const submit = useSubmit();

    const handleFilterChange = (event: React.FormEvent<HTMLFormElement>) => {
        submit(event.currentTarget);
    };

    const currentTypes = searchParams.getAll("type");
    const currentTags = searchParams.getAll("tag");

    return (
        <aside className={`w-64 shrink-0 space-y-8 py-8 ${className}`}>
            <div>
                <h3 className="text-lg font-bold mb-4">Filters</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Resource Type</h4>
                        <Form onChange={handleFilterChange} className="space-y-2">
                            {/* Preserve existing searches/tags when changing type */}
                            {currentTags.map(t => <input key={t} type="hidden" name="tag" value={t} />)}
                            <input type="hidden" name="q" value={searchParams.get("q") || ""} />

                            {RESOURCE_TYPES.map((type) => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            name="type"
                                            value={type}
                                            defaultChecked={currentTypes.includes(type)}
                                            className="peer h-4 w-4 appearance-none rounded border border-gray-300 checked:bg-black checked:border-black transition-all"
                                        />
                                        <svg
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100"
                                            viewBox="0 0 14 14"
                                            fill="none"
                                        >
                                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{type}</span>
                                </label>
                            ))}
                        </Form>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                {/* For tags, we might want individual toggles. Using a Form for simplicity involves logic to add/remove. 
             A simpler approach for 'links' style tags: */}
                <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => {
                        const isActive = currentTags.includes(tag);
                        // Logic to toggle: if active, remove from new URL. If inactive, add.
                        const newTags = isActive
                            ? currentTags.filter(t => t !== tag)
                            : [...currentTags, tag];

                        const params = new URLSearchParams(searchParams);
                        params.delete("tag");
                        newTags.forEach(t => params.append("tag", t));

                        return (
                            <a
                                key={tag}
                                href={`/?${params.toString()}`}
                                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isActive
                                    ? "bg-black text-white border-black"
                                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                                    }`}
                            >
                                {tag}
                            </a>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
