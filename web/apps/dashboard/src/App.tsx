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

  useEffect(() => {
    fetch('/api/v1/nodes')
      .then(res => res.json())
      .then(data => setNodes(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>NEXUS Dashboard</h1>
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
              <td style={{ color: node.status === 'active' ? 'green' : 'orange' }}>
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
