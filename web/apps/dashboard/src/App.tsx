import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StudioOverview from "./StudioOverview";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, Boxes,
  Check, ChevronDown, ChevronRight, CircleHelp, Cloud, Command,
  Cpu, Database, Globe2, HardDrive, LayoutDashboard, LifeBuoy,
  Menu, MoreHorizontal, Network, Plus, Search, Server, Settings,
  ShieldCheck, Zap, X
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

const routePages: Record<string, string> = {
  "/": "Overview",
  "/nodes": "Nodes",
  "/workloads": "Workloads",
  "/about": "About",
  "/privacy": "Privacy",
  "/terms": "Terms",
  "/contact": "Contact"
};

const pagePaths: Record<string, string> = Object.fromEntries(
  Object.entries(routePages).map(([path, page]) => [page, path])
);

function pageFromPath(path: string) {
  return routePages[path] ?? "NotFound";
}

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
  const [active, setActive] = useState(() =>
    pageFromPath(window.location.pathname)
  );

  function navigate(page: string) {
    const path = pagePaths[page];
    if (!path) return;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setActive(page);
    setSearch("");
    setMobileMenu(false);
  }
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [search, setSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryStatus, setInventoryStatus] = useState<"all" | "online" | "offline">("all");
  const [workloadStatus, setWorkloadStatus] = useState<"all" | "running" | "completed">("all");
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
    const handlePopState = () => setActive(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const metadata: Record<string, { title: string; description: string }> = {
      Overview: { title: "NEXUS — Cloud Infrastructure Command Center", description: "Monitor compute nodes, workloads and cloud resource allocation." },
      Nodes: { title: "Compute Nodes — NEXUS", description: "Manage registered compute workers and available infrastructure resources." },
      Workloads: { title: "Workloads — NEXUS", description: "Inspect and manage scheduled cloud workloads." },
      About: { title: "About NEXUS", description: "Learn about the NEXUS cloud infrastructure platform." },
      Privacy: { title: "Privacy — NEXUS", description: "NEXUS privacy information." },
      Terms: { title: "Terms — NEXUS", description: "NEXUS platform terms and conditions." },
      Contact: { title: "Contact — NEXUS", description: "Contact information for the NEXUS platform." },
      NotFound: { title: "Page Not Found — NEXUS", description: "The requested NEXUS page could not be found." }
    };
    const page = metadata[active] ?? metadata.NotFound;
    document.title = page.title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", page.description);
  }, [active]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const onlineNodes = nodes.filter(n => n.status === "online");

  const sortedInventoryNodes = useMemo(
    () => [...nodes].sort((a, b) => {
      const statusOrder = Number(b.status === "online") - Number(a.status === "online");
      if (statusOrder !== 0) return statusOrder;
      return a.hostname.localeCompare(b.hostname, undefined, { sensitivity: "base" });
    }),
    [nodes]
  );

  const inventoryFilteredNodes = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    return sortedInventoryNodes.filter(node => {
      const matchesStatus = inventoryStatus === "all" || node.status === inventoryStatus;
      const matchesSearch = !query ||
        node.hostname.toLowerCase().includes(query) ||
        node.id.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [sortedInventoryNodes, inventorySearch, inventoryStatus]);

  const activeWorkloads = workloads.filter(w => w.status === "running");

  const filteredWorkloads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workloads.filter(workload => {
      const matchesSearch = workload.id.toLowerCase().includes(query);
      const matchesStatus = workloadStatus === "all" || workload.status === workloadStatus;
      return matchesSearch && matchesStatus;
    });
  }, [workloads, search, workloadStatus]);
  const onlineCapacityNodes = nodes.filter(n => n.status === "online");
  const totalCPU = onlineCapacityNodes.reduce((s, n) => s + n.cpu_cores, 0);
  const usedCPU = onlineCapacityNodes.reduce((s, n) => s + n.allocated_cpu_cores, 0);
  const totalRAM = onlineCapacityNodes.reduce((s, n) => s + n.memory_mb, 0);
  const usedRAM = onlineCapacityNodes.reduce((s, n) => s + n.allocated_memory_mb, 0);
  const cpuPercent = totalCPU ? Math.round(usedCPU / totalCPU * 100) : 0;
  const ramPercent = totalRAM ? Math.round(usedRAM / totalRAM * 100) : 0;

  const filteredNodes = useMemo(() => nodes.filter(n =>
    `${n.id} ${n.hostname}`.toLowerCase().includes(search.toLowerCase())
  ), [nodes, search]);

  async function createWorkload(e: React.FormEvent) {
    e.preventDefault();
    const id = workloadID.trim();
    const cpu = Number(workloadCPU);
    const ram = Number(workloadRAM);

    if (!id || id.length < 3 || !Number.isSafeInteger(cpu) || cpu < 1 ||
        !Number.isSafeInteger(ram) || ram < 1) {
      setNoticeKind("error");
      setNotice("Enter a valid workload ID, positive CPU cores and memory in MB.");
      return;
    }

    setCreating(true);
    setNotice("");
    try {
      const response = await fetch(`${API}/api/v1/workloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id, cpu_cores: cpu, memory_mb: ram
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
          <button className="brand-home" aria-label="Go to NEXUS Overview" onClick={() => navigate("Overview")}>
            <div className="brand-mark"><span /></div>
            <span>NEXUS</span><span className="brand-version">CLOUD</span>
          </button>
          <button className="mobile-close" aria-label="Close navigation" onClick={() => setMobileMenu(false)}><X size={17}/></button>
        </div>

        <div className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-text"><strong>NEXUS Cluster</strong><span>Control Plane workspace</span></div>
          <ChevronDown size={15} className="muted"/>
        </div>

        <div className="nav-caption">WORKSPACE</div>
        <nav className="navigation">
          {nav.map(item => {
            const Icon = item.icon;
            return <button key={item.label} className={`nav-item ${active === item.label ? "active" : ""}`}
              onClick={() => navigate(item.label)}>
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
            <button className="menu-button" aria-label="Open navigation" onClick={() => setMobileMenu(true)}><Menu size={19}/></button>
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
          {active === "Overview" && (
            <StudioOverview
              nodes={nodes}
              workloads={workloads}
              connected={connected}
              cpuPercent={cpuPercent}
              ramPercent={ramPercent}
              onRefresh={refresh}
              onDeploy={() => setShowCreate(true)}
              onSelectNode={setSelectedNode}
              onCompleteWorkload={completeWorkload}
            />
          )}

          {active === "Nodes" && <>
            <section className="nodes-heading">
              <div>
                <div className="studio-kicker">NEXUS / COMPUTE / INVENTORY</div>
                <h1>Compute <span>nodes.</span></h1>
                <p>Registered workers, hardware capacity and resource reservations.</p>
              </div>
              <button className="studio-deploy" onClick={refresh}>
                <Activity size={15}/> Refresh inventory
              </button>
            </section>

            <section className="nodes-overview">
              <div className="nodes-overview-card">
                <span>REGISTERED NODES</span>
                <strong>{connected ? nodes.length : "—"}</strong>
                <small>Control Plane inventory</small>
              </div>
              <div className="nodes-overview-card">
                <span>ONLINE NODES</span>
                <strong className="nodes-green">{connected ? onlineNodes.length : "—"}</strong>
                <small>Currently reachable</small>
              </div>
              <div className="nodes-overview-card">
                <span>CPU CAPACITY</span>
                <strong>{connected ? `${usedCPU} / ${totalCPU}` : "—"}</strong>
                <small>Allocated / total cores</small>
              </div>
              <div className="nodes-overview-card">
                <span>MEMORY CAPACITY</span>
                <strong>{connected ? `${formatMemory(usedRAM)} / ${formatMemory(totalRAM)}` : "—"}</strong>
                <small>Reserved / total memory</small>
              </div>
            </section>

            <section className="nodes-inventory">
              <div className="nodes-inventory-heading">
                <div>
                  <span className="studio-panel-index">COMPUTE FABRIC / REGISTERED WORKERS</span>
                  <h2>Node inventory <span>{filteredNodes.length}</span></h2>
                </div>
                <span className={`studio-connection ${connected ? "online" : ""}`}><i/>
                  {connected ? "API SYNCHRONIZED" : "API OFFLINE"}
                </span>
              </div>

              <div className="nodes-search-row">
                <div className="nodes-search">
                  <Search size={15}/>
                  <span>{search ? `Filtering: ${search}` : "Use global search to find a node"}</span>
                </div>
                <span className="nodes-sort-label">ONLINE FIRST · HOSTNAME ORDER</span>
              </div>

              <div className="nodes-card-grid">
                {sortedInventoryNodes.filter(node =>
                  `${node.id} ${node.hostname}`.toLowerCase().includes(search.toLowerCase())
                ).map(node => {
                  const cpuUsed = node.cpu_cores ? Math.round(node.allocated_cpu_cores / node.cpu_cores * 100) : 0;
                  const ramUsed = node.memory_mb ? Math.round(node.allocated_memory_mb / node.memory_mb * 100) : 0;
                  return (
                    <article className="node-card" key={node.id}>
                      <div className="node-card-top">
                        <div className="node-card-icon"><Server size={19}/></div>
                        <span className={`node-status ${node.status === "online" ? "online" : ""}`}>
                          <i/>{node.status}
                        </span>
                      </div>
                      <div className="node-card-identity">
                        <h3>{node.hostname}</h3>
                        <span>{node.id}</span>
                      </div>
                      <div className="node-card-resources">
                        <div className="node-resource-heading">
                          <span>CPU ALLOCATION</span>
                          <strong>{node.allocated_cpu_cores} / {node.cpu_cores} cores</strong>
                        </div>
                        <div className="studio-meter"><span className="cpu-meter" style={{width:`${cpuUsed}%`}}/></div>
                        <div className="node-resource-heading">
                          <span>MEMORY ALLOCATION</span>
                          <strong>{formatMemory(node.allocated_memory_mb)} / {formatMemory(node.memory_mb)}</strong>
                        </div>
                        <div className="studio-meter"><span className="memory-meter" style={{width:`${ramUsed}%`}}/></div>
                      </div>
                      <div className="node-card-footer">
                        <span>{node.available_cpu_cores} CPU available</span>
                        <button onClick={() => setSelectedNode(node)}>Inspect node <ArrowUpRight size={13}/></button>
                      </div>
                    </article>
                  );
                })}
                {!filteredNodes.length && (
                  <div className="nodes-empty">
                    <Server size={24}/>
                    <strong>{search ? "No matching nodes" : "No registered nodes"}</strong>
                    <span>{search ? "Try another hostname or node ID." : "Registered workers will appear here."}</span>
                  </div>
                )}
              </div>
            </section>
          </>}
          {active === "Workloads" && <>
            <section className="workloads-heading">
              <div>
                <div className="studio-kicker">NEXUS / SCHEDULER / OPERATIONS</div>
                <h1>Workload <span>manager.</span></h1>
                <p>Monitor execution, inspect resource reservations and manage workload lifecycle.</p>
              </div>
              <button className="studio-deploy" onClick={() => setShowCreate(true)}>
                <Plus size={15}/> Deploy workload
              </button>
            </section>

            <section className="workloads-overview">
              <div><span>TOTAL RECORDS</span><strong>{connected ? workloads.length : "—"}</strong><small>Persisted workloads</small></div>
              <div><span>RUNNING</span><strong className="wl-running">{connected ? activeWorkloads.length : "—"}</strong><small>Active execution</small></div>
              <div><span>COMPLETED</span><strong>{connected ? workloads.filter(w => w.status === "completed").length : "—"}</strong><small>Finished workloads</small></div>
              <div><span>RESERVED CPU</span><strong>{connected ? `${workloads.filter(w => w.status === "running").reduce((sum,w) => sum + w.cpu_cores,0)} cores` : "—"}</strong><small>Current reservations</small></div>
            </section>

            <section className="workloads-inventory">
              <div className="workloads-inventory-head">
                <div>
                  <span className="studio-panel-index">SCHEDULER / WORKLOAD REGISTRY</span>
                  <h2>Execution records <span>{filteredWorkloads.length}</span></h2>
                </div>
                <span className={`studio-connection ${connected ? "online" : ""}`}><i/>
                  {connected ? "API SYNCHRONIZED" : "API OFFLINE"}
                </span>
              </div>

              <div className="wl-filter-row">
                <div className="wl-filters" aria-label="Filter workloads by status">
                  {(["all", "running", "completed"] as const).map(status => (
                    <button key={status} type="button"
                      className={workloadStatus === status ? "active" : ""}
                      aria-pressed={workloadStatus === status}
                      onClick={() => setWorkloadStatus(status)}>
                      {status === "all" ? "All workloads" : status}
                      <span>{connected ? status === "all" ? workloads.length : workloads.filter(w => w.status === status).length : "—"}</span>
                    </button>
                  ))}
                </div>
                <span className="wl-search-hint">{search ? `Search: ${search}` : "Global search filters workload IDs"}</span>
              </div>

              <div className="wl-card-list">
                {filteredWorkloads.map(w => {
                  const assignedNode = nodes.find(node => node.id === w.node_id);
                  const createdAt = new Date(w.created_at);
                  return (
                    <article className="wl-card" key={w.id}>
                      <div className="wl-card-main">
                        <div className="wl-card-icon"><Boxes size={18}/></div>
                        <div className="wl-card-identity">
                          <h3>{w.id}</h3>
                          <span>{assignedNode?.hostname ?? "Node unavailable"}</span>
                        </div>
                        <span className={`wl-status ${w.status === "running" ? "running" : ""}`}><i/>{w.status}</span>
                      </div>
                      <div className="wl-card-resources">
                        <div><span>CPU REQUEST</span><strong>{w.cpu_cores} cores</strong></div>
                        <div><span>MEMORY REQUEST</span><strong>{formatMemory(w.memory_mb)}</strong></div>
                        <div><span>CREATED</span><strong>{Number.isNaN(createdAt.getTime()) ? "—" : createdAt.toLocaleString()}</strong></div>
                      </div>
                      <div className="wl-card-footer">
                        <span>NODE ID · {w.node_id}</span>
                        {w.status === "running"
                          ? <button onClick={() => completeWorkload(w.id)}><Check size={13}/> Complete workload</button>
                          : <span className="wl-finished"><Check size={13}/> Resources released</span>}
                      </div>
                    </article>
                  );
                })}
                {!filteredWorkloads.length && (
                  <div className="wl-empty">
                    <Boxes size={25}/>
                    <strong>No workloads found</strong>
                    <span>{search ? "Try another workload ID." : workloadStatus !== "all" ? `No ${workloadStatus} workloads recorded.` : "Deploy a workload to begin scheduling."}</span>
                    {!search && workloadStatus === "all" && <button onClick={() => setShowCreate(true)}>Deploy workload <Plus size={13}/></button>}
                  </div>
                )}
              </div>
            </section>
          </>}
          {active === "About" && <section className="info-page">
            <div className="eyebrow">NEXUS / PLATFORM</div>
            <h1>Infrastructure, <span>orchestrated.</span></h1>
            <p>NEXUS is a cloud infrastructure management platform designed to monitor compute nodes, schedule workloads and track resource allocation through a unified control plane.</p>
            <h2>What NEXUS provides</h2>
            <ul>
              <li>Centralized compute node inventory and health monitoring.</li>
              <li>Workload scheduling and lifecycle management.</li>
              <li>CPU and memory allocation visibility.</li>
              <li>Control Plane connectivity and infrastructure status.</li>
            </ul>
            <button className="primary-button" onClick={() => navigate("Overview")}>Explore dashboard</button>
          </section>}

          {active === "Privacy" && <section className="info-page">
            <div className="eyebrow">NEXUS / LEGAL</div>
            <h1>Privacy <span>information.</span></h1>
            <p>This page describes the current prototype's data handling at a high level. It is informational and is not a finalized legal privacy policy.</p>
            <h2>Infrastructure data</h2>
            <p>NEXUS displays node registration details, resource allocation and workload metadata retrieved from its configured Control Plane.</p>
            <h2>Operational responsibility</h2>
            <p>Deployment operators are responsible for securing their infrastructure, database credentials, network access and any personal or confidential information stored in workloads.</p>
            <h2>Questions</h2>
            <p>Dedicated privacy contact details have not yet been configured for this project.</p>
          </section>}

          {active === "Terms" && <section className="info-page">
            <div className="eyebrow">NEXUS / LEGAL</div>
            <h1>Platform <span>terms.</span></h1>
            <p>This prototype is provided for development, demonstration and educational use. This page is informational, not a finalized legal agreement.</p>
            <h2>Authorized use</h2>
            <p>Use NEXUS only with infrastructure and compute resources you are authorized to manage.</p>
            <h2>Availability</h2>
            <p>Infrastructure status and workload operations depend on the configured Control Plane, database and connected node agents. No production availability guarantee is made.</p>
            <h2>Operational safety</h2>
            <p>Operators should validate resource requests, protect credentials and maintain appropriate backups before using the platform with important workloads.</p>
          </section>}

          {active === "Contact" && <section className="info-page">
            <div className="eyebrow">NEXUS / SUPPORT</div>
            <h1>Let's talk <span>NEXUS.</span></h1>
            <p>Thanks for your interest in the NEXUS infrastructure platform.</p>
            <h2>Contact information</h2>
            <p>A verified support email address and telephone number have not yet been configured. We won't display invented contact details.</p>
            <p>For now, use the project repository and its issue tracker for technical feedback.</p>
            <button className="primary-button" onClick={() => navigate("Overview")}>Return to dashboard</button>
          </section>}

          {active === "NotFound" && <section className="not-found-page">
            <div className="not-found-content">
              <div className="not-found-code">404</div>
              <h1>Page not <span>found.</span></h1>
              <p>The page you're looking for doesn't exist or may have moved.</p>
              <button className="primary-button" onClick={() => navigate("Overview")}>Return to NEXUS</button>
            </div>
          </section>}

          <footer className="footer">
            <span>© {new Date().getFullYear()} NEXUS CLOUD SYSTEMS</span>
            <span><i/> {connected ? "API SYNC ACTIVE" : "WAITING FOR CONTROL PLANE"}</span>
            <nav className="footer-links" aria-label="Footer navigation">
              <button onClick={() => navigate("About")}>About</button>
              <button onClick={() => navigate("Privacy")}>Privacy</button>
              <button onClick={() => navigate("Terms")}>Terms</button>
              <button onClick={() => navigate("Contact")}>Contact</button>
            </nav>
          </footer>
        </div>
      </main>

      <AnimatePresence>
        {selectedNode && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelectedNode(null)}>
          <motion.div className="modal-card node-inspector" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="mini-label">COMPUTE NODE / INSPECTOR</span>
                <h3>{selectedNode.hostname}</h3>
                <span className="inspector-node-id">{selectedNode.id}</span>
              </div>
              <button className="icon-button" aria-label="Close node inspector" onClick={() => setSelectedNode(null)}><X size={17}/></button>
            </div>

            <div className="inspector-status">
              <span className={`inventory-status ${selectedNode.status === "online" ? "is-online" : "is-offline"}`}>
                <i/>{selectedNode.status}
              </span>
              <span>CONTROL PLANE REPORTED STATE</span>
            </div>

            <section className="inspector-section">
              <div className="inspector-section-heading">
                <Cpu size={16}/>
                <h4>Compute capacity</h4>
              </div>
              <div className="inspector-resource-grid">
                <div><span>TOTAL CPU</span><strong>{selectedNode.cpu_cores} cores</strong></div>
                <div><span>ALLOCATED</span><strong>{selectedNode.allocated_cpu_cores} cores</strong></div>
                <div><span>AVAILABLE</span><strong>{selectedNode.available_cpu_cores} cores</strong></div>
              </div>
              <div className="inspector-track">
                <span className="cpu" style={{width: `${selectedNode.cpu_cores > 0 ? Math.min(100, Math.max(0, selectedNode.allocated_cpu_cores / selectedNode.cpu_cores * 100)) : 0}%`}}/>
              </div>
            </section>

            <section className="inspector-section">
              <div className="inspector-section-heading">
                <Database size={16}/>
                <h4>Memory capacity</h4>
              </div>
              <div className="inspector-resource-grid">
                <div><span>TOTAL MEMORY</span><strong>{formatMemory(selectedNode.memory_mb)}</strong></div>
                <div><span>ALLOCATED</span><strong>{formatMemory(selectedNode.allocated_memory_mb)}</strong></div>
                <div><span>AVAILABLE</span><strong>{formatMemory(selectedNode.available_memory_mb)}</strong></div>
              </div>
              <div className="inspector-track">
                <span className="memory" style={{width: `${selectedNode.memory_mb > 0 ? Math.min(100, Math.max(0, selectedNode.allocated_memory_mb / selectedNode.memory_mb * 100)) : 0}%`}}/>
              </div>
            </section>

            <div className="inspector-footer">
              <span>NODE IDENTIFIER</span>
              <code>{selectedNode.id}</code>
            </div>
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
