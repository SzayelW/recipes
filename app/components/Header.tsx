import { Link, Form } from "react-router";
import { User, LogOut, Menu } from "lucide-react";

export function Header({ userEmail, onMenuClick }: { userEmail: string; onMenuClick?: () => void }) {
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
                    <span className="text-lg font-bold tracking-tight">Method Knowledge Hub</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                    Share Resource
                </button>

                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{userEmail}</span>
                </div>

                <Form method="post" action="/logout">
                    <button title="Sign out" className="text-gray-500 hover:text-black transition-colors">
                        <LogOut className="h-5 w-5" />
                    </button>
                </Form>
            </div>
        </header>
    );
}
