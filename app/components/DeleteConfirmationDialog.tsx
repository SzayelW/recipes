import { Form } from "react-router";
import { useEffect } from "react";

type DeleteConfirmationDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    resourceId: number | null;
};

export function DeleteConfirmationDialog({ isOpen, onClose, resourceId }: DeleteConfirmationDialogProps) {
    useEffect(() => {
        if (isOpen) {
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            window.addEventListener("keydown", handleEsc);
            return () => window.removeEventListener("keydown", handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !resourceId) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 id="delete-title" className="text-lg font-bold mb-2">Delete Resource</h3>
                <p id="delete-description" className="text-gray-500 mb-6">
                    Are you sure you want to delete this resource? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <Form method="post" onSubmit={onClose}>
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={resourceId} />
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-black text-sm font-semibold text-white hover:bg-black/90 transition-colors"
                        >
                            Delete
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}
