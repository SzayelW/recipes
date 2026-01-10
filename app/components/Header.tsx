import { Link, Form } from "react-router";
import { User, LogOut, Menu, ChevronDown, FileText, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header({ userEmail, onMenuClick, onShareClick }: { userEmail: string; onMenuClick?: () => void; onShareClick?: () => void }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 px-6 bg-white shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-black">
                    <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-2">
                    {/* Icon mimicking the 'Method' logo */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                    </div>
                    <Link to="/" className="text-lg font-bold tracking-tight">Method Knowledge Hub</Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onShareClick}
                    className="hidden sm:block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                    Share Resource
                </button>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors outline-none"
                    >
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline">{userEmail}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                                <button
                                    onClick={() => {
                                        onShareClick?.();
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left text-sm font-medium text-gray-700"
                                >
                                    Share Resource
                                </button>
                            </div>
                            <Link
                                to="/my-posts"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <FileText className="h-4 w-4" />
                                My Posts
                            </Link>
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                <UserCircle className="h-4 w-4" />
                                My Profile
                            </Link>

                            <div className="border-t border-gray-100 mt-1 pt-1">
                                <Form method="post" action="/logout">
                                    <button
                                        type="submit"
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </Form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
