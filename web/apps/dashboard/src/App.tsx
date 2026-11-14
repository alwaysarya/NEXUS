import { useEffect, useState } from 'react';

interface Node {
  id: string;
  hostname: string;
  ip_address: string;
  status: string;
  cpu_cores: number;
  memory_mb: number;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hostname, setHostname] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [cpuCores, setCpuCores] = useState('');
  const [memoryMB, setMemoryMB] = useState('');

  const fetchNodes = () => {
    fetch('/api/v1/nodes')
      .then(res => res.json())
      .then(data => setNodes(data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/v1/nodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hostname,
        ip_address: ipAddress,
        cpu_cores: parseInt(cpuCores),
        memory_mb: parseInt(memoryMB)
      })
    }).then(() => {
      setHostname('');
      setIpAddress('');
      setCpuCores('');
      setMemoryMB('');
      fetchNodes();
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>NEXUS Dashboard</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', width: '300px' }}>
        <h3>Register New Node</h3>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="Hostname" value={hostname} onChange={e => setHostname(e.target.value)} required />
          <input placeholder="IP Address" value={ipAddress} onChange={e => setIpAddress(e.target.value)} required />
          <input placeholder="CPU Cores" type="number" value={cpuCores} onChange={e => setCpuCores(e.target.value)} required />
          <input placeholder="Memory (MB)" type="number" value={memoryMB} onChange={e => setMemoryMB(e.target.value)} required />
          <button type="submit" style={{ padding: '8px', cursor: 'pointer' }}>Register Node</button>
        </form>
      </div>

      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Hostname</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>CPU Cores</th>
            <th>Memory (MB)</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map(node => (
            <tr key={node.id}>
              <td>{node.hostname}</td>
              <td>{node.ip_address}</td>
              <td style={{ color: node.status === 'active' ? 'green' : 'orange', fontWeight: 'bold' }}>
                {node.status}
              </td>
              <td>{node.cpu_cores}</td>
              <td>{node.memory_mb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
