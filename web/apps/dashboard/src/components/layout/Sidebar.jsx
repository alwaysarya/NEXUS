import { 
  LayoutDashboard, Box, Layers, Network, Database, 
  Activity, Shield, DollarSign, Terminal, Settings, 
  ChevronDown, Boxes
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview' },
    { icon: Boxes, label: 'Clusters', active: true },
    { icon: Box, label: 'Workloads' },
    { icon: Layers, label: 'Deployments' },
    { icon: Network, label: 'Networking' },
    { icon: Database, label: 'Storage' },
    { icon: Activity, label: 'Observability', hasDropdown: true },
    { icon: Shield, label: 'Security', hasDropdown: true },
    { icon: DollarSign, label: 'Cost & Usage' },
    { icon: Terminal, label: 'Automation' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-xs">N</span>
          </div>
          NEXUS
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${
              item.active ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
            {item.hasDropdown && <ChevronDown size={14} />}
          </div>
        ))}
      </div>

      {/* Bottom Status */}
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
