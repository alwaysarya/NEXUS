import { useEffect, useState } from 'react';
import { Server, Activity, Box, LogOut, Plus, Trash2, Play, Shield, Database, Cpu, Network, Zap } from 'lucide-react';

interface Node { id: string; hostname: string; ip_address: string; status: string; cpu_cores: number; memory_mb: number; }
interface Workload { id: string; name: string; image: string; status: string; node_id: string | null; cpu_required: number; memory_required: number; }

// Premium Glassmorphism Styles
const glassCard = {
  backgroundColor: 'rgba(20, 20, 25, 0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  color: '#fff',
  padding: '24px',
  transition: 'transform 0.3s ease, boxShadow 0.3s ease'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  color: '#fff',
  marginBottom: '16px',
  outline: 'none',
  transition: 'borderColor 0.2s',
  boxSizing: 'border-box' as const,
  fontSize: '14px'
};

const btnStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#fff',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  transition: 'transform 0.2s, filter 0.2s',
  fontSize: '15px'
};

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexus_role'));
  const [isRegister, setIsRegister] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regRole, setRegRole] = useState('viewer');
  const [loginError, setLoginError] = useState('');

  const [nodes, setNodes] = useState<Node[]>([]);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [hostname, setHostname] = useState(''); const [ipAddress, setIpAddress] = useState(''); const [cpuCores, setCpuCores] = useState(''); const [memoryMB, setMemoryMB] = useState('');
  const [wlName, setWlName] = useState(''); const [wlImage, setWlImage] = useState(''); const [wlCpu, setWlCpu] = useState(''); const [wlMem, setWlMem] = useState('');

  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const fetchData = () => {
    if (!token) return;
    fetch('/api/v1/nodes', { headers: getHeaders() }).then(res => { if(res.status === 401) handleLogout(); return res.json(); }).then(data => setNodes(data || []));
    fetch('/api/v1/workloads', { headers: getHeaders() }).then(res => res.json()).then(data => setWorkloads(data || []));
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isRegister ? '/api/v1/register' : '/api/v1/login';
    const body = isRegister ? { username, password, role: regRole } : { username, password };
    fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(res => { if (!res.ok) throw new Error(isRegister ? 'Registration failed' : 'Invalid credentials'); return res.json(); })
    .then(data => {
      if (isRegister) { alert('User created! Please login.'); setIsRegister(false); } 
      else {
        const decoded: any = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('nexus_token', data.token); localStorage.setItem('nexus_role', decoded.role);
        setToken(data.token); setRole(decoded.role); setLoginError('');
      }
    }).catch(err => setLoginError(err.message));
  };

  const handleLogout = () => { localStorage.removeItem('nexus_token'); localStorage.removeItem('nexus_role'); setToken(null); setRole(null); };

  const handleRegisterNode = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/nodes', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ hostname, ip_address: ipAddress, cpu_cores: parseInt(cpuCores), memory_mb: parseInt(memoryMB) }) }).then(() => { setHostname(''); setIpAddress(''); setCpuCores(''); setMemoryMB(''); fetchData(); });
  };

  const handleCreateWorkload = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/workloads', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name: wlName, image: wlImage, cpu_required: parseInt(wlCpu), memory_required: parseInt(wlMem) }) }).then(() => { setWlName(''); setWlImage(''); setWlCpu(''); setWlMem(''); fetchData(); });
  };

  const handleSchedule = (id: string) => { fetch(`/api/v1/workloads/${id}/schedule`, { method: 'POST', headers: getHeaders() }).then(() => fetchData()); };
  const handleDeleteNode = (id: string) => { if (confirm('Delete this node?')) fetch(`/api/v1/nodes/${id}`, { method: 'DELETE', headers: getHeaders() }).then(() => fetchData()); };

  // GLOBAL BACKGROUND WITH ANIMATED BLOBS
  const renderBackground = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: -1, backgroundColor: '#09090b' }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }}></div>
    </div>
  );

  if (!token) {
    return (
      <>
        {renderBackground()}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{ ...glassCard, width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '20px' }}>
                <Shield size={48} color="#6366f1" />
              </div>
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px', fontWeight: '700' }}>NEXUS</h2>
            <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '32px', fontSize: '14px' }}>Infrastructure Command Center</p>
            
            {loginError && <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>{loginError}</div>}
            
            <form onSubmit={handleLogin}>
              <input style={inputStyle} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              {isRegister && (
                <select style={inputStyle} value={regRole} onChange={e => setRegRole(e.target.value)}>
                  <option value="viewer">Viewer (Read Only)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              )}
              <button type="submit" style={btnStyle} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}>
                {isRegister ? 'Create Account' : 'Authenticate'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', cursor: 'pointer', color: '#a1a1aa', transition: 'color 0.2s' }} onClick={() => setIsRegister(!isRegister)} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}>
              {isRegister ? 'Already registered? Sign In' : 'Request Access / Create Account'}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {renderBackground()}
      <div style={{ padding: '40px 60px', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', color: '#fff' }}>
        
        {/* Top Navbar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
              <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS</div>
              <span style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: '500' }}>{role === 'admin' ? 'ADMIN' : 'VIEWER'}</span>
            </h1>
            <p style={{ margin: '6px 0 0 0', color: '#71717a', fontSize: '14px' }}>System Status: <span style={{color: '#10b981'}}>Operational</span></p>
          </div>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontSize: '14px' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}>
            <LogOut size={16} /> Sign Out
          </button>
        </header>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {[ 
            { label: 'Total Nodes', val: nodes.length, icon: <Server size={24} />, color: '#6366f1' },
            { label: 'Active Nodes', val: nodes.filter(n => n.status === 'active').length, icon: <Activity size={24} />, color: '#10b981' },
            { label: 'Workloads', val: workloads.length, icon: <Box size={24} />, color: '#f59e0b' },
            { label: 'System Health', val: '100%', icon: <Zap size={24} />, color: '#a855f7' }
          ].map((stat, i) => (
            <div key={i} style={glassCard} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#a1a1aa', fontSize: '14px', fontWeight: '500' }}>{stat.label}</span>
                <div style={{ color: stat.color, backgroundColor: `${stat.color}15`, padding: '8px', borderRadius: '10px' }}>{stat.icon}</div>
              </div>
              <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '700', letterSpacing: '-1px' }}>{stat.val}</h2>
            </div>
          ))}
        </div>

        {/* Forms */}
        {role === 'admin' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div style={glassCard}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '24px' }}><Server size={20} color="#6366f1"/> Provision Node</h3>
              <form onSubmit={handleRegisterNode}>
                <input style={inputStyle} placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
                <input style={inputStyle} placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input style={inputStyle} placeholder="CPU Cores" type="number" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required />
                  <input style={inputStyle} placeholder="Memory (MB)" type="number" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required />
                </div>
                <button type="submit" style={btnStyle} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}><Plus size={18} /> Register Node</button>
              </form>
            </div>

            <div style={glassCard}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', marginBottom: '24px' }}><Box size={20} color="#f59e0b"/> Deploy Workload</h3>
              <form onSubmit={handleCreateWorkload}>
                <input style={inputStyle} placeholder="Workload Name" value={wlName} onChange={e => setWlName(e.target.value)} required />
                <input style={inputStyle} placeholder="Docker Image (e.g. nginx)" value={wlImage} onChange={e => setWlImage(e.target.value)} required />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input style={inputStyle} placeholder="CPU Required" type="number" value={wlCpu} onChange={e => setWlCpu(e.target.value)} required />
                  <input style={inputStyle} placeholder="Memory (MB)" type="number" value={wlMem} onChange={e => setWlMem(e.target.value)} required />
                </div>
                <button type="submit" style={{...btnStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'}} onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}><Play size={18} /> Deploy</button>
              </form>
            </div>
          </div>
        )}

        {/* Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          <div style={glassCard}>
            <h3 style={{ marginTop: 0, fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Database size={20} color="#6366f1"/> Compute Nodes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 12px', fontWeight: '600' }}>Hostname</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>IP Address</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>Status</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>Resources</th>{role === 'admin' && <th style={{ padding: '16px 12px', fontWeight: '600' }}>Actions</th>}
              </tr></thead>
              <tbody>
                {nodes.map(n => (
                  <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'backgroundColor 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 12px', fontWeight: '500' }}>{n.hostname}</td>
                    <td style={{ padding: '16px 12px', color: '#a1a1aa', fontFamily: 'monospace' }}>{n.ip_address}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: n.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: n.status === 'active' ? '#10b981' : '#f59e0b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: n.status === 'active' ? '#10b981' : '#f59e0b' }}></span>
                        {n.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', display: 'flex', gap: '16px', color: '#a1a1aa', fontSize: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Cpu size={14}/> {n.cpu_cores} Cores</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={14}/> {n.memory_mb} MB</span>
                    </td>
                    {role === 'admin' && (
                      <td style={{ padding: '16px 12px' }}>
                        <button onClick={() => handleDeleteNode(n.id)} style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.2)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}><Trash2 size={16} /></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={glassCard}>
            <h3 style={{ marginTop: 0, fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Network size={20} color="#f59e0b"/> Active Workloads</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 12px', fontWeight: '600' }}>Name</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>Image</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>Status</th><th style={{ padding: '16px 12px', fontWeight: '600' }}>Node ID</th>{role === 'admin' && <th style={{ padding: '16px 12px', fontWeight: '600' }}>Actions</th>}
              </tr></thead>
              <tbody>
                {workloads.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'backgroundColor 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 12px', fontWeight: '500' }}>{w.name}</td>
                    <td style={{ padding: '16px 12px', color: '#a1a1aa', fontFamily: 'monospace' }}>{w.image}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: w.status === 'running' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: w.status === 'running' ? '#10b981' : '#f59e0b' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: w.status === 'running' ? '#10b981' : '#f59e0b' }}></span>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#a1a1aa', fontFamily: 'monospace', fontSize: '13px' }}>{w.node_id ? w.node_id.substring(0, 12) + '...' : 'Unassigned'}</td>
                    {role === 'admin' && (
                      <td style={{ padding: '16px 12px' }}>
                        {w.status === 'pending' && <button onClick={() => handleSchedule(w.id)} style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.2)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.1)'}><Play size={14}/> Schedule</button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
