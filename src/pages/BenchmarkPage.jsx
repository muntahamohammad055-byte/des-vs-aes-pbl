import React, { useState, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  Cpu, 
  BarChart2, 
  Filter
} from 'lucide-react';
import { runBenchmarkSuite, generateSampleData } from '../services/benchmarkService';
import { exportToCsv, exportToJson } from '../utils/exportUtils';
import { formatBytes, formatTime, formatThroughput } from '../utils/formatters';

export default function BenchmarkPage({ benchmarkResults, setBenchmarkResults, onNotify }) {
  // Configurable options
  const [selectedSizes, setSelectedSizes] = useState([1024, 10240, 102400]); // Default 1KB, 10KB, 100KB for fast responsive run
  const [customSizeBytes, setCustomSizeBytes] = useState(512000); // 500 KB default
  const [includeCustom, setIncludeCustom] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['DES', 'AES-128', 'AES-192', 'AES-256']);
  const [iterations, setIterations] = useState(5);
  const [warmupRuns, setWarmupRuns] = useState(2);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, algo: '', sizeLabel: '' });
  const [errorNotice, setErrorNotice] = useState('');
  const abortControllerRef = useRef(null);

  const predefinedSizes = [
    { label: '1 KB', bytes: 1024 },
    { label: '10 KB', bytes: 10240 },
    { label: '100 KB', bytes: 102400 },
    { label: '1 MB', bytes: 1048576 }
  ];

  const handleToggleSize = (bytes) => {
    if (selectedSizes.includes(bytes)) {
      if (selectedSizes.length > 1) {
        setSelectedSizes(selectedSizes.filter(s => s !== bytes));
      }
    } else {
      setSelectedSizes([...selectedSizes, bytes].sort((a, b) => a - b));
    }
  };

  const handleToggleAlgorithm = (algo) => {
    if (selectedAlgorithms.includes(algo)) {
      if (selectedAlgorithms.length > 1) {
        setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== algo));
      }
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algo]);
    }
  };

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setErrorNotice('');
    setProgress({ percent: 0, algo: '', sizeLabel: '' });

    const sizesToRun = [...selectedSizes];
    if (includeCustom && customSizeBytes > 0) {
      if (!sizesToRun.includes(customSizeBytes)) {
        sizesToRun.push(customSizeBytes);
        sizesToRun.sort((a, b) => a - b);
      }
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const results = await runBenchmarkSuite({
        algorithms: selectedAlgorithms,
        sizes: sizesToRun,
        iterations,
        warmupRuns,
        signal: abortController.signal,
        onProgress: (p) => {
          if (p.status === 'running') {
            setProgress({
              percent: p.progressPercent,
              algo: p.currentAlgo,
              sizeLabel: p.currentSizeLabel
            });
          }
        }
      });

      setBenchmarkResults(results);

      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'Benchmark Suite Complete',
          message: `Successfully executed ${results.length} test configurations with ${iterations} trials each.`
        });
      }
    } catch (err) {
      if (err.message.includes('aborted')) {
        setErrorNotice('Benchmark execution was cancelled by user.');
        if (onNotify) {
          onNotify({
            type: 'info',
            title: 'Benchmark Cancelled',
            message: 'Benchmark execution was cancelled.'
          });
        }
      } else {
        setErrorNotice(err.message);
        if (onNotify) {
          onNotify({
            type: 'error',
            title: 'Benchmark Execution Failure',
            message: err.message
          });
        }
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelBenchmark = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleResetResults = () => {
    setBenchmarkResults([]);
    setErrorNotice('');
  };

  const handleExportCsv = () => {
    try {
      exportToCsv(benchmarkResults);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'CSV Export Successful',
          message: 'Saved benchmark data as CSV file.'
        });
      }
    } catch (err) {
      setErrorNotice(err.message);
    }
  };

  const handleExportJson = () => {
    try {
      exportToJson(benchmarkResults);
      if (onNotify) {
        onNotify({
          type: 'success',
          title: 'JSON Export Successful',
          message: 'Saved benchmark data as JSON file.'
        });
      }
    } catch (err) {
      setErrorNotice(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-cyan-400" />
            Empirical Performance Benchmarking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conduct multi-trial, controlled cryptographic benchmarks across variable buffer sizes with high-resolution telemetry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {benchmarkResults && benchmarkResults.length > 0 && (
            <>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                title="Export results to CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                CSV
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
                title="Export results to JSON"
              >
                <FileJson className="w-4 h-4 text-cyan-400" />
                JSON
              </button>
              <button
                onClick={handleResetResults}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                title="Clear results"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Benchmark Control Panel */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          Test Configuration & Experimental Controls
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Input Sizes */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              1. Input Payload Sizes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedSizes.map(item => (
                <button
                  key={item.bytes}
                  onClick={() => handleToggleSize(item.bytes)}
                  className={`p-2.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                    selectedSizes.includes(item.bytes)
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Size Checkbox */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCustom}
                  onChange={(e) => setIncludeCustom(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                Custom Size (Bytes):
              </label>
              <input
                type="number"
                min="100"
                max="5242880"
                step="1024"
                disabled={!includeCustom}
                value={customSizeBytes}
                onChange={(e) => setCustomSizeBytes(parseInt(e.target.value, 10) || 1024)}
                className="w-24 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs text-right disabled:opacity-40"
              />
            </div>
          </div>

          {/* Section 2: Algorithms to Evaluate */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              2. Algorithms Evaluated
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['DES', 'AES-128', 'AES-192', 'AES-256'].map(algo => (
                <button
                  key={algo}
                  onClick={() => handleToggleAlgorithm(algo)}
                  className={`p-2.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                    selectedAlgorithms.includes(algo)
                      ? algo === 'DES'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Trials & Warm-up */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              3. Measurement Protocol
            </label>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Timed Trials (Iterations):</span>
                <select
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value, 10))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs"
                >
                  <option value={3}>3 trials</option>
                  <option value={5}>5 trials (Recommended)</option>
                  <option value={10}>10 trials</option>
                  <option value={20}>20 trials</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span>Warm-up Runs:</span>
                <select
                  value={warmupRuns}
                  onChange={(e) => setWarmupRuns(parseInt(e.target.value, 10))}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs"
                >
                  <option value={1}>1 run</option>
                  <option value={2}>2 runs (JIT Warm)</option>
                  <option value={3}>3 runs</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                Warm-up runs trigger JIT compilation before capturing timings to eliminate initialization outliers.
              </p>
            </div>
          </div>
        </div>

        {/* Execution Trigger Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Total Configurations: <span className="text-cyan-400 font-bold">{selectedAlgorithms.length * (selectedSizes.length + (includeCustom ? 1 : 0))}</span> tests
            {' • '}
            Total Operations: <span className="text-cyan-400 font-bold">{selectedAlgorithms.length * (selectedSizes.length + (includeCustom ? 1 : 0)) * iterations * 2}</span> timed ops
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isRunning ? (
              <button
                onClick={handleCancelBenchmark}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" />
                Cancel Execution
              </button>
            ) : (
              <button
                onClick={handleRunBenchmark}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                Run Benchmark Suite
              </button>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        {isRunning && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Benchmarking: <span className="text-white font-bold">{progress.algo}</span> @ {progress.sizeLabel}
              </span>
              <span className="text-slate-400">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
                style={{ width: `${progress.percent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Results Comparison Table */}
      <div className="p-6 rounded-2xl bg-[#0b1329] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Empirical Measurement Results Table
            </h2>
            <p className="text-xs text-slate-400">
              High-precision metrics captured via Web Crypto API and browser microsecond clock.
            </p>
          </div>
          {benchmarkResults && benchmarkResults.length > 0 && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              {benchmarkResults.length} Configurations Measured
            </span>
          )}
        </div>

        {benchmarkResults && benchmarkResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-[11px] text-slate-400">
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">Payload Size</th>
                  <th className="p-3">Enc Avg (ms)</th>
                  <th className="p-3">Enc Median</th>
                  <th className="p-3">Enc Min / Max</th>
                  <th className="p-3">Dec Avg (ms)</th>
                  <th className="p-3">Dec Median</th>
                  <th className="p-3">Throughput (MB/s)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {benchmarkResults.map((r, idx) => {
                  if (r.failed) {
                    return (
                      <tr key={idx} className="bg-rose-950/20">
                        <td className="p-3 font-bold text-rose-300">{r.algorithm}</td>
                        <td className="p-3">{r.sizeLabel}</td>
                        <td colSpan={6} className="p-3 text-rose-400 italic">Error: {r.error}</td>
                        <td className="p-3 text-rose-400 font-bold">FAILED</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-white">
                        <span className={r.algorithm === 'DES' ? 'text-rose-400' : 'text-cyan-400'}>
                          {r.algorithm}
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{r.sizeLabel}</td>
                      <td className="p-3 text-cyan-300 font-semibold">{formatTime(r.encryption.avgMs)}</td>
                      <td className="p-3 text-slate-400">{formatTime(r.encryption.medianMs)}</td>
                      <td className="p-3 text-slate-400 text-[10px]">
                        {formatTime(r.encryption.minMs)} / {formatTime(r.encryption.maxMs)}
                      </td>
                      <td className="p-3 text-cyan-300 font-semibold">{formatTime(r.decryption.avgMs)}</td>
                      <td className="p-3 text-slate-400">{formatTime(r.decryption.medianMs)}</td>
                      <td className="p-3 text-emerald-400 font-bold">{formatThroughput(r.encryption.throughputMBps)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <Activity className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-400">No Empirical Benchmark Data Yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                In strict adherence to academic PBL integrity standards, benchmark results are never simulated or fabricated. Click "Run Benchmark Suite" above to measure real browser cryptography execution times.
              </p>
            </div>
            <button
              onClick={handleRunBenchmark}
              className="px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold transition-colors"
            >
              Start Benchmark Now
            </button>
          </div>
        )}
      </div>

      {/* Experimental Methodology Note */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300">Observation on Measured Browser Results:</span>
          <p className="leading-relaxed">
            In modern desktop and mobile browsers, Web Crypto API AES operations leverage CPU hardware instruction extensions (AES-NI / ARMv8 Crypto Extensions), resulting in exceptional throughput even for large buffers. Conversely, the single DES implementation runs in a pure JavaScript software execution thread without native acceleration. This comparison demonstrates how hardware acceleration amplifies algorithm efficiency in production cybersecurity environments.
          </p>
        </div>
      </div>
    </div>
  );
}
