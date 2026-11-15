import { useState } from 'react';
import { LayoutDashboard, Box, Layers, Network, Database, Activity, Shield, DollarSign, Terminal, ChevronDown, Boxes, ChevronRight, X } from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [expandedMenus, setExpandedMenus] = useState({ Observability: false, Security: false });

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
    { icon: Boxes, label: 'Clusters', path: '/clusters' },
    { icon: Box, label: 'Workloads', path: '/workloads' },
    { icon: Layers, label: 'Deployments', path: '/deployments' },
    { icon: Network, label: 'Networking', path: '/networking' },
    { icon: Database, label: 'Storage', path: '/storage' },
    { 
      icon: Activity, label: 'Observability', hasDropdown: true, path: '/observability',
      subItems: [
        { label: 'Metrics', path: '/observability?tab=metrics' },
        { label: 'Logs', path: '/observability?tab=logs' },
        { label: 'Traces', path: '/observability?tab=traces' },
        { label: 'Alerts', path: '/observability?tab=alerts', badge: 3 }
      ]
    },
    { 
      icon: Shield, label: 'Security', hasDropdown: true, path: '/security',
      subItems: [{ label: 'Access & RBAC', path: '/security?tab=rbac' }]
    },
    { icon: DollarSign, label: 'Cost & Usage', path: '/cost' },
    { icon: Terminal, label: 'Automation', path: '/automation' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div onClick={closeSidebar} className="fixed inset-0 bg-black/50 z-40 md:hidden"></div>}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border h-screen flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-wide">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center"><span className="text-xs">N</span></div>
            NEXUS
          </Link>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-white"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && !item.hasDropdown;
            const isExpanded = expandedMenus[item.label];

            return (
              <div key={item.label}>
                {item.hasDropdown ? (
                  <div onClick={() => toggleMenu(item.label)} className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${location.pathname === item.path ? 'text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} /><span>{item.label}</span></div>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                ) : (
                  <Link to={item.path} onClick={closeSidebar} className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3"><item.icon size={18} /><span>{item.label}</span></div>
                  </Link>
                )}

                {item.hasDropdown && isExpanded && (
                  <div className="ml-4 pl-4 border-l border-border mt-1 space-y-1">
                    {item.subItems.map((sub) => {
                      const isSubActive = location.pathname === item.path && searchParams.get('tab') === sub.path.split('=')[1];
                      return (
                        <Link key={sub.label} to={sub.path} onClick={closeSidebar} className={`flex items-center justify-between px-2 py-1.5 rounded text-sm ${isSubActive ? 'text-primary font-medium bg-primary/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                          <div className="flex items-center gap-2"><ChevronRight size={12} className={isSubActive ? 'text-primary' : 'text-gray-600'} /><span>{sub.label}</span></div>
                          {sub.badge && <span className="bg-primary text-white text-[10px] px-1.5 rounded-full">{sub.badge}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-green-500 font-medium"><div className="w-2 h-2 rounded-full bg-green-500"></div>All Systems Operational</div>
          <div className="text-xs text-gray-500 mt-1 pl-4">99.98% uptime (30d)</div>
        </div>
      </aside>
    </>
  );
}
