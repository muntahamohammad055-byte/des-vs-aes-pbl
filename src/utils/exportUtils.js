/**
 * Export and Reporting Utilities
 * Supports CSV, JSON, Markdown file downloads and browser print styling
 */

export function exportToCsv(results, filename = 'des-vs-aes-benchmark.csv') {
  if (!results || results.length === 0) {
    throw new Error('No benchmark data available to export.');
  }

  const headers = [
    'Algorithm',
    'Input Size (Bytes)',
    'Input Size (Label)',
    'Iterations',
    'Setup Time (ms)',
    'Enc Avg (ms)',
    'Enc Median (ms)',
    'Enc Min (ms)',
    'Enc Max (ms)',
    'Enc StdDev (ms)',
    'Enc Throughput (MB/s)',
    'Dec Avg (ms)',
    'Dec Median (ms)',
    'Dec Min (ms)',
    'Dec Max (ms)',
    'Dec StdDev (ms)',
    'Dec Throughput (MB/s)',
    'Timestamp'
  ];

  const rows = results.map(r => {
    if (r.failed) {
      return [
        r.algorithm,
        r.sizeBytes,
        r.sizeLabel,
        'FAILED',
        r.error || 'Execution error'
      ];
    }
    return [
      r.algorithm,
      r.sizeBytes,
      `"${r.sizeLabel}"`,
      r.iterations,
      r.setupTimeMs,
      r.encryption.avgMs,
      r.encryption.medianMs,
      r.encryption.minMs,
      r.encryption.maxMs,
      r.encryption.stdDevMs,
      r.encryption.throughputMBps,
      r.decryption.avgMs,
      r.decryption.medianMs,
      r.decryption.minMs,
      r.decryption.maxMs,
      r.decryption.stdDevMs,
      r.decryption.throughputMBps,
      `"${r.timestamp || new Date().toISOString()}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToJson(results, filename = 'des-vs-aes-benchmark.json') {
  if (!results || results.length === 0) {
    throw new Error('No benchmark data available to export.');
  }

  const payload = {
    project: 'DES vs AES: Performance and Security Comparison',
    metadata: {
      generatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      standards: ['FIPS 46-3 (DES)', 'FIPS 197 (AES)', 'NIST SP 800-38D (AES-GCM)']
    },
    benchmarkResults: results
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToMarkdown(markdownContent, filename = 'des-vs-aes-pbl-documentation.md') {
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export function exportToText(textContent, filename = 'des-vs-aes-pbl-documentation.txt') {
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrint() {
  window.print();
}
