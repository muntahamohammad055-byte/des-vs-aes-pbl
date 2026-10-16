import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';
import ProfessorDemoModal from './components/ProfessorDemoModal';

// Pages
import DashboardPage from './pages/DashboardPage';
import EncryptDecryptPage from './pages/EncryptDecryptPage';
import BenchmarkPage from './pages/BenchmarkPage';
import ChartsPage from './pages/ChartsPage';
import SecurityAnalysisPage from './pages/SecurityAnalysisPage';
import VisualizationPage from './pages/VisualizationPage';
import ExperimentsPage from './pages/ExperimentsPage';
import MethodologyPage from './pages/MethodologyPage';
import DocumentationPage from './pages/DocumentationPage';
import TestPage from './pages/TestPage';

// Benchmark service
import { runBenchmarkSuite } from './services/benchmarkService';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState([]);

  // Load theme preference from localStorage (safe preference only)
  useEffect(() => {
    const savedTheme = localStorage.getItem('pbl_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pbl_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pbl_theme', 'light');
    }
  };

  const handleNotify = (notif) => {
    setNotification(notif);
  };

  // Run a quick benchmark (1KB & 10KB, 3 trials) to populate data on-demand if user requests
  const handleRunQuickBenchmark = async () => {
    try {
      handleNotify({
        type: 'info',
        title: 'Running Quick Benchmark',
        message: 'Capturing live hardware timings across DES and AES...'
      });

      const results = await runBenchmarkSuite({
        algorithms: ['DES', 'AES-128', 'AES-192', 'AES-256'],
        sizes: [1024, 10240, 102400],
        iterations: 3,
        warmupRuns: 1
      });

      setBenchmarkResults(results);
      handleNotify({
        type: 'success',
        title: 'Quick Benchmark Complete',
        message: `Measured ${results.length} configurations on your machine.`
      });
    } catch (err) {
      handleNotify({
        type: 'error',
        title: 'Benchmark Error',
        message: err.message
      });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-[#070b14] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
      />

      {/* Professor Viva Demonstration Modal */}
      <ProfessorDemoModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
        setActivePage={setActivePage}
        onNotify={handleNotify}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'dashboard' && (
          <DashboardPage
            setActivePage={setActivePage}
            benchmarkResults={benchmarkResults}
          />
        )}

        {activePage === 'encrypt-decrypt' && (
          <EncryptDecryptPage
            onNotify={handleNotify}
          />
        )}

        {activePage === 'benchmark' && (
          <BenchmarkPage
            benchmarkResults={benchmarkResults}
            setBenchmarkResults={setBenchmarkResults}
            onNotify={handleNotify}
          />
        )}

        {activePage === 'charts' && (
          <ChartsPage
            benchmarkResults={benchmarkResults}
            onRunQuickBenchmark={handleRunQuickBenchmark}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'security' && (
          <SecurityAnalysisPage />
        )}

        {activePage === 'visualization' && (
          <VisualizationPage />
        )}

        {activePage === 'experiments' && (
          <ExperimentsPage
            onNotify={handleNotify}
          />
        )}

        {activePage === 'methodology' && (
          <MethodologyPage />
        )}

        {activePage === 'documentation' && (
          <DocumentationPage
            benchmarkResults={benchmarkResults}
            onNotify={handleNotify}
          />
        )}

        {activePage === 'tests' && (
          <TestPage
            onNotify={handleNotify}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Notification Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
