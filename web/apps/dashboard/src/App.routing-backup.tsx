import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, Boxes,
  Check, ChevronDown, ChevronRight, CircleHelp, Cloud, Command,
  Cpu, Database, Globe2, HardDrive, LayoutDashboard, LifeBuoy,
  Menu, MoreHorizontal, Network, Plus, Search, Server, Settings,
  ShieldCheck, Sparkles, Zap, X
} from "lucide-react";

const API = "";

type Node = {
  id: string; hostname: string; cpu_cores: number; memory_mb: number;
  allocated_cpu_cores: number; allocated_memory_mb: number;
  available_cpu_cores: number; available_memory_mb: number;
  status: string;
};
type Workload = {
  id: string; node_id: string; cpu_cores: number; memory_mb: number;
  status: string; created_at: string;
};

const nav = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Nodes", icon: Server },
  { label: "Workloads", icon: Boxes }
];

function formatMemory(value: number) {
  return value >= 1024 ? `${(value / 1024).toFixed(1)} GB` : `${value} MB`;
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [active, setActive] = useState("Overview");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [workloadID, setWorkloadID] = useState("");
  const [workloadCPU, setWorkloadCPU] = useState("1");
  const [workloadRAM, setWorkloadRAM] = useState("512");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeKind, setNoticeKind] = useState<"success" | "error" | "info">("info");

  async function refresh() {
    try {
      const [nodeResponse, workloadResponse] = await Promise.all([
        fetch(`${API}/api/v1/nodes`),
        fetch(`${API}/api/v1/workloads`)
      ]);
      if (!nodeResponse.ok || !workloadResponse.ok) throw new Error("API unavailable");
      const nodeData = await nodeResponse.json();
      const workloadData = await workloadResponse.json();
      setNodes(nodeData.nodes ?? []);
      setWorkloads(workloadData.workloads ?? []);
      setConnected(true);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setConnected(false);
    }
  }

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const onlineNodes = nodes.filter(n => n.status === "online");
  const activeWorkloads = workloads.filter(w => w.status === "running");
  const totalCPU = nodes.reduce((s, n) => s + n.cpu_cores, 0);
  const usedCPU = nodes.reduce((s, n) => s + n.allocated_cpu_cores, 0);
  const totalRAM = nodes.reduce((s, n) => s + n.memory_mb, 0);
  const usedRAM = nodes.reduce((s, n) => s + n.allocated_memory_mb, 0);
  const cpuPercent = totalCPU ? Math.round(usedCPU / totalCPU * 100) : 0;
  const ramPercent = totalRAM ? Math.round(usedRAM / totalRAM * 100) : 0;

  const filteredNodes = useMemo(() => nodes.filter(n =>
    `${n.id} ${n.hostname}`.toLowerCase().includes(search.toLowerCase())
  ), [nodes, search]);

  async function createWorkload(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setNotice("");
    try {
      const response = await fetch(`${API}/api/v1/workloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workloadID, cpu_cores: Number(workloadCPU), memory_mb: Number(workloadRAM)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Workload creation failed");
      setNoticeKind("success");
      setNotice(`Workload ${data.id} successfully scheduled.`);
      setShowCreate(false);
      setWorkloadID("");
      await refresh();
    } catch (error) {
      setNoticeKind("error");
      setNotice(error instanceof Error ? error.message : "Workload creation failed");
    } finally {
      setCreating(false);
    }
  }

  async function completeWorkload(id: string) {
    try {
      const response = await fetch(`${API}/api/v1/workloads/${encodeURIComponent(id)}/complete`, {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Completion failed");
      setNoticeKind("success");
      setNotice(`Workload ${id} completed and resources released.`);
      await refresh();
    } catch (error) {
      setNoticeKind("error");
      setNotice(error instanceof Error ? error.message : "Workload completion failed");
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <button className="brand-home" aria-label="Go to NEXUS Overview" onClick={() => { setActive("Overview"); setSearch(""); setMobileMenu(false); }}>
            <div className="brand-mark"><span /></div>
            <span>NEXUS</span><span className="brand-version">CLOUD</span>
          </button>
          <button className="mobile-close" aria-label="Close navigation" onClick={() => setMobileMenu(false)}><X size={17}/></button>
        </div>

        <div className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-text"><strong>Acme Infrastructure</strong><span>Enterprise workspace</span></div>
          <ChevronDown size={15} className="muted"/>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="navigation">
          {nav.map(item => {
            const Icon = item.icon;
            return <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`}
              onClick={() => { setActive(item.label); setMobileMenu(false); }}>
              <Icon size={17}/><span>{item.label}</span>
              {item.label === "Nodes" && <span className="nav-count">{nodes.length}</span>}
            </button>;
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info"><strong>Administrator</strong><span>Platform owner</span></div>
            <MoreHorizontal size={19} className="muted"/>
          </div>
        </div>
      </aside>

      {mobileMenu && <div className="mobile-backdrop" onClick={() => setMobileMenu(false)}/>}

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="menu-button" onClick={() => setMobileMenu(true)}><Menu size={19}/></button>
            <span>Workspace</span><ChevronRight size={14}/><strong>{active}</strong>
          </div>
          <div className="top-actions">
            <label className="global-search">
              <Search size={15}/>
              <input
                aria-label="Search nodes and workloads"
                placeholder="Search nodes and workloads..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={13}/></button>}
            </label>
            <div className="environment"><span className="environment-dot"/> Production <ChevronDown size={13}/></div>
            <div className="top-divider"/>
            <button className="icon-button" onClick={refresh} title="Refresh"><Activity size={17}/></button>
            <button className="icon-button notification" onClick={() => setNotice("You're all caught up.")}><Bell size={17}/><i/></button>
            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="page-content">
          {active === "Overview" && <>
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line"/> COMMAND CENTER <span className="eyebrow-dot">/</span> 01</div>
              <h1>Infrastructure <span>overview.</span></h1>
              <p className="page-subtitle">Your entire cloud infrastructure, beautifully orchestrated.</p>
            </div>
            <div className="heading-actions">
              <div className={`connection-pill ${connected ? "is-connected" : ""}`}>
                <span className="pulse-dot"/>{connected ? "All systems operational" : "Control Plane disconnected"}
              </div>
              <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16}/> Deploy workload</button>
            </div>
          </section>

          {notice && <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} role="status" aria-live="polite" className={`notice notice-${noticeKind}`}>
            {noticeKind === "success" ? <Check size={15}/> : noticeKind === "error" ? <X size={15}/> : <Activity size={15}/>}
            <span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15}/></button>
          </motion.div>}

          <section className="metric-grid">
            <Metric icon={<Server/>} label="Total nodes" value={connected ? String(nodes.length).padStart(2,"0") : "—"} detail={`${onlineNodes.length} currently online`} tone="blue" trend="Live inventory"/>
            <Metric icon={<Cpu/>} label="CPU allocation" value={connected ? `${cpuPercent}%` : "—"} detail={`${usedCPU} of ${totalCPU} cores reserved`} tone="violet" trend="Cluster capacity"/>
            <Metric icon={<Database/>} label="Memory usage" value={connected ? `${ramPercent}%` : "—"} detail={`${formatMemory(usedRAM)} of ${formatMemory(totalRAM)}`} tone="cyan" trend="Resource pool"/>
            <Metric icon={<Boxes/>} label="Active workloads" value={connected ? String(activeWorkloads.length).padStart(2,"0") : "—"} detail={`${workloads.length} total recorded`} tone="amber" trend="Scheduling engine"/>
          </section>

          <section className="section-heading">
            <div><h2>Infrastructure topology</h2><p>A live view of your compute ecosystem</p></div>
            <div className="topology-tools"><span className="legend"><i className="legend-online"/> Online</span><span className="legend"><i className="legend-offline"/> Offline</span><button className="small-icon" onClick={refresh}><Activity size={15}/></button></div>
          </section>

          <section className="topology-layout">
            <div className="topology-card">
              <div className="topology-card-head"><div><span className="mini-label">NETWORK MAP</span><strong>Cluster architecture</strong></div><span className="live-tag"><i/> LIVE</span></div>
              <div className="topology-canvas">
                <div className="topo-grid"/>
                <svg className="topo-lines" viewBox="0 0 800 360" preserveAspectRatio="none">
                  <defs><linearGradient id="lineGrad"><stop stopColor="#527bff" stopOpacity=".05"/><stop offset=".5" stopColor="#668bff" stopOpacity=".8"/><stop offset="1" stopColor="#37d9ca" stopOpacity=".1"/></linearGradient></defs>
                  {[0,1,2,3].map(i => <path key={i} d={`M400 175 C${300-i*22} ${175-i*34}, ${200+i*12} ${80+i*38}, ${100+i*22} ${75+i*70}`} stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 7" className="flow-line"/>)}
                  {[0,1,2].map(i => <path key={i} d={`M400 175 C${500+i*15} ${175+i*22}, ${590-i*10} ${95+i*70}, ${700-i*18} ${70+i*85}`} stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 7" className="flow-line"/>)}
                </svg>
                <motion.div className="cloud-core" animate={{boxShadow:["0 0 35px #5d7bff20","0 0 65px #5d7bff48","0 0 35px #5d7bff20"]}} transition={{duration:3,repeat:Infinity}}>
                  <div className="core-icon"><Cloud size={29}/></div><strong>NEXUS CORE</strong><span>CONTROL PLANE</span><div className="core-status"><i/> OPERATIONAL</div>
                </motion.div>
                {Array.from({length:Math.min(Math.max(nodes.length,0),8)}).map((_,i) => {
                  const positions = [
                    {x:"12%",y:"20%"},{x:"28%",y:"8%"},{x:"72%",y:"10%"},{x:"88%",y:"25%"},
                    {x:"10%",y:"70%"},{x:"30%",y:"83%"},{x:"70%",y:"82%"},{x:"88%",y:"68%"}
                  ];
                  const node = nodes[i];
                  return <motion.button key={node?.id ?? i} className={`topo-node ${node?.status === "online" ? "node-online" : "node-offline"}`}
                    style={{left:positions[i].x,top:positions[i].y}} whileHover={{scale:1.07}}
                    onClick={() => node && setSelectedNode(node)}>
                    <div className="node-icon"><Server size={17}/><i/></div>
                    <strong>{node?.id ?? "Awaiting node"}</strong><span>{node?.status ?? "No registration"}</span>
                  </motion.button>;
                })}
                <div className="topology-coordinate">NEXUS NETWORK · GLOBAL VIEW</div>
                <div className="topology-zoom"><button onClick={() => setNotice("Topology zoom is optimized for this viewport.")}>+</button><button onClick={() => setNotice("Topology zoom is optimized for this viewport.")}>−</button></div>
              </div>
              <div className="topology-footer"><span><i className="legend-online"/> {onlineNodes.length} online nodes</span><span><i className="legend-offline"/> {nodes.length-onlineNodes.length} offline nodes</span><span className="topology-updated">Updated {lastUpdated || "waiting for API"}</span></div>
            </div>

            <aside className="health-card">
              <div className="health-head"><div><span className="mini-label">SYSTEM STATUS</span><strong>Infrastructure health</strong></div><ShieldCheck size={20}/></div>
              <div className="health-score"><div className="health-ring" style={{"--score":`${connected && nodes.length ? onlineNodes.length/nodes.length*100 : 0}%`} as React.CSSProperties}><div><strong>{connected && nodes.length ? Math.round(onlineNodes.length/nodes.length*100) : "—"}<small>{connected ? "%" : ""}</small></strong><span>HEALTH</span></div></div></div>
              <div className="health-list">
                <HealthRow label="Control Plane" value={connected ? "Connected" : "Disconnected"} ok={connected}/>
                <HealthRow label="Database" value="Not independently verified" ok={false}/>
                <HealthRow label="Node agents" value={`${onlineNodes.length} / ${nodes.length} online`} ok={onlineNodes.length>0}/>
                <HealthRow label="Workload engine" value={connected ? "Available" : "Unknown"} ok={connected}/>
              </div>
              <div className="health-foot"><span className="health-foot-icon"><Sparkles size={14}/></span><span>{connected ? "Infrastructure telemetry is syncing." : "Start the Control Plane to connect live telemetry."}</span></div>
            </aside>
          </section>

          <section className="lower-grid">
            <div className="panel resource-panel">
              <div className="panel-heading"><div><span className="mini-label">RESOURCE MONITOR</span><h3>Current allocation</h3></div><span className="live-tag">{connected ? "LIVE API" : "OFFLINE"}</span></div>
              <div className="allocation-meters">
                <div className="allocation-meter">
                  <div className="allocation-label"><span><Cpu size={14}/> CPU cores</span><strong>{connected ? `${usedCPU} / ${totalCPU}` : "Unavailable"}</strong></div>
                  <div className="allocation-track"><span className="allocation-fill cpu-fill" style={{width: `${connected ? cpuPercent : 0}%`}}/></div>
                  <small>{connected ? `${cpuPercent}% allocated` : "Waiting for Control Plane connection"}</small>
                </div>
                <div className="allocation-meter">
                  <div className="allocation-label"><span><Database size={14}/> Memory</span><strong>{connected ? `${formatMemory(usedRAM)} / ${formatMemory(totalRAM)}` : "Unavailable"}</strong></div>
                  <div className="allocation-track"><span className="allocation-fill ram-fill" style={{width: `${connected ? ramPercent : 0}%`}}/></div>
                  <small>{connected ? `${ramPercent}% allocated` : "Waiting for Control Plane connection"}</small>
                </div>
              </div>
              <div className="resource-totals"><div><span>Reserved CPU</span><strong>{connected ? `${usedCPU} / ${totalCPU} cores` : "—"}</strong></div><div><span>Reserved memory</span><strong>{connected ? `${formatMemory(usedRAM)} / ${formatMemory(totalRAM)}` : "—"}</strong></div></div>
              <p className="chart-disclaimer">Live reserved capacity from the Control Plane. Historical telemetry is not available yet.</p>
            </div>

            <div className="panel workloads-panel">
              <div className="panel-heading"><div><span className="mini-label">SCHEDULER</span><h3>Recent workloads</h3></div><button className="text-button" onClick={() => setActive("Workloads")}>View all <ArrowUpRight size={14}/></button></div>
              <div className="workload-list">
                {workloads.slice(0,5).map(w => <div className="workload-row" key={w.id}>
                  <div className="workload-icon"><Box size={16}/></div>
                  <div className="workload-details"><strong>{w.id}</strong><span>{w.cpu_cores} CPU · {formatMemory(w.memory_mb)}</span></div>
                  <span className={`status-label ${w.status === "running" ? "status-running" : "status-done"}`}>{w.status}</span>
                  {w.status === "running" && <button className="complete-button" title="Complete workload" onClick={() => completeWorkload(w.id)}><Check size={14}/></button>}
                </div>)}
                {!workloads.length && <div className="empty-state"><Boxes size={24}/><strong>No workloads yet</strong><span>Deploy your first workload to get started.</span></div>}
              </div>
              <button className="deploy-secondary" onClick={() => setShowCreate(true)}><Plus size={15}/> Create new workload</button>
            </div>
          </section>


          </>}

          {active === "Nodes" && <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">NEXUS / COMPUTE</div>
                <h1>Compute <span>nodes.</span></h1>
                <p className="page-subtitle">Registered workers and their available resources.</p>
              </div>
              <button className="primary-button" onClick={refresh}><Activity size={16}/> Refresh nodes</button>
            </section>
            <section className="panel data-page-panel">
              <div className="panel-heading">
                <div><span className="mini-label">NODE INVENTORY</span><h3>{filteredNodes.length} registered nodes</h3></div>
                <span className="live-tag">{connected ? "LIVE API" : "OFFLINE"}</span>
              </div>
              <div className="table-scroll">
                <table className="nexus-table">
                  <thead><tr><th>Node</th><th>Hostname</th><th>CPU</th><th>Memory</th><th>Status</th><th>Details</th></tr></thead>
                  <tbody>
                    {filteredNodes.map(node => <tr key={node.id}>
                      <td><strong>{node.id}</strong></td>
                      <td>{node.hostname}</td>
                      <td>{node.allocated_cpu_cores} / {node.cpu_cores}</td>
                      <td>{formatMemory(node.allocated_memory_mb)} / {formatMemory(node.memory_mb)}</td>
                      <td><span className={`status-label ${node.status === "online" ? "status-running" : "status-done"}`}>{node.status}</span></td>
                      <td><button className="text-button" onClick={() => setSelectedNode(node)}>View details</button></td>
                    </tr>)}
                    {!filteredNodes.length && <tr><td colSpan={6} className="table-empty">{search ? "No nodes match your search." : "No nodes registered yet."}</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>}

          {active === "Workloads" && <>
            <section className="page-heading">
              <div>
                <div className="eyebrow">NEXUS / SCHEDULER</div>
                <h1>Workload <span>manager.</span></h1>
                <p className="page-subtitle">Inspect scheduled workloads and manage their lifecycle.</p>
              </div>
              <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={16}/> Deploy workload</button>
            </section>
            <section className="panel data-page-panel">
              <div className="panel-heading">
                <div><span className="mini-label">WORKLOAD INVENTORY</span><h3>{workloads.filter(w => w.id.toLowerCase().includes(search.toLowerCase())).length} workloads</h3></div>
                <span className="live-tag">{connected ? "LIVE API" : "OFFLINE"}</span>
              </div>
              <div className="table-scroll">
                <table className="nexus-table">
                  <thead><tr><th>Workload</th><th>CPU</th><th>Memory</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {workloads.filter(w => w.id.toLowerCase().includes(search.toLowerCase())).map(w => <tr key={w.id}>
                      <td><strong>{w.id}</strong></td>
                      <td>{w.cpu_cores} cores</td>
                      <td>{formatMemory(w.memory_mb)}</td>
                      <td><span className={`status-label ${w.status === "running" ? "status-running" : "status-done"}`}>{w.status}</span></td>
                      <td>{w.status === "running" ? <button className="complete-button" title="Complete workload" onClick={() => completeWorkload(w.id)}><Check size={14}/></button> : <span className="muted">—</span>}</td>
                    </tr>)}
                    {!workloads.filter(w => w.id.toLowerCase().includes(search.toLowerCase())).length && <tr><td colSpan={5} className="table-empty">{search ? "No workloads match your search." : "No workloads recorded yet. Deploy one to get started."}</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>}

          <footer className="footer"><span>© {new Date().getFullYear()} NEXUS CLOUD SYSTEMS</span><span><i/> {connected ? "API SYNC ACTIVE" : "WAITING FOR CONTROL PLANE"}</span><span>BUILT FOR WHAT'S NEXT <Sparkles size={12}/></span></footer>
        </div>
      </main>

      <AnimatePresence>
        {selectedNode && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedNode(null)}>
          <motion.div className="modal-card" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onClick={e => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="mini-label">NODE DETAILS</span><h3>{selectedNode.id}</h3></div><button className="icon-button" onClick={() => setSelectedNode(null)}><X size={17}/></button></div>
            <HealthRow label="Hostname" value={selectedNode.hostname} ok/>
            <HealthRow label="Status" value={selectedNode.status} ok={selectedNode.status === "online"}/>
            <HealthRow label="CPU allocation" value={`${selectedNode.allocated_cpu_cores} / ${selectedNode.cpu_cores} cores`} ok/>
            <HealthRow label="Memory allocation" value={`${formatMemory(selectedNode.allocated_memory_mb)} / ${formatMemory(selectedNode.memory_mb)}`} ok/>
            <HealthRow label="Available memory" value={formatMemory(selectedNode.available_memory_mb)} ok/>
          </motion.div>
        </motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setShowCreate(false)}>
          <motion.form className="modal-card create-modal" onSubmit={createWorkload} initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onClick={e => e.stopPropagation()}>
            <div className="modal-heading"><div><span className="mini-label">SCHEDULER</span><h3>Deploy workload</h3></div><button type="button" className="icon-button" onClick={() => setShowCreate(false)}><X size={17}/></button></div>
            <p className="modal-description">NEXUS will find the best available node for your workload.</p>
            <label>Workload identifier<input required minLength={3} value={workloadID} onChange={e => setWorkloadID(e.target.value)} placeholder="e.g. api-worker-001"/></label>
            <div className="form-split"><label>CPU cores<input type="number" min="1" required value={workloadCPU} onChange={e => setWorkloadCPU(e.target.value)}/></label><label>Memory (MB)<input type="number" min="1" required value={workloadRAM} onChange={e => setWorkloadRAM(e.target.value)}/></label></div>
            <button className="primary-button modal-submit" disabled={creating}>{creating ? "Scheduling..." : <><Plus size={16}/> Schedule workload</>}</button>
          </motion.form>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}

function Metric({icon,label,value,detail,tone,trend}: {icon:React.ReactNode;label:string;value:string;detail:string;tone:string;trend:string}) {
  return <motion.div className="metric-card" whileHover={{y:-3,transition:{duration:.2}}}>
    <div className="metric-top"><div className={`metric-icon ${tone}`}>{icon}</div><span className="metric-trend">{trend}</span></div>
    <div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-detail">{detail}</div>
    <div className={`metric-accent ${tone}`}/>
  </motion.div>;
}

function HealthRow({label,value,ok}: {label:string;value:string;ok:boolean}) {
  return <div className="health-row"><span>{label}</span><strong><i className={ok ? "dot-ok" : "dot-bad"}/>{value}</strong></div>;
}

export default App;
