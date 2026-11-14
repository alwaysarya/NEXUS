import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/login', { username, password });
      localStorage.setItem('nexus_token', res.data.token);
      navigate('/overview');
      window.location.reload();
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NEXUS</h1>
          <p className="text-sm text-gray-400 mt-1">Cloud Infrastructure Command Center</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-primary text-white font-medium py-2 rounded-md hover:bg-primary/90 transition-colors mt-6">Sign In</button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Use <span className="text-gray-300">admin</span> / <span className="text-gray-300">nexus123</span> to login</p>
        </div>
      </div>
    </div>
  );
}
