// Mock worker factory for Next.js compatibility
export function workerFactory(): Worker {
  const mockWorkerCode = `
    self.onmessage = function(e) {
      const data = e.data;
      // Echo back with the same ID format expected by the handler
      postMessage({ 
        type: 'diff', 
        id: data?.id,
        result: data?.oldString === data?.newString ? [] : [[0, data?.oldString || ''], [1, data?.newString || '']]
      });
    };
  `;
  
  const blob = new Blob([mockWorkerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Worker(workerUrl, { type: 'module' });
}
