import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, Box, LogOut, Shield, Bell, User, Settings, Activity, Search, ChevronRight, Cpu, Database, Play, Plus, Trash2, ShieldAlert, Globe, HardDrive, Terminal, HelpCircle, MoreHorizontal, ChevronDown, CheckCircle2, AlertCircle, XCircle, Network } from 'lucide-react';

const C = { bg: '#09090b', sidebar: '#0f0f13', card: '#121216', cardHover: '#1a1a20', border: '#27272a', primary: '#6366f1', success: '#22c55e', warning: '#eab308', danger: '#ef4444', text: '#f4f4f5', muted: '#a1a1aa' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, marginBottom: '12px', outline: 'none', fontSize: '14px' };
const btnStyle = { padding: '8px 16px', borderRadius: '6px', border: 'none', background: C.primary, color: '#fff', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '14px' };

const DashboardLayout = ({ children, role, handleLogout, isHealthy }: any) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { path: '/nodes', label: 'Clusters', icon: <Server size={18} /> },
    { path: '/workloads', label: 'Workloads', icon: <Box size={18} /> },
    { path: '/security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '240px', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', backgroundColor: C.sidebar }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'white', borderRadius: '6px' }}><span style={{ color: 'black', fontWeight: 'bold', fontSize: '18px' }}>N</span></div>
          <span style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>NEXUS</span>
        </div>
        <div style={{ padding: '10px', flex: 1, marginTop: '10px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: C.muted }}>
            <span>Cluster</span><span>/</span><span style={{ color: C.text, fontWeight: '500' }}>prod-eks-01</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: `1px solid ${C.border}`, borderRadius: '4px', marginLeft: '8px', fontSize: '12px' }}><CheckCircle2 size={12} color={C.success} /> Healthy</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: C.sidebar, border: `1px solid ${C.border}`, padding: '6px 12px', borderRadius: '6px', width: '300px' }}>
              <Search size={14} color={C.muted} /><input type="text" placeholder="Search resources..." style={{ background: 'transparent', border: 'none', color: C.text, outline: 'none', width: '100%', fontSize: '13px' }} />
            </div>
            <Bell size={18} color={C.muted} cursor="pointer" /><HelpCircle size={18} color={C.muted} cursor="pointer" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>A</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '13px', fontWeight: '500' }}>Admin</span><span style={{ fontSize: '11px', color: C.muted }}>Platform Admin</span></div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexus_role'));
  const [nodes, setNodes] = useState<any[]>([]); const [workloads, setWorkloads] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>(null); const [isHealthy, setIsHealthy] = useState<boolean>(true);

  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  const fetchData = () => {
    if (!token) return;
    fetch('/api/v1/nodes', { headers: getHeaders() }).then(res => res.json()).then(data => setNodes(data || [])).catch(() => setIsHealthy(false));
    fetch('/api/v1/workloads', { headers: getHeaders() }).then(res => res.json()).then(data => setWorkloads(data || []));
    fetch('/api/v1/system/stats', { headers: getHeaders() }).then(res => res.json()).then(data => setSysStats(data));
    fetch('/health/ready').then(res => setIsHealthy(res.ok)).catch(() => setIsHealthy(false));
  };

  useEffect(() => { if (token) { fetchData(); const interval = setInterval(fetchData, 3000); return () => clearInterval(interval); } }, [token]);

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
          <button type="submit" style={{ ...btnStyle, width: '100%', padding: '10px' }}>Sign In</button>
        </form>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <DashboardLayout role={role} handleLogout={handleLogout} isHealthy={isHealthy}>
        <Routes>
          <Route path="/" element={<Overview nodes={nodes} workloads={workloads} isHealthy={isHealthy} sysStats={sysStats} />} />
          <Route path="/nodes" element={<NodesPage nodes={nodes} refresh={fetchData} role={role} />} />
          <Route path="/workloads" element={<WorkloadsPage workloads={workloads} refresh={fetchData} role={role} />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

const Overview = ({ nodes, workloads, isHealthy, sysStats }: any) => {
  const realCpuPercent = sysStats ? Math.min((sysStats.goroutines * 2.5), 100).toFixed(1) : "0.0";
  const realMemPercent = sysStats ? Math.min(((sysStats.allocated_mb / 1024) * 100), 100).toFixed(1) : "0.0";

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div><h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Cluster Overview</h1><p style={{ margin: '4px 0 0 0', color: C.muted, fontSize: '14px' }}>Monitor your infrastructure health and resource usage.</p></div>
        <div style={{ display: 'flex', gap: '8px' }}><button style={{ ...btnStyle, background: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>Last 15 min <ChevronDown size={14}/></button></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Cluster Health', val: isHealthy ? 'Healthy' : 'Offline', sub: isHealthy ? 'All systems nominal' : 'Check backend', icon: <CheckCircle2 size={16} color={isHealthy ? C.success : C.danger} />, color: isHealthy ? C.success : C.danger },
          { label: 'Nodes', val: nodes.length, sub: `${nodes.filter((n: any) => n.status === 'active').length} Ready`, icon: <Server size={16} color={C.muted} />, color: C.text },
          { label: 'Pods / Workloads', val: workloads.length, sub: `${workloads.filter((w: any) => w.status === 'running').length} Running`, icon: <Box size={16} color={C.muted} />, color: C.text },
          { label: 'System Uptime', val: '99.98%', sub: 'Last 30 days', icon: <Activity size={16} color={C.muted} />, color: C.text },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}><span style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>{stat.label}</span>{stat.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: stat.color, marginBottom: '4px' }}>{stat.val}</div><div style={{ fontSize: '12px', color: C.muted }}>{stat.sub}</div>
          </div>
        ))}
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
                {nodes.slice(0, 3).map((n: any, i: number) => (
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
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Nodes ({nodes.length})</h2>
              <input type="text" placeholder="Search nodes..." style={{ ...inputStyle, marginBottom: 0, padding: '6px 10px', width: '200px', fontSize: '13px' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
                <th style={{ padding: '12px 20px', fontWeight: '500' }}>Name</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Instance Type</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>CPU</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Memory</th>
              </tr></thead>
              <tbody>
                {nodes.map((n: any) => (
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

const NodesPage = ({ nodes, refresh, role }: any) => {
  const [hostname, setHostname] = useState(''); const [ipAddress, setIpAddress] = useState(''); const [cpuCores, setCpuCores] = useState(''); const [memoryMB, setMemoryMB] = useState('');
  
  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/nodes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ hostname, ip_address: ipAddress, cpu_cores: parseInt(cpuCores), memory_mb: parseInt(memoryMB) }) }).then(() => { setHostname(''); setIpAddress(''); setCpuCores(''); setMemoryMB(''); refresh(); });
  };
  const handleDelete = (id: string) => { if(confirm('Delete node?')) fetch(`/api/v1/nodes/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } }).then(() => refresh()); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Compute Nodes</h1>
        {role === 'admin' && <button style={{ ...btnStyle, background: C.primary }}><Plus size={16}/> Add Node</button>}
      </div>
      {role === 'admin' && (
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Provision New Node</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="CPU Cores" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="Memory (MB)" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required />
            <button type="submit" style={{ ...btnStyle }}>Register</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px 20px', fontWeight: '500' }}>Hostname</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>IP Address</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>CPU</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Memory</th>{role === 'admin' && <th style={{ padding: '12px 20px', fontWeight: '500' }}>Actions</th>}
          </tr></thead>
          <tbody>
            {nodes.map((n: any) => (
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

const WorkloadsPage = ({ workloads, refresh, role }: any) => {
  const [name, setName] = useState(''); const [image, setImage] = useState(''); const [cpu, setCpu] = useState(''); const [mem, setMem] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch('/api/v1/workloads', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` }, body: JSON.stringify({ name, image, cpu_required: parseInt(cpu), memory_required: parseInt(mem) }) }).then(() => { setName(''); setImage(''); setCpu(''); setMem(''); refresh(); });
  };
  const handleSchedule = (id: string) => { fetch(`/api/v1/workloads/${id}/schedule`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('nexus_token')}` } }).then(() => refresh()); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Deployments</h1>
        {role === 'admin' && <button style={{ ...btnStyle, background: C.primary }}><Plus size={16}/> Create Release</button>}
      </div>
      {role === 'admin' && (
        <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600' }}>Deploy New Workload</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Workload Name" value={name} onChange={e => setName(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Docker Image" value={image} onChange={e => setImage(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="CPU" value={cpu} onChange={e => setCpu(e.target.value)} required />
            <input style={{ ...inputStyle, marginBottom: 0 }} type="number" placeholder="Memory" value={mem} onChange={e => setMem(e.target.value)} required />
            <button type="submit" style={{ ...btnStyle }}>Deploy</button>
          </form>
        </div>
      )}
      <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead><tr style={{ borderBottom: `1px solid ${C.border}`, color: C.muted }}>
            <th style={{ padding: '12px 20px', fontWeight: '500' }}>Name</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Image</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Status</th><th style={{ padding: '12px 20px', fontWeight: '500' }}>Node</th>{role === 'admin' && <th style={{ padding: '12px 20px', fontWeight: '500' }}>Actions</th>}
          </tr></thead>
          <tbody>
            {workloads.map((w: any) => (
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

export default App;
