import { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Menu } from 'lucide-react';

export default function Header({ toggleSidebar }) {
  const [showProject, setShowProject] = useState(false);
  const [showRegion, setShowRegion] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState(localStorage.getItem('nexus_env') || 'Production');
  const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('nexus_region') || 'us-east-1 (N. Virginia)');
  
  const projectRef = useRef(null);
  const regionRef = useRef(null);

  const allCloudRegions = [
    // AWS Regions
    { provider: 'AWS', region: 'us-east-1 (N. Virginia)' },
    { provider: 'AWS', region: 'us-east-2 (Ohio)' },
    { provider: 'AWS', region: 'us-west-1 (N. California)' },
    { provider: 'AWS', region: 'us-west-2 (Oregon)' },
    { provider: 'AWS', region: 'ap-south-1 (Mumbai)' },
    { provider: 'AWS', region: 'ap-southeast-1 (Singapore)' },
    { provider: 'AWS', region: 'ap-northeast-1 (Tokyo)' },
    { provider: 'AWS', region: 'eu-central-1 (Frankfurt)' },
    { provider: 'AWS', region: 'eu-west-1 (Ireland)' },
    { provider: 'AWS', region: 'eu-west-2 (London)' },
    { provider: 'AWS', region: 'sa-east-1 (São Paulo)' },
    
    // GCP Regions
    { provider: 'GCP', region: 'us-central1 (Iowa)' },
    { provider: 'GCP', region: 'us-east1 (South Carolina)' },
    { provider: 'GCP', region: 'us-west1 (Oregon)' },
    { provider: 'GCP', region: 'asia-south1 (Mumbai)' },
    { provider: 'GCP', region: 'asia-southeast1 (Singapore)' },
    { provider: 'GCP', region: 'asia-northeast1 (Tokyo)' },
    { provider: 'GCP', region: 'europe-west1 (Belgium)' },
    { provider: 'GCP', region: 'europe-west2 (London)' },
    
    // Azure Regions
    { provider: 'Azure', region: 'East US (Virginia)' },
    { provider: 'Azure', region: 'West US (California)' },
    { provider: 'Azure', region: 'Central India (Pune)' },
    { provider: 'Azure', region: 'Southeast Asia (Singapore)' },
    { provider: 'Azure', region: 'Japan East (Tokyo)' },
    { provider: 'Azure', region: 'West Europe (Netherlands)' },
    { provider: 'Azure', region: 'UK South (London)' },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (projectRef.current && !projectRef.current.contains(event.target)) setShowProject(false);
      if (regionRef.current && !regionRef.current.contains(event.target)) setShowRegion(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProjectChange = (env) => {
    setSelectedProject(env);
    localStorage.setItem('nexus_env', env);
    setShowProject(false);
    window.location.reload();
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    localStorage.setItem('nexus_region', region);
    setShowRegion(false);
    window.location.reload();
  };

  // Group by provider for display
  const groupedRegions = allCloudRegions.reduce((acc, curr) => {
    if (!acc[curr.provider]) acc[curr.provider] = [];
    acc[curr.provider].push(curr.region);
    return acc;
  }, {});

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 relative z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white"><Menu size={24} /></button>
        <div className="hidden md:flex items-center gap-6">
          <div className="relative" ref={projectRef}>
            <button onClick={() => setShowProject(!showProject)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>{selectedProject} <ChevronDown size={14} className={`transition-transform ${showProject ? 'rotate-180' : ''}`} />
            </button>
            {showProject && (
              <div className="absolute top-10 left-0 w-40 bg-surface border border-border rounded-md shadow-xl py-1 z-[100]">
                {['Production', 'Staging', 'Development'].map((env) => (
                  <div key={env} onClick={() => handleProjectChange(env)} className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-white/5 ${selectedProject === env ? 'text-white bg-white/5' : 'text-gray-400'}`}>{env}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative" ref={regionRef}>
            <button onClick={() => setShowRegion(!showRegion)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>{selectedRegion} <ChevronDown size={14} className={`transition-transform ${showRegion ? 'rotate-180' : ''}`} />
            </button>
            {showRegion && (
              <div className="absolute top-10 left-0 w-72 bg-surface border border-border rounded-md shadow-xl py-1 z-[100] max-h-80 overflow-y-auto">
                {Object.keys(groupedRegions).map((provider) => (
                  <div key={provider}>
                    <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase bg-background/50 mt-1">{provider}</div>
                    {groupedRegions[provider].map((region) => (
                      <div 
                        key={region} 
                        onClick={() => handleRegionChange(region)} 
                        className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-white/5 ${selectedRegion === region ? 'text-white bg-white/5' : 'text-gray-400'}`}
                      >
                        {region}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-xl px-4 hidden md:block">
        <div className="relative flex items-center w-full"><Search size={16} className="absolute left-3 text-gray-500" /><input type="text" placeholder="Search resources..." className="w-full bg-surface border border-border text-sm text-white rounded-md py-1.5 pl-9 pr-12 focus:outline-none focus:border-primary" /><div className="absolute right-2 text-xs text-gray-500 border border-border px-1.5 py-0.5 rounded">⌘ K</div></div>
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 text-gray-400">
        <div className="relative cursor-pointer hover:text-white"><Bell size={18} /><div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background"></div></div>
        <div className="cursor-pointer hover:text-white hidden md:block"><HelpCircle size={18} /></div>
        <div className="flex items-center gap-2 cursor-pointer border-l border-border pl-3 md:pl-4 ml-1 md:ml-2"><div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">A</div><div className="text-sm hidden md:block"><div className="text-white">Admin</div></div></div>
      </div>
    </header>
  );
}
