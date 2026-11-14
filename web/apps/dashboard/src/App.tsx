import { useEffect, useState } from 'react';

interface Node {
  id: string;
  hostname: string;
  ip_address: string;
  status: string;
  cpu_cores: number;
  memory_mb: number;
}

interface Workload {
  id: string;
  name: string;
  image: string;
  status: string;
  node_id: string | null;
  cpu_required: number;
  memory_required: number;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexus_token'));
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  
  // Node form state
  const [hostname, setHostname] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [cpuCores, setCpuCores] = useState('');
  const [memoryMB, setMemoryMB] = useState('');

  // Workload form state
  const [wlName, setWlName] = useState('');
  const [wlImage, setWlImage] = useState('');
  const [wlCpu, setWlCpu] = useState('');
  const [wlMem, setWlMem] = useState('');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const fetchData = () => {
    if (!token) return;
    fetch('/api/v1/nodes', { headers: getHeaders() })
      .then(res => { if(res.status === 401) handleLogout(); return res.json(); })
      .then(data => setNodes(data || []));
      
    fetch('/api/v1/workloads', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setWorkloads(data || []));
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => {
      if (!res.ok) throw new Error('Invalid credentials');
      return res.json();
    })
    .then(data => {
      localStorage.setItem('nexus_token', data.token);
      setToken(data.token);
      setLoginError('');
    })
    .catch(err => setLoginError(err.message));
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
  };

  const handleRegisterNode = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/nodes', {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ hostname, ip_address: ipAddress, cpu_cores: parseInt(cpuCores), memory_mb: parseInt(memoryMB) })
    }).then(() => { setHostname(''); setIpAddress(''); setCpuCores(''); setMemoryMB(''); fetchData(); });
  };

  const handleCreateWorkload = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/workloads', {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ name: wlName, image: wlImage, cpu_required: parseInt(wlCpu), memory_required: parseInt(wlMem) })
    }).then(() => { setWlName(''); setWlImage(''); setWlCpu(''); setWlMem(''); fetchData(); });
  };

  const handleSchedule = (id: string) => {
    fetch(`/api/v1/workloads/${id}/schedule`, { method: 'POST', headers: getHeaders() }).then(() => fetchData());
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'pending' : 'active';
    fetch(`/api/v1/nodes/${id}/status`, {
      method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status: newStatus })
    }).then(() => fetchData());
  };

  const handleDeleteNode = (id: string) => {
    if (confirm('Delete this node?')) {
      fetch(`/api/v1/nodes/${id}`, { method: 'DELETE', headers: getHeaders() }).then(() => fetchData());
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
        <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>NEXUS Login</h2>
          {loginError && <p style={{ color: 'red', fontSize: '14px' }}>{loginError}</p>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Username (admin)" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Password (admin123)" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>NEXUS Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      {/* Metrics */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', width: '150px' }}>
          <h4>Total Nodes</h4><h2>{nodes.length}</h2>
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', width: '150px' }}>
          <h4>Active Nodes</h4><h2 style={{ color: 'green' }}>{nodes.filter(n => n.status === 'active').length}</h2>
        </div>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', width: '150px' }}>
          <h4>Workloads</h4><h2>{workloads.length}</h2>
        </div>
      </div>

      {/* Forms */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ccc', width: '300px' }}>
          <h3>Register Node</h3>
          <form onSubmit={handleRegisterNode} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
            <input placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
            <input placeholder="CPU Cores" type="number" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required />
            <input placeholder="Memory (MB)" type="number" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required />
            <button type="submit">Register Node</button>
          </form>
        </div>

        <div style={{ padding: '15px', border: '1px solid #ccc', width: '300px' }}>
          <h3>Create Workload</h3>
          <form onSubmit={handleCreateWorkload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input placeholder="Name" value={wlName} onChange={e => setWlName(e.target.value)} required />
            <input placeholder="Image (e.g. nginx)" value={wlImage} onChange={e => setWlImage(e.target.value)} required />
            <input placeholder="CPU Required" type="number" value={wlCpu} onChange={e => setWlCpu(e.target.value)} required />
            <input placeholder="Memory Required (MB)" type="number" value={wlMem} onChange={e => setWlMem(e.target.value)} required />
            <button type="submit">Create Workload</button>
          </form>
        </div>
      </div>

      {/* Nodes Table */}
      <h2>Nodes</h2>
      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '30px' }}>
        <thead><tr><th>Hostname</th><th>IP</th><th>Status</th><th>CPU</th><th>Memory</th><th>Actions</th></tr></thead>
        <tbody>
          {nodes.map(n => (
            <tr key={n.id}>
              <td>{n.hostname}</td><td>{n.ip_address}</td>
              <td style={{ color: n.status === 'active' ? 'green' : 'orange', fontWeight: 'bold' }}>{n.status}</td>
              <td>{n.cpu_cores}</td><td>{n.memory_mb}</td>
              <td>
                <button onClick={() => handleToggleStatus(n.id, n.status)} style={{ marginRight: '10px' }}>
                  {n.status === 'active' ? 'Mark Pending' : 'Mark Active'}
                </button>
                <button onClick={() => handleDeleteNode(n.id)} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Workloads Table */}
      <h2>Workloads</h2>
      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th>Name</th><th>Image</th><th>Status</th><th>Node ID</th><th>Actions</th></tr></thead>
        <tbody>
          {workloads.map(w => (
            <tr key={w.id}>
              <td>{w.name}</td><td>{w.image}</td>
              <td style={{ color: w.status === 'running' ? 'green' : 'orange', fontWeight: 'bold' }}>{w.status}</td>
              <td>{w.node_id ? w.node_id.substring(0, 8) + '...' : 'Unassigned'}</td>
              <td>
                {w.status === 'pending' && (
                  <button onClick={() => handleSchedule(w.id)}>Schedule</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
