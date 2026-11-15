import { useState } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const [showProject, setShowProject] = useState(false);
  const [showRegion, setShowRegion] = useState(false);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 relative z-50">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu */}
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center gap-6">
          {/* Project Dropdown */}
          <div className="relative">
            <button onClick={() => setShowProject(!showProject)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Production <ChevronDown size={14} />
            </button>
            {showProject && (
              <div className="absolute top-8 left-0 w-40 bg-surface border border-border rounded-md shadow-lg py-1">
                <div className="px-3 py-1.5 text-sm text-white bg-white/5 cursor-pointer">Production</div>
                <div className="px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 cursor-pointer">Staging</div>
              </div>
            )}
          </div>

          {/* Region Dropdown */}
          <div className="relative">
            <button onClick={() => setShowRegion(!showRegion)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              us-east-1 (N. Virginia) <ChevronDown size={14} />
            </button>
            {showRegion && (
              <div className="absolute top-8 left-0 w-56 bg-surface border border-border rounded-md shadow-lg py-1">
                <div className="px-3 py-1.5 text-sm text-white bg-white/5 cursor-pointer">us-east-1 (N. Virginia)</div>
                <div className="px-3 py-1.5 text-sm text-gray-400 hover:bg-white/5 cursor-pointer">us-west-2 (Oregon)</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl px-4 hidden md:block">
        <div className="relative flex items-center w-full">
          <Search size={16} className="absolute left-3 text-gray-500" />
          <input type="text" placeholder="Search resources..." className="w-full bg-surface border border-border text-sm text-white rounded-md py-1.5 pl-9 pr-12 focus:outline-none focus:border-primary" />
          <div className="absolute right-2 text-xs text-gray-500 border border-border px-1.5 py-0.5 rounded">⌘ K</div>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-3 md:gap-4 text-gray-400">
        <div className="relative cursor-pointer hover:text-white"><Bell size={18} /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background"></div></div>
        <div className="cursor-pointer hover:text-white hidden md:block"><HelpCircle size={18} /></div>
        <div className="flex items-center gap-2 cursor-pointer border-l border-border pl-3 md:pl-4 ml-1 md:ml-2">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          <div className="text-sm hidden md:block"><div className="text-white">Admin</div></div>
        </div>
      </div>
    </header>
  );
}
