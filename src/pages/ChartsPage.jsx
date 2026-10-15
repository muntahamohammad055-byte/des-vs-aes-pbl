import React, { useState } from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  Activity, 
  Layers, 
  KeyRound, 
  Filter, 
  RotateCcw,
  Play
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { formatTime, formatThroughput } from '../utils/formatters';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartsPage({ benchmarkResults, onRunQuickBenchmark, setActivePage }) {
  const [activeChartTab, setActiveChartTab] = useState('encTime'); // 'encTime', 'decTime', 'throughput', 'aesRounds', 'keyspace'

  const hasData = benchmarkResults && benchmarkResults.length > 0;

  // Extract unique payload sizes
  const uniqueSizes = hasData 
    ? [...new Set(benchmarkResults.map(r => r.sizeLabel))]
    : [];

  const algorithms = ['DES', 'AES-128', 'AES-192', 'AES-256'];
  const algoColors = {
    'DES': { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.4)' },
    'AES-128': { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.4)' },
    'AES-192': { border: '#818cf8', bg: 'rgba(129, 140, 248, 0.4)' },
    'AES-256': { border: '#00f2fe', bg: 'rgba(0, 242, 254, 0.4)' }
  };

  // 1. Chart: Encryption Time vs Input Size (Line Chart)
  const encTimeLineData = {
    labels: uniqueSizes,
    datasets: algorithms.map(algo => {
      const data = uniqueSizes.map(size => {
        const item = benchmarkResults?.find(r => r.algorithm === algo && r.sizeLabel === size);
        return item && !item.failed ? item.encryption.avgMs : null;
      });
      return {
        label: algo,
        data,
        borderColor: algoColors[algo].border,
        backgroundColor: algoColors[algo].bg,
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7
      };
    })
  };

  // 2. Chart: Decryption Time vs Input Size (Line Chart)
  const decTimeLineData = {
    labels: uniqueSizes,
    datasets: algorithms.map(algo => {
      const data = uniqueSizes.map(size => {
        const item = benchmarkResults?.find(r => r.algorithm === algo && r.sizeLabel === size);
        return item && !item.failed ? item.decryption.avgMs : null;
      });
      return {
        label: algo,
        data,
        borderColor: algoColors[algo].border,
        backgroundColor: algoColors[algo].bg,
        tension: 0.3,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7
      };
    })
  };

  // 3. Chart: Throughput Comparison (Bar Chart)
  const throughputBarData = {
    labels: uniqueSizes,
    datasets: algorithms.map(algo => {
      const data = uniqueSizes.map(size => {
        const item = benchmarkResults?.find(r => r.algorithm === algo && r.sizeLabel === size);
        return item && !item.failed ? item.encryption.throughputMBps : 0;
      });
      return {
        label: algo,
        data,
        backgroundColor: algoColors[algo].bg,
        borderColor: algoColors[algo].border,
        borderWidth: 1.5,
        borderRadius: 6
      };
    })
  };

  // 4. Chart: AES Variants Round Overhead (AES-128 vs 192 vs 256)
  const aesRoundsBarData = {
    labels: uniqueSizes,
    datasets: ['AES-128', 'AES-192', 'AES-256'].map(algo => {
      const data = uniqueSizes.map(size => {
        const item = benchmarkResults?.find(r => r.algorithm === algo && r.sizeLabel === size);
        return item && !item.failed ? item.encryption.avgMs : 0;
      });
      return {
        label: `${algo} (${algo === 'AES-128' ? '10' : algo === 'AES-192' ? '12' : '14'} rounds)`,
        data,
        backgroundColor: algoColors[algo].bg,
        borderColor: algoColors[algo].border,
        borderWidth: 1.5,
        borderRadius: 6
      };
    })
  };

  // 5. Theoretical Key Space Scale (Logarithmic Bar Chart)
  // 2^56 = ~16.85 orders of magnitude in base 10 (log10(2^56) = 56 * 0.30103 = 16.86)
  // 2^128 = 128 * 0.30103 = 38.53 orders of magnitude
  // 2^192 = 192 * 0.30103 = 57.80 orders of magnitude
  // 2^256 = 256 * 0.30103 = 77.06 orders of magnitude
  const keySpaceData = {
    labels: ['DES (56-bit)', 'AES-128', 'AES-192', 'AES-256'],
    datasets: [
      {
        label: 'Log10 of Theoretical Key Space (Orders of Magnitude)',
        data: [16.86, 38.53, 57.80, 77.06],
        backgroundColor: [
          'rgba(244, 63, 94, 0.5)',
          'rgba(56, 189, 248, 0.5)',
          'rgba(129, 140, 248, 0.5)',
          'rgba(0, 242, 254, 0.6)'
        ],
        borderColor: [
          '#f43f5e',
          '#38bdf8',
          '#818cf8',
          '#00f2fe'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { family: 'JetBrains Mono', size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#00f2fe',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        bodyFont: { family: 'JetBrains Mono', size: 12 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.4)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Empirical Performance & Theoretical Visualizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Interactive analytical charts powered by real client measurements and discrete mathematical models.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto max-w-full">
          {[
            { id: 'encTime', label: 'Encryption Time', icon: LineChartIcon },
            { id: 'decTime', label: 'Decryption Time', icon: LineChartIcon },
            { id: 'throughput', label: 'Throughput (MB/s)', icon: BarChart3 },
            { id: 'aesRounds', label: 'AES Round Overhead', icon: Layers },
            { id: 'keyspace', label: 'Key-Space Scale', icon: KeyRound }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                  activeChartTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Viewer */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        {hasData || activeChartTab === 'keyspace' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  {activeChartTab === 'encTime' && 'Encryption Execution Time vs Payload Size (ms)'}
                  {activeChartTab === 'decTime' && 'Decryption Execution Time vs Payload Size (ms)'}
                  {activeChartTab === 'throughput' && 'Cryptographic Throughput Comparison (MB/s)'}
                  {activeChartTab === 'aesRounds' && 'Impact of AES Key Rounds: AES-128 (10) vs AES-192 (12) vs AES-256 (14)'}
                  {activeChartTab === 'keyspace' && 'Theoretical Key-Space Scale Comparison (Base-10 Orders of Magnitude)'}
                </h2>
                <p className="text-xs text-slate-400">
                  {activeChartTab === 'keyspace' 
                    ? 'Demonstrates the exponential astronomical gap between DES (56-bit) and AES keyspaces.'
                    : `Based on actual client benchmark data across ${uniqueSizes.length} buffer sizes.`}
                </p>
              </div>

              {activeChartTab !== 'keyspace' && (
                <button
                  onClick={() => setActivePage('benchmark')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                >
                  Configure Benchmark →
                </button>
              )}
            </div>

            <div className="h-[420px] w-full pt-2">
              {activeChartTab === 'encTime' && (
                <Line
                  data={encTimeLineData}
                  options={{
                    ...commonOptions,
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        title: { display: true, text: 'Execution Time (ms)', color: '#94a3b8' }
                      },
                      x: {
                        ...commonOptions.scales.x,
                        title: { display: true, text: 'Input Size', color: '#94a3b8' }
                      }
                    }
                  }}
                />
              )}

              {activeChartTab === 'decTime' && (
                <Line
                  data={decTimeLineData}
                  options={{
                    ...commonOptions,
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        title: { display: true, text: 'Execution Time (ms)', color: '#94a3b8' }
                      },
                      x: {
                        ...commonOptions.scales.x,
                        title: { display: true, text: 'Input Size', color: '#94a3b8' }
                      }
                    }
                  }}
                />
              )}

              {activeChartTab === 'throughput' && (
                <Bar
                  data={throughputBarData}
                  options={{
                    ...commonOptions,
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        title: { display: true, text: 'Throughput (MB/s)', color: '#94a3b8' }
                      },
                      x: {
                        ...commonOptions.scales.x,
                        title: { display: true, text: 'Input Size', color: '#94a3b8' }
                      }
                    }
                  }}
                />
              )}

              {activeChartTab === 'aesRounds' && (
                <Bar
                  data={aesRoundsBarData}
                  options={{
                    ...commonOptions,
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        title: { display: true, text: 'Execution Time (ms)', color: '#94a3b8' }
                      },
                      x: {
                        ...commonOptions.scales.x,
                        title: { display: true, text: 'Input Size', color: '#94a3b8' }
                      }
                    }
                  }}
                />
              )}

              {activeChartTab === 'keyspace' && (
                <Bar
                  data={keySpaceData}
                  options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      tooltip: {
                        ...commonOptions.plugins.tooltip,
                        callbacks: {
                          afterLabel: (ctx) => {
                            if (ctx.dataIndex === 0) return 'Total Keys: 2^56 ≈ 7.20 × 10^16 (Cracked in hours)';
                            if (ctx.dataIndex === 1) return 'Total Keys: 2^128 ≈ 3.40 × 10^38 (Exceeds all grains of sand on Earth)';
                            if (ctx.dataIndex === 2) return 'Total Keys: 2^192 ≈ 6.27 × 10^57 (Exceeds atoms in Earth)';
                            return 'Total Keys: 2^256 ≈ 1.15 × 10^77 (Approaching total atoms in observable universe ~10^80)';
                          }
                        }
                      }
                    },
                    scales: {
                      ...commonOptions.scales,
                      y: {
                        ...commonOptions.scales.y,
                        title: { display: true, text: 'Log10(Total Possible Keys)', color: '#94a3b8' }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
            <BarChart3 className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-300">No Empirical Benchmark Measurements Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                In strict compliance with academic research standards, performance charts require actual measured execution data rather than placeholder estimations.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setActivePage('benchmark')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.2)]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Go to Benchmark Suite
              </button>
              <button
                onClick={() => setActiveChartTab('keyspace')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
              >
                View Theoretical Key-Space Chart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Insights Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0b1329] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
        <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-slate-800">
          <span className="font-bold text-cyan-400 font-mono">1. Architectural Acceleration Impact:</span>
          <p className="leading-relaxed text-[11px] text-slate-400">
            Native AES in Web Crypto utilizes SIMD and AES-NI hardware instructions. For 1 MB payloads, AES often exhibits dramatically higher throughput (MB/s) than pure JavaScript DES, demonstrating why cryptographic hardware engines are essential in cloud infrastructure.
          </p>
        </div>
        <div className="space-y-1.5 p-3 rounded-xl bg-black/30 border border-slate-800">
          <span className="font-bold text-cyan-400 font-mono">2. Round Overhead Scaling:</span>
          <p className="leading-relaxed text-[11px] text-slate-400">
            AES-128 requires 10 rounds, AES-192 requires 12 rounds (+20%), and AES-256 requires 14 rounds (+40%). In large-scale measurements, the execution time scales in linear proportion to round counts, giving developers a direct trade-off between speed and key margin.
          </p>
        </div>
      </div>
    </div>
  );
}
