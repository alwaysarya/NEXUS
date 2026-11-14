import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Server, Box, LogOut, Shield, Bell, User, Settings, Activity, Search, ChevronRight, Cpu, Database, Play, Plus, Trash2, ShieldAlert, Globe, HardDrive, Terminal, HelpCircle, MoreHorizontal, ChevronDown, CheckCircle2, AlertCircle, XCircle, Network, X, Layers, ArrowRight, Key } from 'lucide-react';

const C = { bg: '#09090b', sidebar: '#0f0f13', card: '#121216', cardHover: '#1a1a20', border: '#27272a', primary: '#6366f1', success: '#22c55e', warning: '#eab308', danger: '#ef4444', text: '#f4f4f5', muted: '#a1a1aa' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, marginBottom: '16px', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '10px 20px', borderRadius: '6px', border: 'none', background: C.primary, color: '#fff', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px', transition: 'background 0.2s' };

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '12px', width: '450px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h2>
          <X size={20} color={C.muted} cursor="pointer" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
};

const DashboardLayout = ({ children, role, handleLogout, isHealthy, searchQuery, setSearchQuery, notifications }: any) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('Production');

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { path: '/nodes', label: 'Clusters', icon: <Server size={18} /> },
    { path: '/workloads', label: 'Workloads', icon: <Box size={18} /> },
    { path: '/security', label: 'Security', icon: <Shield size={18} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', backgroundColor: C.sidebar }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'white', borderRadius: '6px' }}><span style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>N</span></div>
          <span style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>NEXUS</span>
        </div>
        <div style={{ padding: '10px', flex: 1, marginTop: '10px' }}>
          <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px' }}>PLATFORM</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', backgroundColor: isActive ? '#27272a' : 'transparent', color: isActive ? C.text : C.muted, transition: 'all 0.1s' }}>
                  {item.icon} <span style={{ fontSize: '14px', fontWeight: isActive ? '500' : '400' }}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: C.muted, fontSize: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isHealthy ? C.success : C.danger }}></div> {isHealthy ? 'All Systems Operational' : 'Backend Offline'}
          </div>
          <button onClick={handleLogout} style={{ ...btnStyle, width: '100%', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}><LogOut size={16} /> Sign Out</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '64px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: C.bg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowEnvMenu(!showEnvMenu)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: C.text, backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.success }}></div>
                {currentEnv}
                <ChevronDown size={14} color={C.muted} />
              </div>
              {showEnvMenu && (
                <div style={{ position: 'absolute', top: '36px', left: 0, width: '150px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  {['Production', 'Staging', 'Development'].map(env => (
                    <div key={env} onClick={() => { setCurrentEnv(env); setShowEnvMenu(false); }} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', color: C.text }} onMouseOver={e => e.currentTarget.style.backgroundColor = C.sidebar} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>{env}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: C.muted }}>
              <span>Cluster</span><span>/</span><span style={{ color: C.text, fontWeight: '500' }}>prod-eks-01</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: '4px', marginLeft: '8px', fontSize: '12px' }}><CheckCircle2 size={12} color={C.success} /> Healthy</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
              <Search size={14} color={C.muted} />
              <input type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '13px' }} />
            </div>
            <div style={{ position: 'relative' }}>
              <Bell size={18} color={C.muted} cursor="pointer" onClick={() => setShowNotifications(!showNotifications)} />
              {showNotifications && (
                <div style={{ position: 'absolute', right: 0, top: '30px', width: '300px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Notifications</h4>
                  {notifications.length === 0 ? <p style={{ fontSize: '12px', color: C.muted }}>No new notifications.</p> : notifications.map((n: any, i: number) => (
                    <div key={i} style={{ fontSize: '12px', padding: '8px 0', borderBottom: i !== notifications.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} color={C.success} /> {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <HelpCircle size={18} color={C.muted} cursor="pointer" />
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>A</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '13px', fontWeight: '500' }}>Admin</span><span style={{ fontSize: '11px', color: C.muted }}>Platform Admin</span></div>
              </div>
              {showProfileMenu && (
                <div style={{ position: 'absolute', right: 0, top: '40px', width: '180px', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  <Link to="/settings" style={{ textDecoration: 'none' }}><div style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', color: C.text }} onMouseOver={e => e.currentTarget.style.backgroundColor = C.sidebar} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>Account Settings</div></Link>
                  <div style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', color: C.text }} onMouseOver={e => e.currentTarget.style.backgroundColor = C.sidebar} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>API Keys</div>
                  <div onClick={handleLogout} style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', color: C.danger }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} onClick={() => { showNotifications && setShowNotifications(false); showProfileMenu && setShowProfileMenu(false); showEnvMenu && setShowEnvMenu(false); }}>
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexus_role'));
  const [nodes, setNodes] = useState<any[]>([]); const [workloads, setWorkloads] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>(null); const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);

  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  const fetchData = () => {
    if (!token) return;
    fetch('/api/v1/nodes', { headers: getHeaders() }).then(res => res.json()).then(data => setNodes(data || [])).catch(() => setIsHealthy(false));
    fetch('/api/v1/workloads', { headers: getHeaders() }).then(res => res.json()).then(data => setWorkloads(data || []));
    fetch('/api/v1/system/stats', { headers: getHeaders() }).then(res => res.json()).then(data => setSysStats(data));
    fetch('/health/ready').then(res => setIsHealthy(res.ok)).catch(() => setIsHealthy(false));
  };

  useEffect(() => { if (token) { fetchData(); const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); } }, [token]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value }) })
    .then(res => res.ok ? res.json() : Promise.reject('Invalid credentials')).then(data => {
      const decoded: any = JSON.parse(atob(data.token.split('.')[1]));
      localStorage.setItem('nexus_token', data.token); localStorage.setItem('nexus_role', decoded.role);
      setToken(data.token); setRole(decoded.role);
    }).catch(err => alert(err));
  };
  const handleLogout = () => { localStorage.clear(); setToken(null); setRole(null); };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev].slice(0, 5));
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: C.card, padding: '40px', borderRadius: '12px', border: `1px solid ${C.border}`, width: '350px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Sign in to NEXUS</h2>
          <input name="username" style={inputStyle} placeholder="Username" required />
          <input name="password" style={inputStyle} type="password" placeholder="Password" required />
          <button type="submit" style={{ ...btnStyle, width: '100%', padding: '10px' }}>Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <DashboardLayout role={role} handleLogout={handleLogout} isHealthy={isHealthy} searchQuery={searchQuery} setSearchQuery={setSearchQuery} notifications={notifications}>
        <Routes>
          <Route path="/" element={<Overview nodes={nodes} workloads={workloads} isHealthy={isHealthy} sysStats={sysStats} searchQuery={searchQuery} />} />
          <Route path="/nodes" element={<NodesPage nodes={nodes} refresh={fetchData} role={role} searchQuery={searchQuery} addNotification={addNotification} />} />
          <Route path="/workloads" element={<WorkloadsPage workloads={workloads} refresh={fetchData} role={role} searchQuery={searchQuery} addNotification={addNotification} />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

const Overview = ({ nodes, workloads, isHealthy, sysStats, searchQuery }: any) => {
  const realCpuPercent = sysStats ? Math.min((sysStats.goroutines * 2.5), 100).toFixed(1) : "0.0";
  const realMemPercent = sysStats ? Math.min(((sysStats.allocated_mb / 1024) * 100), 100).toFixed(1) : "0.0";

  const filteredNodes = nodes.filter((n: any) => n.hostname.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredWorkloads = workloads.filter((w: any) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.image.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div><h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Cluster Overview</h1><p style={{ margin: '4px 0 0 0', color: C.muted, fontSize: '14px' }}>Monitor your infrastructure health and resource usage.</p></div>
        <div style={{ display: 'flex', gap: '8px' }}><button style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>Last 15 min <ChevronDown size={14}/></button></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Cluster Health', val: isHealthy ? 'Healthy' : 'Offline', sub: isHealthy ? 'All systems nominal' : 'Check backend', icon: <CheckCircle2 size={16} color={isHealthy ? C.success : C.danger} />, color: isHealthy ? C.success : C.danger },
          { label: 'Nodes', val: filteredNodes.length, sub: `${filteredNodes.filter((n: any) => n.status === 'active').length} Ready`, icon: <Server size={16} color={C.muted} />, color: C.text },
          { label: 'Pods / Workloads', val: filteredWorkloads.length, sub: `${filteredWorkloads.filter((w: any) => w.status === 'running').length} Running`, icon: <Box size={16} color={C.muted} />, color: C.text },
          { label: 'System Uptime', val: '99.98%', sub: 'Last 30 days', icon: <Activity size={16} color={C.muted} />, color: C.text },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>{stat.label}</span>{stat.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: stat.color, marginBottom: '4px' }}>{stat.val}</div><div style={{ fontSize: '12px', color: C.muted }}>{stat.sub}</div>
          </div>
        ))}
      </div>


          {/* LIVE CHART */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cluster Performance (Live)</h2>
              <span style={{ fontSize: '12px', color: C.muted }}>CPU vs Memory</span>
            </div>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { time: '10:00', cpu: 25, mem: 40 }, { time: '10:05', cpu: 35, mem: 45 },
                  { time: '10:10', cpu: 45, mem: 55 }, { time: '10:15', cpu: 30, mem: 50 },
                  { time: '10:20', cpu: 50, mem: 60 }, { time: '10:25', cpu: 40, mem: 55 },
                  { time: '10:30', cpu: 35, mem: 48 }
                ]}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={C.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={C.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="time" stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', color: C.text }} />
                  <Area type="monotone" dataKey="cpu" stroke={C.primary} fillOpacity={1} fill="url(#colorCpu)" />
                  <Area type="monotone" dataKey="mem" stroke={C.success} fillOpacity={1} fill="url(#colorMem)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', minHeight: '250px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cluster Topology</h2>
              <span style={{ fontSize: '12px', color: C.success, backgroundColor: 'rgba(34,197,94,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.success }}></div> Live</span>
            </div>
            <div style={{ position: 'relative', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'absolute', width: '80%', height: '1px', backgroundColor: C.border, top: '50%' }}></div>
              <div style={{ zIndex: 2, display: 'flex', gap: '80px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '12px', backgroundColor: C.sidebar, border: `1px solid ${C.primary}`, borderRadius: '8px', boxShadow: '0 0 15px rgba(99,102,241,0.2)' }}><Network size={24} color={C.primary} /></div>
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>Control Plane</span>
                </div>
                {filteredNodes.slice(0, 3).map((n: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '12px', backgroundColor: C.sidebar, border: `1px solid ${n.status === 'active' ? C.success : C.warning}`, borderRadius: '8px' }}><Server size={24} color={n.status === 'active' ? C.success : C.warning} /></div>
                    <span style={{ fontSize: '12px', color: C.muted }}>{n.hostname.split('.')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Nodes ({filteredNodes.length})</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                <th style={{ padding: '12px 20px', fontWeight: '500' }}>Name</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Instance Type</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>CPU</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Memory</th>
              </tr></thead>
              <tbody>
                {filteredNodes.map((n: any) => (
                  <tr key={n.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 20px', fontWeight: '500' }}>{n.hostname}</td>
                    <td style={{ padding: '12px 20px' }}><span style={{ color: n.status === 'active' ? C.success : C.warning, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.status === 'active' ? C.success : C.warning }}></div>{n.status === 'active' ? 'Ready' : 'Pending'}</span></td>
                    <td style={{ padding: '12px 20px', color: C.muted }}>m6i.2xlarge</td>
                    <td style={{ padding: '12px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>{n.cpu_cores} Cores</span><div style={{ width: '40px', height: '4px', backgroundColor: C.border, borderRadius: '2px' }}><div style={{ width: '38%', height: '100%', background: C.primary, borderRadius: '2px' }}></div></div></div></td>
                    <td style={{ padding: '12px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>{n.memory_mb} MB</span><div style={{ width: '40px', height: '4px', backgroundColor: C.border, borderRadius: '2px' }}><div style={{ width: '61%', height: '100%', background: C.success, borderRadius: '2px' }}></div></div></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Resource Utilization (Live)</h2>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={14}/> CPU Usage</span><span>{realCpuPercent}%</span></div>
              <div style={{ width: '100%', height: '6px', backgroundColor: C.border, borderRadius: '3px' }}><div style={{ width: `${realCpuPercent}%`, height: '100%', background: C.primary, borderRadius: '3px', transition: 'width 0.5s ease' }}></div></div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={14}/> Memory Usage</span><span>{realMemPercent}%</span></div>
              <div style={{ width: '100%', height: '6px', backgroundColor: C.border, borderRadius: '3px' }}><div style={{ width: `${realMemPercent}%`, height: '100%', background: C.primary, borderRadius: '3px', transition: 'width 0.5s ease' }}></div></div>
            </div>
            {sysStats && (
               <div style={{ marginTop: '24px', borderTop: `1px solid ${C.border}`, paddingTop: '16px', fontSize: '12px', color: C.muted, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Go Version</span><span style={{ color: C.text }}>{sysStats.go_version}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Goroutines</span><span style={{ color: C.text }}>{sysStats.goroutines}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mem Allocated</span><span style={{ color: C.text }}>{sysStats.allocated_mb} MB</span></div>
               </div>
            )}
          </div>

          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>System Health</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[{ name: 'API Server', status: isHealthy ? 'Healthy' : 'Offline', color: isHealthy ? C.success : C.danger }, { name: 'Scheduler', status: isHealthy ? 'Healthy' : 'Offline', color: isHealthy ? C.success : C.danger }, { name: 'Node Agent', status: 'Healthy', color: C.success }, { name: 'Database', status: isHealthy ? 'Healthy' : 'Offline', color: isHealthy ? C.success : C.danger }].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}><span style={{ color: C.muted }}>{s.name}</span><span style={{ color: s.color, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }}></div> {s.status}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NodesPage = ({ nodes, refresh, role, searchQuery, addNotification }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hostname, setHostname] = useState(''); const [ipAddress, setIpAddress] = useState(''); const [cpuCores, setCpuCores] = useState(''); const [memoryMB, setMemoryMB] = useState('');
  
  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/nodes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ hostname, ip_address: ipAddress, cpu_cores: parseInt(cpuCores), memory_mb: parseInt(memoryMB) }) }).then(() => { setHostname(''); setIpAddress(''); setCpuCores(''); setMemoryMB(''); setIsModalOpen(false); refresh(); addNotification(`Node ${hostname} registered successfully.`); });
  };
  const handleDelete = (id: string) => { if(confirm('Delete node?')) fetch(`/api/v1/nodes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } }).then(() => { refresh(); addNotification('Node deleted from cluster.'); }); };

  const filteredNodes = nodes.filter((n: any) => n.hostname.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Compute Nodes</h1>
        {role === 'admin' && <button onClick={() => setIsModalOpen(true)} style={{ ...btnStyle, background: C.primary }}><Plus size={16}/> Add Node</button>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Node">
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
          <input style={inputStyle} placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input style={inputStyle} type="number" placeholder="CPU Cores" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required />
            <input style={inputStyle} type="number" placeholder="Memory (MB)" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
            <button type="submit" style={btnStyle}>Register Node</button>
          </div>
        </form>
      </Modal>

      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px 20px', fontWeight: '500' }}>Hostname</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>IP Address</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>CPU</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Memory</th>{role === 'admin' && <th style={{ padding: '12px 20px', fontWeight: '500' }}>Actions</th>}
          </tr></thead>
          <tbody>
            {filteredNodes.map((n: any) => (
              <tr key={n.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 20px', fontWeight: '500' }}>{n.hostname}</td>
                <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: C.muted }}>{n.ip_address}</td>
                <td style={{ padding: '12px 20px' }}><span style={{ color: n.status === 'active' ? C.success : C.warning, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.status === 'active' ? C.success : C.warning }}></div>{n.status === 'active' ? 'Ready' : 'Pending'}</span></td>
                <td style={{ padding: '12px 20px' }}>{n.cpu_cores} Cores</td>
                <td style={{ padding: '12px 20px' }}>{n.memory_mb} MB</td>
                {role === 'admin' && <td style={{ padding: '12px 20px' }}><button onClick={() => handleDelete(n.id)} style={{ color: C.danger, background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WorkloadsPage = ({ workloads, refresh, role, searchQuery, addNotification }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(''); const [image, setImage] = useState(''); const [cpu, setCpu] = useState(''); const [mem, setMem] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/workloads', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ name, image, cpu_required: parseInt(cpu), memory_required: parseInt(mem) }) }).then(() => { setName(''); setImage(''); setCpu(''); setMem(''); setIsModalOpen(false); refresh(); addNotification(`Workload ${name} created. Ready to schedule.`); });
  };
  const handleSchedule = (id: string) => { fetch(`/api/v1/workloads/${id}/schedule`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } }).then(() => { refresh(); addNotification('Workload scheduled to node.'); }); };

  const filteredWorkloads = workloads.filter((w: any) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.image.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Deployments</h1>
        {role === 'admin' && <button onClick={() => setIsModalOpen(true)} style={{ ...btnStyle, background: C.primary }}><Plus size={16}/> Create Release</button>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deploy New Workload">
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Workload Name" value={name} onChange={e => setName(e.target.value)} required />
          <input style={inputStyle} placeholder="Docker Image (e.g. nginx)" value={image} onChange={e => setImage(e.target.value)} required />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input style={inputStyle} type="number" placeholder="CPU Required" value={cpu} onChange={e => setCpu(e.target.value)} required />
            <input style={inputStyle} type="number" placeholder="Memory (MB)" value={mem} onChange={e => setMem(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
            <button type="submit" style={btnStyle}>Deploy</button>
          </div>
        </form>
      </Modal>

      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px 20px', fontWeight: '500' }}>Name</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Image</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Node</th>{role === 'admin' && <th style={{ padding: '12px 20px', fontWeight: '500' }}>Actions</th>}
          </tr></thead>
          <tbody>
            {filteredWorkloads.map((w: any) => (
              <tr key={w.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 20px', fontWeight: '500' }}>{w.name}</td>
                <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: C.muted }}>{w.image}</td>
                <td style={{ padding: '12px 20px' }}><span style={{ color: w.status === 'running' ? C.success : C.warning, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: w.status === 'running' ? C.success : C.warning }}></div>{w.status === 'running' ? 'Running' : 'Pending'}</span></td>
                <td style={{ padding: '12px 20px', fontFamily: 'monospace', color: C.muted }}>{w.node_id ? w.node_id.substring(0, 8) + '...' : 'Unassigned'}</td>
                {role === 'admin' && <td style={{ padding: '12px 20px' }}>{w.status === 'pending' && <button onClick={() => handleSchedule(w.id)} style={{ padding: '4px 12px', backgroundColor: C.primary, color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Schedule</button>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SecurityPage = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Security Operations</h1></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>Security Posture</span><Shield size={16} color={C.success} /></div><div style={{ fontSize: '24px', fontWeight: '600', color: C.success }}>96.8%</div></div>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>Active Threats</span><ShieldAlert size={16} color={C.danger} /></div><div style={{ fontSize: '24px', fontWeight: '600', color: C.danger }}>0</div></div>
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>Blocked Access</span><Globe size={16} color={C.muted} /></div><div style={{ fontSize: '24px', fontWeight: '600' }}>142</div></div>
    </div>
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}><h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Audit Event Stream</h2></div>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
          <th style={{ padding: '12px 20px', fontWeight: '500' }}>Time</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Event</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Actor</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th>
        </tr></thead>
        <tbody>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px 20px', color: C.muted }}>20:15:04</td><td style={{ padding: '12px 20px' }}>Role updated (Viewer → Admin)</td><td style={{ padding: '12px 20px', fontFamily: 'monospace' }}>admin@nexus.io</td><td style={{ padding: '12px 20px' }}><span style={{ color: C.success, backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Success</span></td></tr>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px 20px', color: C.muted }}>20:12:47</td><td style={{ padding: '12px 20px' }}>Policy modified (network-ingress)</td><td style={{ padding: '12px 20px', fontFamily: 'monospace' }}>secops@nexus.io</td><td style={{ padding: '12px 20px' }}><span style={{ color: C.success, backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Success</span></td></tr>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px 20px', color: C.muted }}>20:07:29</td><td style={{ padding: '12px 20px' }}>Access denied (unauthorized scope)</td><td style={{ padding: '12px 20px', fontFamily: 'monospace' }}>user@external.com</td><td style={{ padding: '12px 20px' }}><span style={{ color: C.danger, backgroundColor: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Blocked</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [apiKey, setApiKey] = useState('');

  const generateApiKey = () => {
    fetch('/api/v1/api-keys', { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } 
    })
    .then(res => res.json())
    .then(data => setApiKey(data.api_key));
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: '600' }}>Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Sidebar Settings Menu */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '12px' }}>
          {['Profile', 'API Keys', 'Preferences', 'Billing', 'Team'].map((item) => (
            <div key={item} onClick={() => setActiveTab(item)} style={{ padding: '10px 12px', fontSize: '14px', cursor: 'pointer', backgroundColor: activeTab === item ? C.sidebar : 'transparent', color: activeTab === item ? C.text : C.muted, borderRadius: '6px', marginBottom: '4px', fontWeight: activeTab === item ? '500' : '400' }}>{item}</div>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '24px' }}>
          
          {activeTab === 'Profile' && (
            <>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>Profile Information</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>A</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Admin User</h3>
                  <p style={{ margin: '4px 0 0 0', color: C.muted, fontSize: '13px' }}>Platform Administrator</p>
                </div>
                <button style={{ ...btnStyle, marginLeft: 'auto', background: 'transparent', border: `1px solid ${C.border}`, color: C.text }}>Change Avatar</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '8px' }}>Full Name</label>
                  <input style={inputStyle} defaultValue="Admin User" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '8px' }}>Email Address</label>
                  <input style={inputStyle} defaultValue="admin@nexus.io" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: C.muted, marginBottom: '8px' }}>Role</label>
                <input style={{ ...inputStyle, backgroundColor: C.sidebar }} defaultValue="Platform Admin (Superuser)" disabled />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: `1px solid ${C.border}`, paddingTop: '24px' }}>
                <button style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>Cancel</button>
                <button style={btnStyle}>Save Changes</button>
              </div>
            </>
          )}

          {activeTab === 'API Keys' && (
            <>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>API Keys</h2>
              <p style={{ margin: '0 0 24px 0', color: C.muted, fontSize: '13px' }}>Manage your API keys for programmatic access to NEXUS.</p>

              <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Node Agent Key</h3>
                  <button onClick={generateApiKey} style={{ ...btnStyle, padding: '6px 12px', fontSize: '12px' }}><Key size={14}/> Generate New Key</button>
                </div>
                {apiKey ? (
                  <div style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', color: C.success, wordBreak: 'break-all' }}>
                    {apiKey}
                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: C.muted }}>Copy this key now. You won't be able to see it again.</p>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', color: C.muted }}>No API keys generated yet.</p>
                )}
              </div>

              <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.2)`, borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px' }}>
                <AlertCircle size={20} color={C.warning} style={{ flexShrink: 0 }}/>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: C.warning }}>Keep your keys secure</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Never share your API keys or commit them to public repositories.</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Preferences' && (
            <>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '600' }}>Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>Email Notifications</h4><p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Receive updates about your cluster.</p></div>
                  <div style={{ width: '44px', height: '24px', backgroundColor: C.success, borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>Auto-refresh Dashboard</h4><p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Refresh data every 5 seconds.</p></div>
                  <div style={{ width: '44px', height: '24px', backgroundColor: C.success, borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '500' }}>Dark Mode</h4><p style={{ margin: 0, fontSize: '12px', color: C.muted }}>Use dark theme across the dashboard.</p></div>
                  <div style={{ width: '44px', height: '24px', backgroundColor: C.primary, borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', transition: 'all 0.3s' }}></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'Billing' || activeTab === 'Team') && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>{activeTab}</h2>
              <p style={{ margin: 0, color: C.muted, fontSize: '13px' }}>This feature is coming soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;
