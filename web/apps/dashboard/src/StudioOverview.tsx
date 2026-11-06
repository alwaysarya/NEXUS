import { motion } from "framer-motion";
import "./studio.css";
import {
  Activity, Cpu, Database, Server, Boxes,
  Network, ArrowUpRight, RefreshCw, Zap
} from "lucide-react";

type Node = {
  id: string;
  hostname: string;
  cpu_cores: number;
  memory_mb: number;
  allocated_cpu_cores: number;
  allocated_memory_mb: number;
  available_cpu_cores: number;
  available_memory_mb: number;
  status: string;
};

type Workload = {
  id: string;
  node_id: string;
  cpu_cores: number;
  memory_mb: number;
  status: string;
  created_at: string;
};

type Props = {
  nodes: Node[];
  workloads: Workload[];
  connected: boolean;
  cpuPercent: number;
  ramPercent: number;
  onRefresh: () => void;
  onDeploy: () => void;
  onSelectNode: (node: Node) => void;
  onCompleteWorkload: (id: string) => void;
};

function memory(value: number) {
  return value >= 1024
    ? `${(value / 1024).toFixed(1)} GB`
    : `${value} MB`;
}

export default function StudioOverview({
  nodes,
  workloads,
  connected,
  cpuPercent,
  ramPercent,
  onRefresh,
  onDeploy,
  onSelectNode,
  onCompleteWorkload
}: Props) {
  const online = nodes.filter(node => node.status === "online");
  const running = workloads.filter(workload => workload.status === "running");
  const totalCPU = nodes.reduce((sum, node) => sum + node.cpu_cores, 0);
  const totalRAM = nodes.reduce((sum, node) => sum + node.memory_mb, 0);
  const usedCPU = nodes.reduce((sum, node) => sum + node.allocated_cpu_cores, 0);
  const usedRAM = nodes.reduce((sum, node) => sum + node.allocated_memory_mb, 0);

  return (
    <section className="studio">
      <header className="studio-header">
        <div>
          <div className="studio-kicker">NEXUS / CONTROL PLANE / 01</div>
          <h1>Infrastructure <span>studio</span></h1>
          <p>Compute inventory, resource allocation and workload orchestration.</p>
        </div>
        <div className="studio-actions">
          <span className={`studio-connection ${connected ? "online" : ""}`}>
            <i />{connected ? "CONTROL PLANE CONNECTED" : "CONTROL PLANE OFFLINE"}
          </span>
          <button className="studio-action" onClick={onRefresh} aria-label="Refresh infrastructure">
            <RefreshCw size={15} />
          </button>
          <button className="studio-deploy" onClick={onDeploy}>
            <Zap size={15} /> Deploy workload
          </button>
        </div>
      </header>

      <div className="studio-workspace">
        <div className="studio-toolbar">
          <span className="studio-tool active" aria-hidden="true"><Network size={17} /></span>
          <span className="studio-toolbar-label">CONTROL<br />PLANE</span>
        </div>

        <div className="studio-canvas">
          <div className="studio-canvas-grid" />
          <div className="studio-canvas-label">CONTROL PLANE WORKSPACE <span>LIVE API DATA</span></div>

          <svg className="studio-connections" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="studio-line" x1="0" x2="1">
                <stop offset="0%" stopColor="#3978c8" stopOpacity=".12" />
                <stop offset="50%" stopColor="#55b9ef" stopOpacity=".8" />
                <stop offset="100%" stopColor="#3978c8" stopOpacity=".12" />
              </linearGradient>
            </defs>
            <path d="M280 190 C380 190 360 300 490 300 S610 180 720 180" />
            <path d="M280 470 C390 470 390 350 490 350 S610 470 720 470" />
            <path d="M500 300 L500 350" />
            <circle cx="280" cy="190" r="3" />
            <circle cx="280" cy="470" r="3" />
            <circle cx="720" cy="180" r="3" />
            <circle cx="720" cy="470" r="3" />
          </svg>

          <motion.div
            className="studio-core"
            animate={{ boxShadow: [
              "0 0 35px #2877c522, inset 0 0 30px #2877c522",
              "0 0 65px #2877c544, inset 0 0 40px #2877c533",
              "0 0 35px #2877c522, inset 0 0 30px #2877c522"
            ] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="studio-core-orbit" />
            <div className="studio-core-icon"><Network size={27} /></div>
            <strong>NEXUS</strong>
            <span>CONTROL PLANE</span>
            <i className={connected ? "connected" : ""} />
          </motion.div>

          <motion.section className="studio-panel studio-inventory" whileHover={{ y: -3 }}>
            <div className="studio-panel-heading">
              <div><span className="studio-panel-index">01 / COMPUTE</span><h3>Node inventory</h3></div>
              <Server size={17} />
            </div>
            <div className="studio-panel-stat">
              <strong>{connected ? nodes.length : "—"}</strong>
              <span>REGISTERED NODES</span>
            </div>
            <div className="studio-panel-split">
              <span><i className="green-dot" /> {connected ? online.length : "—"} online</span>
              <span>{connected ? nodes.length - online.length : "—"} offline</span>
            </div>
            <div className="studio-node-list">
              {nodes.slice(0, 3).map(node => (
                <button key={node.id} onClick={() => onSelectNode(node)}>
                  <span className={`studio-node-dot ${node.status === "online" ? "online" : ""}`} />
                  <span className="studio-node-name">{node.hostname}</span>
                  <span className="studio-node-state">{node.status}</span>
                  <ArrowUpRight size={13} />
                </button>
              ))}
              {!nodes.length && <p className="studio-empty">No registered nodes.</p>}
            </div>
          </motion.section>

          <motion.section className="studio-panel studio-scheduler" whileHover={{ y: -3 }}>
            <div className="studio-panel-heading">
              <div><span className="studio-panel-index">02 / SCHEDULING</span><h3>Workload engine</h3></div>
              <Boxes size={17} />
            </div>
            <div className="studio-panel-stat">
              <strong>{connected ? String(running.length).padStart(2, "0") : "—"}</strong>
              <span>RUNNING WORKLOADS</span>
            </div>
            <div className="studio-workload-list">
              {workloads.slice(0, 3).map(workload => (
                <div className="studio-workload-item" key={workload.id}>
                  <div><strong>{workload.id}</strong><span>{workload.cpu_cores} CPU · {memory(workload.memory_mb)}</span></div>
                  <span className={workload.status === "running" ? "workload-live" : "workload-done"}>
                    {workload.status}
                  </span>
                  {workload.status === "running" && (
                    <button onClick={() => onCompleteWorkload(workload.id)} title="Complete workload">×</button>
                  )}
                </div>
              ))}
              {!workloads.length && <p className="studio-empty">No workloads recorded.</p>}
            </div>
            <button className="studio-panel-link" onClick={onDeploy}>Create workload <ArrowUpRight size={13} /></button>
          </motion.section>

          <motion.section className="studio-panel studio-capacity" whileHover={{ y: -3 }}>
            <div className="studio-panel-heading">
              <div><span className="studio-panel-index">03 / CAPACITY</span><h3>Resource allocation</h3></div>
              <Activity size={17} />
            </div>
            <div className="studio-capacity-row">
              <div><span>CPU CORES</span><strong>{connected ? `${usedCPU} / ${totalCPU}` : "—"}</strong></div>
              <strong>{connected ? `${cpuPercent}%` : "—"}</strong>
            </div>
            <div className="studio-meter"><span className="cpu-meter" style={{ width: `${connected ? cpuPercent : 0}%` }} /></div>
            <div className="studio-capacity-row">
              <div><span>MEMORY</span><strong>{connected ? `${memory(usedRAM)} / ${memory(totalRAM)}` : "—"}</strong></div>
              <strong>{connected ? `${ramPercent}%` : "—"}</strong>
            </div>
            <div className="studio-meter"><span className="memory-meter" style={{ width: `${connected ? ramPercent : 0}%` }} /></div>
            <div className="studio-capacity-foot">
              <span><i className="green-dot" /> Reserved capacity</span>
              <span>Control Plane data</span>
            </div>
          </motion.section>

          <div className="studio-canvas-caption">
            <span>LOGICAL CONTROL FLOW · NOT A NETWORK MAP</span>
            <span>{nodes.length} NODES / {workloads.length} WORKLOAD RECORDS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
