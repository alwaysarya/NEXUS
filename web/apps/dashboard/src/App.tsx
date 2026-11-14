import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Server, Box, LogOut, Shield, Bell, User, Settings, Activity, Search, ChevronRight, Cpu, Database, Play, Plus, Trash2, ShieldAlert, Globe, HardDrive, Terminal, HelpCircle, MoreHorizontal, ChevronDown, CheckCircle2, AlertCircle, XCircle, Network, X, Layers, ArrowRight, Key, Book, MessageSquare, LifeBuoy, FileText, Zap, Rocket } from 'lucide-react';

const C = { bg: '#09090b', sidebar: '#0f0f13', card: '#121216', border: '#27272a', primary: '#6366f1', success: '#22c55e', warning: '#eab308', danger: '#ef4444', text: '#f4f4f5', muted: '#a1a1aa' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, marginBottom: '16px', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '10px 20px', borderRadius: '6px', border: 'none', background: C.primary, color: '#fff', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '14px' };

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

const Sparkline = ({ data, color }: any) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const points = data.map((val: number, i: number) => `${(i / (data.length - 1)) * 100},${30 - ((val - min) / range) * 30}`).join(' ');
  return <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: '8px' }}><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexus_role'));
  const [nodes, setNodes] = useState<any[]>([]); const [workloads, setWorkloads] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>(null); const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true); const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]); const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false); const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('Production');
  const [chartData, setChartData] = useState<any[]>([{ time: '10:00', cpu: 25, mem: 40 }, { time: '10:05', cpu: 35, mem: 45 }, { time: '10:10', cpu: 45, mem: 55 }]);

  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  const fetchData = () => {
    if (!token) return;
    fetch('/api/v1/nodes', { headers: getHeaders() }).then(res => res.json()).then(data => setNodes(Array.isArray(data) ? data : [])).catch(() => setIsHealthy(false));
    fetch('/api/v1/workloads', { headers: getHeaders() }).then(res => res.json()).then(data => setWorkloads(Array.isArray(data) ? data : []));
    fetch('/api/v1/system/stats', { headers: getHeaders() }).then(res => res.json()).then(data => setSysStats(data));
    fetch('/health/ready').then(res => setIsHealthy(res.ok)).catch(() => setIsHealthy(false)).finally(() => setIsLoading(false));
  };

  useEffect(() => { 
    if (token) { 
      fetchData(); 
      const interval = setInterval(fetchData, 5000); 
      const chartInterval = setInterval(() => {
        setChartData((prev: any[]) => {
          const now = new Date();
          return [...prev.slice(1), { time: now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0'), cpu: Math.floor(Math.random() * 40) + 20, mem: Math.floor(Math.random() * 30) + 40 }];
        });
      }, 3000);
      return () => { clearInterval(interval); clearInterval(chartInterval); };
    } 
  }, [token]);

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

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: C.card, padding: '40px', borderRadius: '12px', border: `1px solid ${C.border}`, width: '350px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>Sign in to NEXUS</h2>
          <input name="username" style={inputStyle} placeholder="Username" required />
          <input name="password" style={inputStyle} type="password" placeholder="Password" required />
          <button type="submit" style={{ ...btnStyle, width: '100%' }}>Sign In</button>
        </form>
      </div>
    );
  }

  const safeSearch = (searchQuery || '').toLowerCase();
  const filteredNodes = (nodes || []).filter((n: any) => (n.hostname || '').toLowerCase().includes(safeSearch));
  const filteredWorkloads = (workloads || []).filter((w: any) => (w.name || '').toLowerCase().includes(safeSearch));

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', backgroundColor: C.sidebar }}>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', background: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>N</div>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>NEXUS</span>
          </div>
          
          <div style={{ padding: '10px', flex: 1 }}>
            <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px' }}>PLATFORM</p>
            {[{ path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> }, { path: '/nodes', label: 'Clusters', icon: <Server size={18} /> }, { path: '/workloads', label: 'Workloads', icon: <Box size={18} /> }, { path: '/security', label: 'Security', icon: <Shield size={18} /> }].map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', color: C.muted }}>{item.icon} <span style={{ fontSize: '14px' }}>{item.label}</span></div>
              </Link>
            ))}
            <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px', marginTop: '24px' }}>RESOURCES</p>
            {[{ path: '/settings', label: 'Settings', icon: <Settings size={18} /> }, { path: '/docs', label: 'Documentation', icon: <Book size={18} /> }, { path: '/support', label: 'Support', icon: <LifeBuoy size={18} /> }].map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', color: C.muted }}>{item.icon} <span style={{ fontSize: '14px' }}>{item.label}</span></div>
              </Link>
            ))}
          </div>

          <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: C.muted, fontSize: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isHealthy ? C.success : C.danger }}></div> {isHealthy ? 'All Systems Operational' : 'Backend Offline'}
            </div>
            <button onClick={handleLogout} style={{ ...btnStyle, width: '100%', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}><LogOut size={16} /> Sign Out</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* TOP NAVBAR */}
          <div style={{ height: '64px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div onClick={() => setShowEnvMenu(!showEnvMenu)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.success }}></div> {currentEnv} <ChevronDown size={14} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: C.muted }}>
                <span>Cluster</span>/<span style={{ color: C.text }}>prod-eks-01</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: '4px', fontSize: '12px' }}><CheckCircle2 size={12} color={C.success}/> Healthy</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
                <Search size={14} color={C.muted} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '13px' }} />
              </div>
              <Bell size={18} color={C.muted} cursor="pointer" onClick={() => setShowNotifications(!showNotifications)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>A</div>
                <span style={{ fontSize: '13px' }}>Admin</span>
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <Routes>
              <Route path="/" element={<Overview nodes={nodes} workloads={workloads} isHealthy={isHealthy} isLoading={isLoading} sysStats={sysStats} chartData={chartData} />} />
              <Route path="/nodes" element={<NodesPage nodes={nodes} refresh={fetchData} role={role} isLoading={isLoading} />} />
              <Route path="/workloads" element={<WorkloadsPage workloads={workloads} refresh={fetchData} role={role} isLoading={isLoading} />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

const Overview = ({ nodes, workloads, isHealthy, isLoading, sysStats, chartData }: any) => {
  const [activeTab, setActiveTab] = useState('Nodes');
  const [filterStatus, setFilterStatus] = useState('All');
  if (isLoading) return <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}><Activity size={32} /><p>Loading cluster data...</p></div>;

  const filteredNodes = nodes.filter((n: any) => filterStatus === 'All' || n.status === filterStatus.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
        {[
          { label: 'Cluster Health', val: isHealthy ? 'Healthy' : 'Offline', color: isHealthy ? C.success : C.danger, icon: <CheckCircle2 size={16} color={isHealthy ? C.success : C.danger} />, spark: isHealthy ? [1,1,1,1,1,1,1,1] : [0,0,0,0,0,0,0,0] },
          { label: 'Nodes', val: nodes.length, color: C.text, icon: <Server size={16} color={C.muted} />, spark: [1,1,1,1,1,1,1,1] },
          { label: 'Pods', val: 148, color: C.text, icon: <Box size={16} color={C.muted} />, spark: [100, 120, 130, 140, 145, 150, 148, 148] },
          { label: 'Workloads', val: workloads.length, color: C.text, icon: <Layers size={16} color={C.muted} />, spark: [1,1,1,1,1,1,1,1] },
          { label: 'CPU Usage', val: sysStats ? `${(sysStats.goroutines * 2.5).toFixed(1)}%` : '0%', color: C.primary, icon: <Cpu size={16} color={C.primary} />, spark: [20, 25, 22, 30, 28, 35, 32, 40] },
          { label: 'Memory', val: sysStats ? `${sysStats.allocated_mb} MB` : '0 MB', color: C.success, icon: <Database size={16} color={C.success} />, spark: [40, 42, 45, 43, 50, 48, 52, 55] },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: C.muted, fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>{s.label}</span>{s.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: s.color, marginTop: '4px' }}>{s.val}</div>
            <Sparkline data={s.spark} color={s.color === C.text ? C.primary : s.color} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', minHeight: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Cluster Topology</h2>
              <span style={{ fontSize: '11px', color: C.success, backgroundColor: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.success }}></div> Live</span>
            </div>
            <div style={{ position: 'relative', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'absolute', width: '80%', height: '1px', backgroundColor: C.border, top: '50%', zIndex: 1 }}></div>
              <div style={{ zIndex: 2, display: 'flex', gap: '80px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '16px', backgroundColor: C.sidebar, border: `1px solid ${C.primary}`, borderRadius: '50%', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}><Network size={28} color={C.primary} /></div>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Control Plane</span>
                </div>
                {nodes.slice(0, 3).map((n: any, i: number) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '16px', backgroundColor: C.sidebar, border: `1px solid ${n.status === 'active' ? C.success : C.warning}`, borderRadius: '50%' }}><Server size={28} color={n.status === 'active' ? C.success : C.warning} /></div>
                    <span style={{ fontSize: '12px', color: C.muted }}>{n.hostname}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 20px' }}>
              {['Nodes', 'Pods', 'Workloads'].map((tab) => (
                <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '16px 0', marginRight: '24px', fontSize: '14px', fontWeight: '500', color: activeTab === tab ? C.text : C.muted, borderBottom: activeTab === tab ? `2px solid ${C.primary}` : '2px solid transparent', cursor: 'pointer' }}>{tab}</div>
              ))}
            </div>
            
            <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
              <input type="text" placeholder={`Search ${activeTab.toLowerCase()}...`} style={{ ...inputStyle, marginBottom: 0, width: '220px', padding: '6px 12px', fontSize: '13px' }} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, marginBottom: 0, width: '120px', padding: '6px 12px', fontSize: '13px' }}>
                <option>All</option><option>Active</option><option>Pending</option>
              </select>
              <button style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, padding: '6px 12px', fontSize: '13px' }}>Export</button>
              <button style={{ ...btnStyle, padding: '6px 12px', fontSize: '13px' }}><Plus size={14}/> Add</button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                <th style={{ padding: '12px 20px', fontWeight: '500' }}>Name</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Zone</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Instance Type</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>CPU</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Memory</th>
              </tr></thead>
              <tbody>
                {filteredNodes.map((n: any) => (
                  <tr key={n.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '12px 20px', fontWeight: '500' }}>{n.hostname}</td>
                    <td style={{ padding: '12px 20px' }}><span style={{ color: n.status === 'active' ? C.success : C.warning, display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.status === 'active' ? C.success : C.warning }}></div>{n.status === 'active' ? 'Ready' : 'Pending'}</span></td>
                    <td style={{ padding: '12px 20px', color: C.muted }}>us-east-1a</td>
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Resource Utilization</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: C.muted }}>CPU Usage</span><span>{sysStats ? (sysStats.goroutines * 2.5).toFixed(1) : 0}%</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: C.border, borderRadius: '3px' }}><div style={{ width: `${sysStats ? Math.min(100, sysStats.goroutines * 2.5) : 0}%`, height: '100%', backgroundColor: C.primary, borderRadius: '3px' }}></div></div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: C.muted }}>Memory</span><span>{sysStats ? sysStats.allocated_mb : 0} MB</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: C.border, borderRadius: '3px' }}><div style={{ width: `${sysStats ? Math.min(100, (sysStats.allocated_mb / 1024) * 100) : 0}%`, height: '100%', backgroundColor: C.success, borderRadius: '3px' }}></div></div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Recent Events</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ icon: <CheckCircle2 size={16} color={C.success} />, title: 'Node Registered', time: 'Just now' }, { icon: <Activity size={16} color={C.primary} />, title: 'Heartbeat Received', time: '10s ago' }, { icon: <Shield size={16} color={C.success} />, title: 'Security Scan Passed', time: '5m ago' }].map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ padding: '8px', backgroundColor: C.sidebar, borderRadius: '50%' }}>{ev.icon}</div><div style={{ flex: 1, fontSize: '13px' }}>{ev.title}</div><div style={{ fontSize: '11px', color: C.muted }}>{ev.time}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NodesPage = ({ nodes, refresh, role, isLoading }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hostname, setHostname] = useState(''); const [ipAddress, setIpAddress] = useState(''); const [cpuCores, setCpuCores] = useState(''); const [memoryMB, setMemoryMB] = useState('');
  
  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/nodes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ hostname, ip_address: ipAddress, cpu_cores: parseInt(cpuCores), memory_mb: parseInt(memoryMB) }) }).then(() => { setHostname(''); setIpAddress(''); setCpuCores(''); setMemoryMB(''); setIsModalOpen(false); refresh(); });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Compute Nodes</h1>
        {role === 'admin' && <button onClick={() => setIsModalOpen(true)} style={btnStyle}><Plus size={16}/> Add Node</button>}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Node">
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
          <input style={inputStyle} placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
          <div style={{ display: 'flex', gap: '12px' }}><input style={inputStyle} type="number" placeholder="CPU Cores" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required /><input style={inputStyle} type="number" placeholder="Memory (MB)" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required /></div>
          <button type="submit" style={btnStyle}>Register Node</button>
        </form>
      </Modal>
      <div style={{ backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '20px' }}>
        {isLoading ? <p>Loading...</p> : nodes.length === 0 ? <p style={{ color: C.muted }}>No nodes registered.</p> :
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}><th style={{ padding: '12px' }}>Hostname</th><th style={{ padding: '12px' }}>IP Address</th><th style={{ padding: '12px' }}>Status</th></tr></thead>
          <tbody>{nodes.map((n: any) => (<tr key={n.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px' }}>{n.hostname}</td><td style={{ padding: '12px', fontFamily: 'monospace' }}>{n.ip_address}</td><td style={{ padding: '12px', color: n.status === 'active' ? C.success : C.warning }}>{n.status}</td></tr>))}</tbody>
        </table>}
      </div>
    </div>
  );
};

const WorkloadsPage = ({ workloads, refresh, role, isLoading }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(''); const [image, setImage] = useState(''); const [cpu, setCpu] = useState(''); const [mem, setMem] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/workloads', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ name, image, cpu_required: parseInt(cpu), memory_required: parseInt(mem) }) }).then(() => { setName(''); setImage(''); setCpu(''); setMem(''); setIsModalOpen(false); refresh(); });
  };
  const handleSchedule = (id: string) => { fetch(`/api/v1/workloads/${id}/schedule`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } }).then(() => refresh()); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Deployments</h1>
        {role === 'admin' && <button onClick={() => setIsModalOpen(true)} style={btnStyle}><Plus size={16}/> Create Release</button>}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deploy New Workload">
        <form onSubmit={handleSubmit}>
          <input style={inputStyle} placeholder="Workload Name" value={name} onChange={e => setName(e.target.value)} required />
          <input style={inputStyle} placeholder="Docker Image" value={image} onChange={e => setImage(e.target.value)} required />
          <div style={{ display: 'flex', gap: '12px' }}><input style={inputStyle} type="number" placeholder="CPU" value={cpu} onChange={e => setCpu(e.target.value)} required /><input style={inputStyle} type="number" placeholder="Memory" value={mem} onChange={e => setMem(e.target.value)} required /></div>
          <button type="submit" style={btnStyle}>Deploy</button>
        </form>
      </Modal>
      <div style={{ backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, padding: '20px' }}>
        {isLoading ? <p>Loading...</p> : workloads.length === 0 ? <p style={{ color: C.muted }}>No workloads deployed.</p> :
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}><th style={{ padding: '12px' }}>Name</th><th style={{ padding: '12px' }}>Status</th></tr></thead>
          <tbody>{workloads.map((w: any) => (<tr key={w.id} style={{ borderBottom: `1px solid ${C.border}` }}><td style={{ padding: '12px' }}>{w.name}</td><td style={{ padding: '12px', color: w.status === 'running' ? C.success : C.warning }}>{w.status}</td></tr>))}</tbody>
        </table>}
      </div>
    </div>
  );
};

const SecurityPage = () => <div style={{ color: 'white', padding: '20px' }}>Security - Coming Soon</div>;
const SettingsPage = () => <div style={{ color: 'white', padding: '20px' }}>Settings - Coming Soon</div>;
const DocsPage = () => <div style={{ color: 'white', padding: '20px' }}>Documentation - Coming Soon</div>;
const SupportPage = () => <div style={{ color: 'white', padding: '20px' }}>Support - Coming Soon</div>;

export default App;
