import { Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        {/* Project Dropdown */}
        <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Production
          <ChevronDown size={14} />
        </div>
        {/* Region Dropdown */}
        <div className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          us-east-1 (N. Virginia)
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl px-6">
        <div className="relative flex items-center w-full">
          <Search size={16} className="absolute left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search resources, logs, metrics..."
            className="w-full bg-surface border border-border text-sm text-white rounded-md py-1.5 pl-9 pr-12 focus:outline-none focus:border-primary"
          />
          <div className="absolute right-2 text-xs text-gray-500 border border-border px-1.5 py-0.5 rounded">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 text-gray-400">
        <div className="relative cursor-pointer hover:text-white">
          <Bell size={18} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background"></div>
        </div>
        <div className="cursor-pointer hover:text-white">
          <HelpCircle size={18} />
        </div>
        <div className="flex items-center gap-2 cursor-pointer border-l border-border pl-4 ml-2">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div className="text-sm">
            <div className="text-white">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
