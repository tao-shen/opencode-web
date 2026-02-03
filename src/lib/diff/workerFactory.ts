// Mock worker factory for Next.js compatibility
export function workerFactory(): Worker {
  // In Next.js web environment, we need to create a simple mock worker
  // This provides basic functionality for diff operations
  const mockWorkerCode = `
    self.onmessage = function(e) {
      // Simple mock implementation
      postMessage({ type: 'diff', result: null });
    };
  `;
  
  const blob = new Blob([mockWorkerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Worker(workerUrl, { type: 'module' });
}
