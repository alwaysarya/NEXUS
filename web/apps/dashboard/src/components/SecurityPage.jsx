import { useSearchParams } from 'react-router-dom';
import { Shield, AlertTriangle, ShieldAlert, Lock, Activity, MoreHorizontal, Users, Key, CheckCircle2, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const threatData = [ { name: 'Critical', value: 2, color: '#ef4444' }, { name: 'High', value: 3, color: '#f97316' }, { name: 'Medium', value: 1, color: '#eab308' }, { name: 'Low', value: 1, color: '#6b7280' } ];
const threatAreaData = [ { time: '00:00', v: 2 }, { time: '04:00', v: 3 }, { time: '08:00', v: 5 }, { time: '12:00', v: 4 }, { time: '16:00', v: 7 }, { time: '20:00', v: 7 } ];
const accessData = [ { time: '00:00', success: 3000, failed: 200 }, { time: '04:00', success: 2000, failed: 150 }, { time: '08:00', success: 5000, failed: 800 }, { time: '12:00', success: 4000, failed: 600 }, { time: '16:00', success: 4500, failed: 700 }, { time: '20:00', success: 3500, failed: 400 } ];

const threatsList = [
  { id: 'INC-892', title: 'Suspicious Admin Login', severity: 'Critical', time: '2 min ago', status: 'New', target: 'admin@nexus.io' },
  { id: 'INC-891', title: 'Unauthorized API Access', severity: 'High', time: '8 min ago', status: 'Investigating', target: '/v1/secrets' },
  { id: 'INC-890', title: 'Data Exfiltration Attempt', severity: 'High', time: '13 min ago', status: 'Contained', target: 'db-production' },
  { id: 'INC-889', title: 'Policy Violation', severity: 'Medium', time: '17 min ago', status: 'Resolved', target: 's3-bucket-logs' },
  { id: 'INC-888', title: 'MFA Bypass Attempt', severity: 'Critical', time: '1 hr ago', status: 'Investigating', target: 'auth-service' },
  { id: 'INC-887', title: 'Port Scanning Detected', severity: 'Low', time: '2 hrs ago', status: 'Resolved', target: '10.0.1.0/24' },
];

const identityData = [
  { id: 'USR-001', name: 'Aman Verma', email: 'aman@nexus.io', role: 'Admin', mfa: 'Enabled', lastLogin: '2 mins ago', status: 'Active' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya@nexus.io', role: 'DevOps', mfa: 'Enabled', lastLogin: '1 hr ago', status: 'Active' },
  { id: 'USR-003', name: 'Rahul Singh', email: 'rahul@nexus.io', role: 'Developer', mfa: 'Enabled', lastLogin: '5 hrs ago', status: 'Active' },
  { id: 'USR-004', name: 'External Contractor', email: 'contractor@ext.com', role: 'Viewer', mfa: 'Disabled', lastLogin: '3 days ago', status: 'Suspended' },
  { id: 'USR-005', name: 'System Bot', email: 'bot@nexus.io', role: 'Service Account', mfa: 'N/A', lastLogin: 'Just now', status: 'Active' },
];

const policiesData = [
  { id: 'POL-001', name: 'Enforce MFA for Admins', description: 'Requires multi-factor authentication for all admin accounts.', status: 'Enforced', compliance: 100, type: 'Access' },
  { id: 'POL-002', name: 'Encrypt Data at Rest', description: 'Ensures all S3 and EBS volumes are encrypted.', status: 'Enforced', compliance: 98, type: 'Data' },
  { id: 'POL-003', name: 'No Public S3 Buckets', description: 'Prevents creation of publicly accessible S3 buckets.', status: 'Enforced', compliance: 100, type: 'Network' },
  { id: 'POL-004', name: 'Least Privilege Access', description: 'Ensures IAM roles do not have wildcard permissions.', status: 'Warning', compliance: 85, type: 'Access' },
  { id: 'POL-005', name: 'Enable CloudTrail Logs', description: 'Required for SOC2 compliance and audit trails.', status: 'Enforced', compliance: 100, type: 'Audit' },
  { id: 'POL-006', name: 'Restrict Inbound SSH', description: 'Only allows SSH from bastion host IPs.', status: 'Enforced', compliance: 95, type: 'Network' },
];

const auditLogsData = [
  { time: '15:04:22', user: 'admin@nexus.io', action: 'Role Updated', resource: 'rbac/role/devops', status: 'Success', ip: '10.0.1.45' },
  { time: '15:02:10', user: 'secops@nexus.io', action: 'Policy Modified', resource: 'policy/network/ingress', status: 'Success', ip: '10.0.1.88' },
  { time: '14:58:45', user: 'user@external.com', action: 'Access Denied', resource: 'api/v1/clusters', status: 'Blocked', ip: '192.168.1.100' },
  { time: '14:55:12', user: 'dev@nexus.io', action: 'Resource Deleted', resource: 'k8s/pod/test-app-123', status: 'Success', ip: '10.0.2.17' },
  { time: '14:50:00', user: 'user@external.com', action: 'Failed Login (5 attempts)', resource: 'auth/login', status: 'Blocked', ip: '192.168.1.100' },
  { time: '14:45:30', user: 'system', action: 'Auto-Scaling Triggered', resource: 'asg/worker-nodes', status: 'Success', ip: 'internal' },
  { time: '14:30:15', user: 'admin@nexus.io', action: 'MFA Enabled', resource: 'user/admin@nexus.io', status: 'Success', ip: '10.0.1.45' },
  { time: '14:15:00', user: 'bot@nexus.io', action: 'Token Refreshed', resource: 'auth/token', status: 'Success', ip: '10.0.3.5' },
];

export default function SecurityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><Shield className="text-primary" size={24} /> Security Operations Center</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time threat detection, access control, and security posture for NEXUS.</p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border text-sm text-gray-400">
        {['Overview', 'Threats', 'Identity', 'Policies', 'Audit', 'RBAC'].map((tab) => (
          <div key={tab} onClick={() => setSearchParams({ tab: tab.toLowerCase() })} className={`pb-2 cursor-pointer ${currentTab === tab.toLowerCase() ? 'text-white border-b-2 border-primary font-medium' : 'hover:text-white'}`}>
            {tab === 'RBAC' ? 'RBAC Matrix' : tab === 'Threats' ? 'Threats & Incidents' : tab === 'Identity' ? 'Identity & Access' : tab === 'Policies' ? 'Policies & Compliance' : tab === 'Audit' ? 'Audit Logs' : tab}
          </div>
        ))}
      </div>

      {currentTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Threats', value: '7', change: '+2', icon: ShieldAlert, color: '#ef4444' },
              { label: 'Security Incidents', value: '18', change: '+5', icon: AlertTriangle, color: '#f97316' },
              { label: 'Blocked Access', value: '142', change: '+28', icon: Lock, color: '#ec4899' },
              { label: 'Security Posture', value: '96.8%', change: '+0.6%', icon: Shield, color: '#22c55e' },
            ].map((m) => (
              <div key={m.label} className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start text-sm text-gray-400"><div className="flex items-center gap-2"><m.icon size={16} style={{ color: m.color }}/> {m.label}</div><Activity size={12} style={{ color: m.color }}/></div>
                <div className="mt-2 flex items-end justify-between"><div className="text-2xl font-bold text-white">{m.value}</div><div className="text-xs" style={{ color: m.color }}>{m.change}</div></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2 bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Threat Overview</h3>
                <MoreHorizontal size={16} className="text-gray-500"/>
              </div>
              <div className="flex items-center h-48">
                <div className="w-1/3 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={threatData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">{threatData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie></PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-2xl font-bold text-white">7</span><span className="text-[10px] text-gray-400">Active Threats</span></div>
                </div>
                <div className="w-2/3 h-full">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={threatAreaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                      <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreat)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h4 className="text-xs text-gray-400 mb-2">Access Activity</h4>
                  <div className="flex gap-4 text-[10px] text-gray-400 mb-2"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-sm"></span> Successful</span><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-sm"></span> Failed</span></div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accessData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#121216', borderColor: '#27272a', fontSize: '12px' }} />
                        <Bar dataKey="success" stackId="a" fill="#22c55e" radius={[2, 2, 0, 0]} /><Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2"><h4 className="text-xs text-gray-400">Geographic Sign-ins</h4><span className="text-[10px] text-green-500 flex items-center gap-1"><span className="w-1 h-1 bg-green-500 rounded-full"></span> Live</span></div>
                  <div className="h-32 bg-background rounded border border-border flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#52525b 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                    <div className="z-10 text-gray-500 text-xs">[World Map]</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-medium text-white">Priority Incidents</h3><span className="text-xs text-primary cursor-pointer hover:underline">View All</span></div>
              <div className="space-y-4 flex-1">
                {threatsList.slice(0, 4).map((inc) => (
                  <div key={inc.id} className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center ${inc.severity === 'Critical' ? 'text-red-500 bg-red-500/10 border-red-500/20' : inc.severity === 'High' ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'}`}><AlertTriangle size={12} /></div>
                      <div><div className="text-sm text-gray-200 font-medium">{inc.title}</div><div className="text-[10px] text-gray-500 mt-1">{inc.time}</div></div>
                    </div>
                    <button className="text-xs border border-border px-2 py-1 rounded text-gray-300 hover:bg-white/5">Investigate</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {currentTab === 'threats' && (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><ShieldAlert size={14} className="text-red-500"/> Threat & Incident Log</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Incident ID</th>
                <th className="px-4 py-2 font-medium">Threat Description</th>
                <th className="px-4 py-2 font-medium">Severity</th>
                <th className="px-4 py-2 font-medium">Target</th>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {threatsList.map((threat) => (
                <tr key={threat.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-primary font-mono">{threat.id}</td>
                  <td className="px-4 py-2.5 text-white font-medium">{threat.title}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 w-fit ${
                      threat.severity === 'Critical' ? 'text-red-500 bg-red-500/10' : 
                      threat.severity === 'High' ? 'text-orange-500 bg-orange-500/10' : 'text-yellow-500 bg-yellow-500/10'
                    }`}>
                      <ShieldAlert size={12}/> {threat.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-400">{threat.target}</td>
                  <td className="px-4 py-2.5 text-gray-500">{threat.time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded border ${threat.status === 'New' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : threat.status === 'Investigating' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' : threat.status === 'Contained' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 'text-green-500 border-green-500/20 bg-green-500/5'}`}>
                      {threat.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                     <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">Investigate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentTab === 'identity' && (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Users size={14} className="text-primary"/> Identity & Access Management</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">MFA Status</th>
                <th className="px-4 py-2 font-medium">Last Login</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {identityData.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-500 text-[10px]">{user.email}</div>
                  </td>
                  <td className="px-4 py-2.5"><span className="bg-background border border-border px-1.5 py-0.5 rounded">{user.role}</span></td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 w-fit ${
                      user.mfa === 'Enabled' ? 'text-green-500 bg-green-500/10' : user.mfa === 'Disabled' ? 'text-red-500 bg-red-500/10' : 'text-gray-500 bg-gray-500/10'
                    }`}>
                      <Key size={12}/> {user.mfa}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{user.lastLogin}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded border ${user.status === 'Active' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                     <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentTab === 'policies' && (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Shield size={14} className="text-primary"/> Compliance Policies</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Policy ID</th>
                <th className="px-4 py-2 font-medium">Policy Name</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Compliance %</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {policiesData.map((policy) => (
                <tr key={policy.id} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-gray-500 font-mono">{policy.id}</td>
                  <td className="px-4 py-2.5">
                    <div className="text-white font-medium">{policy.name}</div>
                    <div className="text-gray-500 text-[10px]">{policy.description}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400">{policy.type}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-border rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${policy.compliance === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${policy.compliance}%`}}></div>
                      </div>
                      <span className="text-gray-300">{policy.compliance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded border flex items-center gap-1 w-fit ${policy.status === 'Enforced' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'}`}>
                      {policy.status === 'Enforced' ? <CheckCircle2 size={12}/> : <AlertTriangle size={12}/>} {policy.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                     <button className="border border-border text-gray-300 px-2 py-1 rounded hover:bg-white/5">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentTab === 'audit' && (
        <div className="bg-surface border border-border rounded-xl flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-sm font-medium text-white flex items-center gap-2"><Activity size={14} className="text-primary"/> System Audit Logs</h3>
          </div>
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="text-gray-500 uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Action</th>
                <th className="px-4 py-2 font-medium">Resource</th>
                <th className="px-4 py-2 font-medium">IP Address</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogsData.map((log, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-gray-500 font-mono">{log.time}</td>
                  <td className="px-4 py-2.5 text-white">{log.user}</td>
                  <td className="px-4 py-2.5 text-gray-300">{log.action}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-400">{log.resource}</td>
                  <td className="px-4 py-2.5 font-mono text-gray-500">{log.ip}</td>
                  <td className="px-4 py-2.5">
                    <span className={`flex items-center gap-1 ${log.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>
                      {log.status === 'Success' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>} {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentTab === 'rbac' && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">RBAC - Role Matrix</h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">Manage Roles →</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="text-gray-500"><tr><th className="font-medium pb-2">Role</th><th className="font-medium pb-2">Compute</th><th className="font-medium pb-2">Storage</th><th className="font-medium pb-2">Network</th><th className="font-medium pb-2">Security</th></tr></thead>
            <tbody className="text-gray-300">
              {['Platform Admin', 'Cluster Admin', 'DevOps', 'Developer', 'Viewer'].map(role => (
                <tr key={role} className="border-t border-border/50">
                  <td className="py-2 flex items-center gap-2"><Shield size={10} className="text-gray-500"/> {role}</td>
                  <td className="py-2 text-green-500">✓</td><td className="py-2 text-green-500">✓</td><td className="py-2 text-green-500">✓</td><td className="py-2 text-green-500">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!['overview', 'threats', 'identity', 'policies', 'audit', 'rbac'].includes(currentTab) && (
        <div className="bg-surface border border-border rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 h-64">
          <Shield size={32} className="mb-4 text-gray-600"/>
          <h2 className="text-lg text-white font-medium mb-1">No {currentTab} Data</h2>
          <p className="text-sm">This section is currently empty.</p>
        </div>
      )}
    </div>
  );
}
