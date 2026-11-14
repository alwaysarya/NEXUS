import { LayoutDashboard, Box, Layers, Network, Database, Activity, Shield, DollarSign, Terminal, ChevronDown, Boxes } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
    { icon: Boxes, label: 'Clusters', path: '/clusters' },
    { icon: Box, label: 'Workloads', path: '/workloads' },
    { icon: Layers, label: 'Deployments', path: '/deployments' },
    { icon: Network, label: 'Networking', path: '/networking' },
    { icon: Database, label: 'Storage', path: '/storage' },
    { icon: Activity, label: 'Observability', hasDropdown: true, path: '/observability' },
    { icon: Shield, label: 'Security', hasDropdown: true, path: '/security' },
    { icon: DollarSign, label: 'Cost & Usage', path: '/cost' },
    { icon: Terminal, label: 'Automation', path: '/automation' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center"><span className="text-xs">N</span></div>
          NEXUS
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${
              location.pathname === item.path || (location.pathname === '/' && item.path === '/clusters')
                ? 'bg-primary/10 text-primary font-medium' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
            {item.hasDropdown && <ChevronDown size={14} />}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          All Systems Operational
        </div>
        <div className="text-xs text-gray-500 mt-1 pl-4">99.98% uptime (30d)</div>
      </div>
    </aside>
  );
}
