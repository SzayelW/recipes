import { Form as RemixForm, useActionData, useNavigation } from "react-router";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Resource } from "./ResourceCard";

type ResourceFormProps = {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Resource | null;
};

export function ResourceForm({ isOpen, onClose, initialData }: ResourceFormProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [resourceType, setResourceType] = useState("Article");

    // Reset state when opening/closing or changing initialData
    useEffect(() => {
        if (isOpen) {
            setTags(initialData?.tags || []);
            setResourceType(initialData?.type || "Article");
        }
    }, [isOpen, initialData]);


    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">

                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold">
                        {initialData ? "Edit resource" : "Share a resource"}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <p className="text-sm text-gray-500 mb-6">
                        Contribute to the knowledge base by sharing valuable content
                    </p>

                    <RemixForm method="post" className="space-y-6" onSubmit={() => setTimeout(onClose, 500)}>
                        <input type="hidden" name="intent" value={initialData ? "update" : "create"} />
                        {initialData && <input type="hidden" name="id" value={initialData.id} />}

                        {/* Tags as JSON string */}
                        <input type="hidden" name="tags" value={JSON.stringify(tags)} />

                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-semibold text-gray-900">Type</label>
                            <div className="relative">
                                <select
                                    name="type"
                                    id="type"
                                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                                    value={resourceType}
                                    onChange={(e) => setResourceType(e.target.value)}
                                >
                                    <option value="Article">Article</option>
                                    <option value="Code Snippet">Code Snippet</option>
                                    <option value="Learning Resource">Learning Resource</option>
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold text-gray-900">Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                defaultValue={initialData?.title}
                                placeholder="Enter a descriptive title"
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-semibold text-gray-900">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                defaultValue={initialData?.description}
                                placeholder="Provide a detailed description"
                                className="w-full h-32 rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 resize-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="tags" className="text-sm font-semibold text-gray-900">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="Add a tag..."
                                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {(resourceType === "Article" || resourceType === "Learning Resource" || resourceType === "Course") && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="link" className="text-sm font-semibold text-gray-900">URL</label>
                                <input
                                    type="url"
                                    name="link"
                                    id="link"
                                    defaultValue={initialData?.link}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        )}

                        {resourceType === "Code Snippet" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label htmlFor="code_snippet" className="text-sm font-semibold text-gray-900">Code Snippet</label>
                                <textarea
                                    name="code_snippet"
                                    id="code_snippet"
                                    defaultValue={initialData?.codeSnippet || ""}
                                    placeholder={`\`\`\`javascript\n// your code here\n\`\`\``}
                                    className="w-full h-48 font-mono rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400 resize-none bg-gray-50"
                                />
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-lg border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-black/90 transition-transform active:scale-[0.99]"
                            >
                                {initialData ? "Update Resource" : "Create Resource"}
                            </button>
                        </div>

                    </RemixForm>
                </div>
            </div>
        </div>
    );
}
