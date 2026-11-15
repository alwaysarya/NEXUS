import { useState, useEffect } from 'react';
import { ChevronRight, RotateCw, Undo2, Plus, CheckCircle2, Loader2, PlayCircle, Copy, Download, ExternalLink, Activity, History } from 'lucide-react';
import { fetchDeployments } from '../services/api';

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeployments = async () => {
      try {
        const data = await fetchDeployments();
        setDeployments(data);
      } catch (error) {
        console.error("Failed to fetch deployments", error);
      } finally {
        setLoading(false);
      }
    };
    loadDeployments();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span className="cursor-pointer hover:text-white">Deployments</span>
            <ChevronRight size={14} />
            <span className="cursor-pointer hover:text-white">nexus-api</span>
            <ChevronRight size={14} />
            <span className="text-white">Release #v2.8.4</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Deployment & Release Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">Build, test and deploy your application across environments with full CI/CD visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><RotateCw size={14}/> Re-run Pipeline</button>
          <button className="border border-border text-gray-300 text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-white/5"><Undo2 size={14}/> Rollback</button>
          <button className="bg-primary text-white text-sm px-3 py-1.5 rounded flex items-center gap-2 hover:bg-primary/90"><Plus size={14}/> Create Release</button>
        </div>
      </div>

      {/* Repo Info Bar */}
      <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-medium text-white">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            nexus-platform / nexus-api <ExternalLink size={12} className="text-gray-500"/>
          </div>
          <span className="bg-background border border-border px-2 py-0.5 rounded text-xs text-gray-300">main</span>
          <span className="bg-background border border-border px-2 py-0.5 rounded text-xs text-gray-300">v2.8.4</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">Commit <span className="text-primary cursor-pointer hover:underline">c9f3a7e</span> <Copy size={10}/></span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex flex-col"><span className="text-gray-500">Author</span><span className="text-gray-200">Aman Verma</span></div>
          <div className="flex flex-col"><span className="text-gray-500">Committed</span><span className="text-gray-200">2h ago</span></div>
          <div className="flex flex-col"><span className="text-gray-500">Pipeline</span><span className="text-gray-200">#89231</span></div>
          <div className="flex flex-col"><span className="text-gray-500">Duration</span><span className="text-gray-200">8m 24s</span></div>
          <div className="flex flex-col"><span className="text-gray-500">Status</span><span className="text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">Deploying</span></div>
        </div>
      </div>

      {/* Pipeline Flow */}
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
        {[
          { label: 'Code Checkout', time: '12s', status: 'done' },
          { label: 'Build', time: '1m 28s', status: 'done' },
          { label: 'Test', time: '2m 11s', status: 'done' },
          { label: 'Package', time: '56s', status: 'done' },
          { label: 'Deploy (Staging)', time: '1m 14s', status: 'done' },
          { label: 'Deploy (Production)', time: '2m 13s', status: 'active' },
        ].map((step, i, arr) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className={`flex-1 flex items-center gap-3 p-2 rounded-lg border ${step.status === 'active' ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
              {step.status === 'done' ? <CheckCircle2 size={20} className="text-green-500" /> : <Loader2 size={20} className="text-primary animate-spin" />}
              <div>
                <div className={`text-sm font-medium ${step.status === 'active' ? 'text-white' : 'text-gray-300'}`}>{step.label}</div>
                <div className="text-xs text-gray-500">{step.time}</div>
              </div>
            </div>
            {i < arr.length - 1 && <div className="h-px w-8 bg-border mx-2" />}
          </div>
        ))}
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left: Release Notes */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Release v2.8.4</h3>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Deploying</span>
          </div>
          <p className="text-xs text-gray-400">Production deployment in progress</p>
          
          <div className="grid grid-cols-2 gap-4 text-xs mt-2">
            <div><span className="text-gray-500 block">Commit</span><span className="text-gray-200 flex items-center gap-1">c9f3a7e <Copy size={10}/></span></div>
            <div><span className="text-gray-500 block">Branch</span><span className="text-gray-200">main</span></div>
            <div><span className="text-gray-500 block">Author</span><span className="text-gray-200">Aman Verma</span></div>
            <div><span className="text-gray-500 block">Released</span><span className="text-gray-200">Jun 20, 2025, 10:24 AM</span></div>
            <div><span className="text-gray-500 block">Changes</span><span className="text-green-500">+24</span> <span className="text-red-500">-6</span></div>
          </div>

          <div className="mt-2">
            <h4 className="text-sm text-gray-300 mb-2 flex items-center gap-2">📝 Release Notes</h4>
            <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
              <li>Improve API response time by 32%</li>
              <li>Add request caching for user endpoints</li>
              <li>Fix intermittent session timeout issue</li>
              <li>Update dependencies and security patches</li>
            </ul>
          </div>
        </div>

        {/* Middle: Pipeline Logs */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border pb-2 text-xs text-gray-400">
            <div className="flex gap-4">
              <span className="text-white border-b-2 border-primary pb-2 -mb-2.5">Pipeline Logs</span>
              <span className="cursor-pointer hover:text-white">Artifacts</span>
              <span className="cursor-pointer hover:text-white">Environments</span>
              <span className="cursor-pointer hover:text-white">Metadata</span>
            </div>
            <div className="flex gap-2 items-center">
              <span>Auto-scroll</span>
              <div className="w-6 h-3 bg-primary rounded-full relative"><div className="absolute right-0.5 top-0.5 w-2 h-2 bg-white rounded-full"></div></div>
              <Copy size={12} className="cursor-pointer"/> <Download size={12} className="cursor-pointer"/>
            </div>
          </div>
          
          <div className="bg-background rounded border border-border p-3 font-mono text-[11px] text-gray-300 flex-1 overflow-y-auto h-64 space-y-1.5">
            <div className="text-gray-500 mb-2 flex items-center gap-2"><PlayCircle size={12}/> Streaming live logs...</div>
            <div><span className="text-green-500">10:31:42</span> [INFO] Starting production deployment...</div>
            <div><span className="text-green-500">10:31:43</span> [INFO] Pulling container image: nexus-api:v2.8.4</div>
            <div><span className="text-green-500">10:31:47</span> [INFO] Image pulled successfully (412 MB)</div>
            <div><span className="text-green-500">10:31:49</span> [INFO] Updating Kubernetes deployment: nexus-api</div>
            <div><span className="text-green-500">10:31:52</span> [INFO] Performing rolling update (maxUnavailable=25%)</div>
            <div><span className="text-green-500">10:31:59</span> [INFO] Waiting for pods to become ready...</div>
            <div><span className="text-green-500">10:32:08</span> [INFO] 2/4 pods ready</div>
            <div><span className="text-green-500">10:32:16</span> [INFO] 3/4 pods ready</div>
            <div><span className="text-green-500">10:32:20</span> [INFO] 4/4 pods ready</div>
            <div><span className="text-green-500">10:32:20</span> [SUCCESS] Deployment progressing successfully... <span className="animate-pulse">_</span></div>
          </div>
        </div>

        {/* Right: Environments & Health */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Environments</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> Development</div><span className="text-gray-300">v2.8.3</span></div>
              <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Staging</div><span className="text-gray-300">v2.8.4 ✓</span></div>
              <div className="flex items-center justify-between bg-primary/10 p-1.5 -mx-1.5 rounded"><div className="flex items-center gap-2 text-white"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Production</div><span className="text-primary font-medium">v2.8.4 →</span></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-white flex items-center gap-2"><Activity size={14} className="text-primary"/> Deployment Health</h3>
              <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-500"></span> Live</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Pods</span><span className="text-white flex items-center gap-2"><span className="flex gap-0.5">{[1,2,3,4].map(i => <span key={i} className="w-2 h-3 bg-green-500 rounded-sm"></span>)}</span> 4 / 4</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-gray-400">CPU</span><div className="flex items-center gap-2 w-24"><div className="w-full bg-border h-1.5 rounded-full"><div className="bg-primary h-1.5 rounded-full" style={{width: '38%'}}></div></div><span className="text-white w-8 text-right">38%</span></div></div>
              <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Memory</span><div className="flex items-center gap-2 w-24"><div className="w-full bg-border h-1.5 rounded-full"><div className="bg-primary h-1.5 rounded-full" style={{width: '56%'}}></div></div><span className="text-white w-8 text-right">56%</span></div></div>
              <div className="flex items-center justify-between text-xs"><span className="text-gray-400">Uptime</span><span className="text-green-500">99.98%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Deployment History */}
      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-white flex items-center gap-2"><History size={14}/> Deployment History</h3>
        </div>
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-500 uppercase border-b border-border bg-background/50">
            <tr>
              <th className="px-4 py-3 font-medium">Release</th>
              <th className="px-4 py-3 font-medium">Environment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deployed At</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {loading ? (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading deployments...</td></tr>
            ) : deployments.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-4 text-gray-500">No deployments found.</td></tr>
            ) : (
              deployments.map((dep, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white">{dep.release}</td>
                  <td className="px-4 py-3">{dep.environment}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 ${dep.status === 'Deploying' ? 'text-primary' : 'text-green-500'}`}>
                      {dep.status === 'Deploying' ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle2 size={12}/>} {dep.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{dep.deployedAt}</td>
                  <td className="px-4 py-3">{dep.duration}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button className="border border-border px-2 py-1 rounded hover:bg-white/5 flex items-center gap-1"><Undo2 size={10}/> Rollback</button>
                    <button className="border border-border px-2 py-1 rounded hover:bg-white/5">...</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
