/**
 * Performance Benchmark Service
 * Conducts controlled, reproducible benchmarks comparing DES and AES (128, 192, 256 bits).
 * Features:
 *  - Deterministic and random sample generation
 *  - Configurable warm-up runs (JIT warmup)
 *  - Separate encryption and decryption timing via high-resolution performance.now()
 *  - Setup/Key-generation overhead measured separately
 *  - Statistical calculations: Mean, Median, Min, Max, Standard Deviation, and Throughput (MB/s)
 *  - Progress callback and cancellation support
 */
import { generateAesKey, encryptAesGcm, decryptAesGcm } from './cryptoAes';
import { generateDesKey, encryptDes, decryptDes } from './cryptoDes';

// Helper: compute median of an array of numbers
function calculateMedian(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Helper: compute standard deviation
function calculateStdDev(values, mean) {
  if (!values || values.length <= 1) return 0;
  const sumSquares = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  return Math.sqrt(sumSquares / (values.length - 1));
}

// Helper: compute statistical summary
function computeStats(times, byteLength) {
  if (!times || times.length === 0) {
    return {
      times: [],
      avgMs: 0,
      medianMs: 0,
      minMs: 0,
      maxMs: 0,
      stdDevMs: 0,
      throughputMBps: 0
    };
  }

  const sum = times.reduce((a, b) => a + b, 0);
  const avgMs = sum / times.length;
  const medianMs = calculateMedian(times);
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  const stdDevMs = calculateStdDev(times, avgMs);

  // Throughput: (bytes / 1024 / 1024) MB / (avgMs / 1000) s = MB/s
  const sizeMB = byteLength / (1024 * 1024);
  const throughputMBps = avgMs > 0 ? (sizeMB / (avgMs / 1000)) : 0;

  return {
    times,
    avgMs: Number(avgMs.toFixed(4)),
    medianMs: Number(medianMs.toFixed(4)),
    minMs: Number(minMs.toFixed(4)),
    maxMs: Number(maxMs.toFixed(4)),
    stdDevMs: Number(stdDevMs.toFixed(4)),
    throughputMBps: Number(throughputMBps.toFixed(2))
  };
}

/**
 * Generate sample text of specified byte size
 * Uses a diverse mix of ASCII and Unicode characters to stress test encodings
 * @param {number} targetBytes
 * @returns {string}
 */
export function generateSampleData(targetBytes) {
  const seedChunk = "CybersecurityEngineeringDESvsAESBenchmarkPBLProject2025!#%&*=+\n";
  const chunkBytes = new TextEncoder().encode(seedChunk).length;
  const repetitions = Math.ceil(targetBytes / chunkBytes);
  let result = seedChunk.repeat(repetitions);
  // Slice to exact byte count
  const encoded = new TextEncoder().encode(result);
  if (encoded.length > targetBytes) {
    result = new TextDecoder('utf-8', { fatal: false }).decode(encoded.slice(0, targetBytes));
  }
  return result;
}

/**
 * Run benchmark for a specific algorithm and size
 */
async function benchmarkSingleAlgorithm({
  algorithm, // 'DES', 'AES-128', 'AES-192', 'AES-256'
  plaintext,
  iterations = 5,
  warmupRuns = 2,
  onProgressStep,
  signal
}) {
  const byteLength = new TextEncoder().encode(plaintext).length;

  // 1. Measure Setup / Key Generation Overhead
  const setupStart = performance.now();
  let aesCryptoKey = null;
  let desKeyObj = null;

  if (algorithm.startsWith('AES')) {
    const keyBits = parseInt(algorithm.split('-')[1], 10);
    const generated = await generateAesKey(keyBits);
    aesCryptoKey = generated.key;
  } else {
    desKeyObj = generateDesKey();
  }
  const setupTimeMs = performance.now() - setupStart;

  // 2. Perform Warm-up Runs (discarded to avoid JIT compiler distortion)
  for (let w = 0; w < warmupRuns; w++) {
    if (signal?.aborted) throw new Error('Benchmark aborted by user.');
    if (algorithm.startsWith('AES')) {
      const encrypted = await encryptAesGcm(plaintext, aesCryptoKey);
      await decryptAesGcm(encrypted, aesCryptoKey);
    } else {
      const encrypted = encryptDes(plaintext, desKeyObj.rawBytes);
      decryptDes(encrypted, desKeyObj.rawBytes);
    }
  }

  // 3. Timed Iterations
  const encryptionTimes = [];
  const decryptionTimes = [];

  for (let i = 0; i < iterations; i++) {
    if (signal?.aborted) throw new Error('Benchmark aborted by user.');

    let encTime = 0;
    let decTime = 0;

    if (algorithm.startsWith('AES')) {
      // Encryption
      const encResult = await encryptAesGcm(plaintext, aesCryptoKey);
      encTime = encResult.executionTimeMs;

      // Decryption
      const decResult = await decryptAesGcm(encResult, aesCryptoKey);
      decTime = decResult.executionTimeMs;
    } else {
      // Encryption
      const encResult = encryptDes(plaintext, desKeyObj.rawBytes);
      encTime = encResult.executionTimeMs;

      // Decryption
      const decResult = decryptDes(encResult, desKeyObj.rawBytes);
      decTime = decResult.executionTimeMs;
    }

    encryptionTimes.push(encTime);
    decryptionTimes.push(decTime);

    if (onProgressStep) {
      onProgressStep({
        algorithm,
        iteration: i + 1,
        totalIterations: iterations
      });
    }

    // Yield brief tick to let browser UI remain responsive
    await new Promise(r => setTimeout(r, 0));
  }

  const encStats = computeStats(encryptionTimes, byteLength);
  const decStats = computeStats(decryptionTimes, byteLength);

  return {
    algorithm,
    byteLength,
    iterations,
    warmupRuns,
    setupTimeMs: Number(setupTimeMs.toFixed(4)),
    encryption: encStats,
    decryption: decStats,
    overallThroughputMBps: Number(((encStats.throughputMBps + decStats.throughputMBps) / 2).toFixed(2))
  };
}

/**
 * Execute full benchmark matrix
 * @param {Object} options
 * @param {Array<string>} [options.algorithms] - ['DES', 'AES-128', 'AES-192', 'AES-256']
 * @param {Array<number>} [options.sizes] - array of bytes e.g. [1024, 10240, 102400, 1048576]
 * @param {number} [options.iterations=5]
 * @param {number} [options.warmupRuns=2]
 * @param {Function} [options.onProgress]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<Array<Object>>}
 */
export async function runBenchmarkSuite({
  algorithms = ['DES', 'AES-128', 'AES-192', 'AES-256'],
  sizes = [1024, 10240, 102400, 1048576], // 1KB, 10KB, 100KB, 1MB
  iterations = 5,
  warmupRuns = 2,
  onProgress,
  signal
}) {
  const results = [];
  const totalTasks = algorithms.length * sizes.length;
  let completedTasks = 0;

  for (const size of sizes) {
    if (signal?.aborted) throw new Error('Benchmark aborted by user.');

    // Generate consistent sample data for all algorithms at this size
    const samplePlaintext = generateSampleData(size);

    for (const algo of algorithms) {
      if (signal?.aborted) throw new Error('Benchmark aborted by user.');

      if (onProgress) {
        onProgress({
          status: 'running',
          currentAlgo: algo,
          currentSizeBytes: size,
          currentSizeLabel: formatBytes(size),
          progressPercent: Math.round((completedTasks / totalTasks) * 100)
        });
      }

      try {
        const benchmarkResult = await benchmarkSingleAlgorithm({
          algorithm: algo,
          plaintext: samplePlaintext,
          iterations,
          warmupRuns,
          signal
        });

        results.push({
          ...benchmarkResult,
          sizeBytes: size,
          sizeLabel: formatBytes(size),
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        if (signal?.aborted) throw err;
        results.push({
          algorithm: algo,
          sizeBytes: size,
          sizeLabel: formatBytes(size),
          error: err.message,
          failed: true
        });
      }

      completedTasks++;
      if (onProgress) {
        onProgress({
          status: 'running',
          currentAlgo: algo,
          currentSizeBytes: size,
          currentSizeLabel: formatBytes(size),
          progressPercent: Math.round((completedTasks / totalTasks) * 100)
        });
      }
    }
  }

  if (onProgress) {
    onProgress({
      status: 'completed',
      progressPercent: 100
    });
  }

  return results;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
