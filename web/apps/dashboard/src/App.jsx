import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ClustersPage from './components/ClustersPage';

function App() {
  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <ClustersPage />
        </main>
      </div>
    </div>
  )
}

export default App;
