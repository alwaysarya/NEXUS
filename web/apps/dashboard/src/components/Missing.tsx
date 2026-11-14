export const Sparkline = ({ data, color }: any) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val: number, i: number) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - ((val - min) / range) * 30;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height="30" viewBox="0 0 100 30" preserveAspectRatio="none" style={{ marginTop: '8px' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DeploymentsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'white' }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Deployments</h1>
      <div style={{ backgroundColor: '#121216', border: '1px solid #27272a', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>
        Deployments page is ready.
      </div>
    </div>
  );
};
