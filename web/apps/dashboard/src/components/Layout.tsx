import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Box, Shield, Search, Bell, User, Settings, 
  ChevronDown, CheckCircle2, LogOut, Book, LifeBuoy, ChevronRight, Activity, Network
} from 'lucide-react';

const C = { bg: '#09090b', sidebar: '#0f0f13', card: '#121216', border: '#27272a', primary: '#6366f1', success: '#22c55e', warning: '#eab308', danger: '#ef4444', text: '#f4f4f5', muted: '#a1a1aa' };

const navItems = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { path: '/nodes', label: 'Clusters', icon: <Server size={18} /> },
  { path: '/workloads', label: 'Workloads', icon: <Box size={18} /> },
  { path: '/networking', label: 'Networking', icon: <Network size={18} /> },
  { path: '/security', label: 'Security', icon: <Shield size={18} /> },
];

const resourceItems = [
  { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  { path: '/docs', label: 'Documentation', icon: <Book size={18} /> },
  { path: '/support', label: 'Support', icon: <LifeBuoy size={18} /> },
];

export default function Layout({ children, handleLogout, isHealthy, searchQuery, setSearchQuery, notifications, nodes, workloads }: any) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('Production');

  const matchedNodes = searchQuery ? nodes.filter((n: any) => n.hostname.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const matchedWorkloads = searchQuery ? workloads.filter((w: any) => w.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', backgroundColor: C.sidebar }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'white', borderRadius: '6px' }}>
            <span style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>N</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>NEXUS</span>
        </div>

        <div style={{ padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px', marginTop: '10px' }}>PLATFORM</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', backgroundColor: isActive ? '#27272a' : 'transparent', color: isActive ? C.text : C.muted }}>
                  {item.icon} <span style={{ fontSize: '14px', fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
                </div>
              </Link>
            );
          })}

          <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px', marginTop: '24px' }}>RESOURCES</p>
          {resourceItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', backgroundColor: isActive ? '#27272a' : 'transparent', color: isActive ? C.text : C.muted }}>
                  {item.icon} <span style={{ fontSize: '14px', fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: C.muted, fontSize: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isHealthy ? C.success : C.danger }}></div> 
            {isHealthy ? 'All Systems Operational' : 'Backend Offline'}
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOP NAVBAR */}
        <div style={{ height: '64px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: C.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Environment Switcher */}
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowEnv(!showEnv)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.text, backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.success }}></div>
                {currentEnv}
                <ChevronDown size={14} color={C.muted} />
              </div>
              {showEnv && (
                <div style={{ position: 'absolute', top: '36px', left: 0, width: '150px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px', zIndex: 10 }}>
                  {['Production', 'Staging', 'Development'].map(env => (
                    <div key={env} onClick={() => { setCurrentEnv(env); setShowEnv(false); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px' }} onMouseOver={e => e.currentTarget.style.backgroundColor = C.sidebar} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>{env}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: C.muted }}>
              <span>Cluster</span><span>/</span><span style={{ color: C.text, fontWeight: '500' }}>prod-eks-01</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: '4px', marginLeft: '8px', fontSize: '12px' }}>
                <CheckCircle2 size={12} color={C.success} /> Healthy
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Global Search */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
                <Search size={14} color={C.muted} />
                <input type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '13px' }} />
                <span style={{ fontSize: '11px', color: C.muted, border: `1px solid ${C.border}`, padding: '2px 4px', borderRadius: '4px' }}>⌘K</span>
              </div>
              
              {searchQuery && (matchedNodes.length > 0 || matchedWorkloads.length > 0) && (
                <div style={{ position: 'absolute', top: '40px', left: 0, width: '100%', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px', zIndex: 10 }}>
                  {matchedNodes.map((n: any) => (
                    <Link to="/nodes" key={n.id} style={{ textDecoration: 'none', color: C.text }} onClick={() => setSearchQuery('')}>
                      <div style={{ padding: '8px', display: 'flex', gap: '10px', borderRadius: '4px' }}><Server size={14} color={C.primary} /><span style={{ fontSize: '13px' }}>{n.hostname}</span></div>
                    </Link>
                  ))}
                  {matchedWorkloads.map((w: any) => (
                    <Link to="/workloads" key={w.id} style={{ textDecoration: 'none', color: C.text }} onClick={() => setSearchQuery('')}>
                      <div style={{ padding: '8px', display: 'flex', gap: '10px', borderRadius: '4px' }}><Box size={14} color={C.warning} /><span style={{ fontSize: '13px' }}>{w.name}</span></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <Bell size={18} color={C.muted} cursor="pointer" onClick={() => setShowNotifications(!showNotifications)} />
              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '30px', width: '300px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', zIndex: 10 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', marginBottom: '12px' }}>Notifications</h4>
                  {notifications.length === 0 ? <p style={{ fontSize: '12px', color: C.muted }}>No notifications.</p> : notifications.map((n: any, i: number) => <div key={i} style={{ fontSize: '12px', padding: '8px 0' }}>{n}</div>)}
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowProfile(!showProfile)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>A</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '13px', fontWeight: '500' }}>Admin</span><span style={{ fontSize: '11px', color: C.muted }}>Platform Admin</span></div>
              </div>
              {showProfile && (
                <div style={{ position: 'absolute', right: 0, top: '40px', width: '180px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px', zIndex: 10 }}>
                  <Link to="/profile" style={{ textDecoration: 'none' }}><div style={{ padding: '8px 12px', fontSize: '13px', color: C.text }}>My Profile</div></Link>
                  <Link to="/settings" style={{ textDecoration: 'none' }}><div style={{ padding: '8px 12px', fontSize: '13px', color: C.text }}>Account Settings</div></Link>
                  <div onClick={handleLogout} style={{ padding: '8px 12px', fontSize: '13px', color: C.danger, cursor: 'pointer' }}>Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} onClick={() => { showNotifications && setShowNotifications(false); showProfile && setShowProfile(false); showEnv && setShowEnv(false); }}>
          {children}
        </div>
      </div>
    </div>
  );
}
