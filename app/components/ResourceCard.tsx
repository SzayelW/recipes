import { FileText, Code, BookOpen, Trash2, Edit2, PlayCircle } from "lucide-react";
import { Form } from "react-router";

export interface Resource {
    id: number;
    title: string;
    description: string;
    type: string;
    tags: string[]; // parsed JSON
    link: string;
    codeSnippet?: string | null;
    highlightedCode?: string | null;
    authorId: number;
    createdAt: string; // ISO string from serializer
}

const TypeIcon = ({ type }: { type: string }) => {
    const t = type.toLowerCase();
    if (t.includes("article")) return <FileText className="h-4 w-4" />;
    if (t.includes("code")) return <Code className="h-4 w-4" />;
    if (t.includes("course") || t.includes("book")) return <BookOpen className="h-4 w-4" />;
    if (t.includes("video")) return <PlayCircle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
};

export function ResourceCard({ resource, onEdit, onDelete }: { resource: Resource; onEdit?: (r: Resource) => void; onDelete?: (id: number) => void }) {
    return (
        <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md hover:border-gray-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                    <TypeIcon type={resource.type} />
                    <span>{resource.type}</span>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit?.(resource)} className="text-gray-400 hover:text-black" aria-label="Edit resource">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete?.(resource.id)} className="text-gray-400 hover:text-red-600" aria-label="Delete resource">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>

            {resource.highlightedCode ? (
                <div
                    className="mb-6 rounded-md overflow-hidden bg-[#0d1117] border border-gray-800 text-xs"
                    dangerouslySetInnerHTML={{ __html: resource.highlightedCode }}
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                />
            ) : (
                <a href={resource.link} className="flex items-center gap-1 font-semibold text-sm underline-offset-4 hover:underline mb-6">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
                    View {resource.type.toLowerCase().split(' ')[0]}
                </a>
            )}

            <div className="mt-auto flex flex-wrap gap-2 mb-6">
                {resource.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        A
                    </div>
                    <span className="text-xs font-medium text-gray-600">Admin</span>
                </div>
                <span className="text-xs text-gray-400">
                    {new Date(resource.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric'
                    })}
                </span>
            </div>
        </div>
    );
}
