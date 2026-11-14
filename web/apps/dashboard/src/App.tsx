import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Server, Box, LogOut, Shield, Bell, User, Settings, Activity, Search, ChevronRight, Cpu, Database, Play, Plus, Trash2, ShieldAlert, Globe, HardDrive, Terminal, HelpCircle, MoreHorizontal, ChevronDown, CheckCircle2, AlertCircle, XCircle, Network, X, Layers, ArrowRight, Key, Book, MessageSquare, LifeBuoy, FileText, Zap } from 'lucide-react';

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

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexus_role'));
  const [nodes, setNodes] = useState<any[]>([]); 
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>(null); 
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEnvMenu, setShowEnvMenu] = useState(false);
  const [currentEnv, setCurrentEnv] = useState('Production');

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
      return () => clearInterval(interval); 
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

  // Safe filtering with fallbacks
  const safeSearch = (searchQuery || '').toLowerCase();
  const filteredNodes = (nodes || []).filter((n: any) => (n.hostname || '').toLowerCase().includes(safeSearch));
  const filteredWorkloads = (workloads || []).filter((w: any) => (w.name || '').toLowerCase().includes(safeSearch));

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { path: '/nodes', label: 'Clusters', icon: <Server size={18} /> },
    { path: '/workloads', label: 'Workloads', icon: <Box size={18} /> },
    { path: '/security', label: 'Security', icon: <Shield size={18} /> },
  ];

  const resourceItems = [
    { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    { path: '/docs', label: 'Documentation', icon: <Book size={18} /> },
    { path: '/support', label: 'Support', icon: <LifeBuoy size={18} /> },
  ];

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
            {navItems.map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', color: C.muted }}>
                  {item.icon} <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              </Link>
            ))}
            
            <p style={{ fontSize: '11px', color: C.muted, fontWeight: '600', marginBottom: '12px', paddingLeft: '12px', marginTop: '24px' }}>RESOURCES</p>
            {resourceItems.map(item => (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', marginBottom: '2px', color: C.muted }}>
                  {item.icon} <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ padding: '20px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: C.muted, fontSize: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isHealthy ? C.success : C.danger }}></div> 
              {isHealthy ? 'All Systems Operational' : 'Backend Offline'}
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
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.success }}></div>
                {currentEnv} <ChevronDown size={14} />
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
              <Route path="/" element={<Overview nodes={nodes} workloads={workloads} isHealthy={isHealthy} isLoading={isLoading} />} />
              <Route path="/nodes" element={<NodesPage nodes={filteredNodes} refresh={fetchData} role={role} isLoading={isLoading} />} />
              <Route path="/workloads" element={<WorkloadsPage workloads={filteredWorkloads} refresh={fetchData} role={role} isLoading={isLoading} />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

const Overview = ({ nodes, workloads, isHealthy, isLoading }: any) => {
  if (isLoading) return <div style={{ padding: '20px', color: 'white' }}>Loading...</div>;
  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', color: 'white' }}>Cluster Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: C.card, padding: '20px', borderRadius: '8px', color: 'white' }}>
          <p style={{ margin: '0 0 8px 0', color: C.muted }}>Nodes</p>
          <h2 style={{ margin: 0 }}>{nodes.length}</h2>
        </div>
        <div style={{ backgroundColor: C.card, padding: '20px', borderRadius: '8px', color: 'white' }}>
          <p style={{ margin: '0 0 8px 0', color: C.muted }}>Workloads</p>
          <h2 style={{ margin: 0 }}>{workloads.length}</h2>
        </div>
        <div style={{ backgroundColor: C.card, padding: '20px', borderRadius: '8px', color: 'white' }}>
          <p style={{ margin: '0 0 8px 0', color: C.muted }}>Health</p>
          <h2 style={{ margin: 0, color: isHealthy ? C.success : C.danger }}>{isHealthy ? 'Healthy' : 'Offline'}</h2>
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
        <h1 style={{ margin: 0, fontSize: '24px', color: 'white' }}>Compute Nodes</h1>
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
      <div style={{ backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, color: 'white', padding: '20px' }}>
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
        <h1 style={{ margin: 0, fontSize: '24px', color: 'white' }}>Deployments</h1>
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
      <div style={{ backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}`, color: 'white', padding: '20px' }}>
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
