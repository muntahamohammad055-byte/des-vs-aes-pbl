/**
 * Formatting Utilities for Cryptographic & Benchmark Data
 */

export function formatBytes(bytes) {
  if (bytes === 0 || bytes === undefined || bytes === null) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatTime(ms) {
  if (ms === undefined || ms === null || isNaN(ms)) return '0.00 ms';
  if (ms < 0.001) return `${(ms * 1000).toFixed(2)} µs`;
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatThroughput(mbps) {
  if (mbps === undefined || mbps === null || isNaN(mbps)) return '0.00 MB/s';
  if (mbps < 0.1) return `${(mbps * 1024).toFixed(2)} KB/s`;
  return `${mbps.toFixed(2)} MB/s`;
}

export function chunkString(str, length = 8) {
  if (!str) return '';
  const regex = new RegExp(`.{1,${length}}`, 'g');
  return (str.match(regex) || []).join(' ');
}

export function truncateMiddle(str, maxLength = 32) {
  if (!str || str.length <= maxLength) return str;
  const half = Math.floor((maxLength - 3) / 2);
  return `${str.slice(0, half)}...${str.slice(-half)}`;
}
