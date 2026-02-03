import type { CommandExecResult, FilesAPI, RuntimeAPIs } from '@/lib/api/types';

type ExecResult = { success: boolean; results: CommandExecResult[] };

const getBaseUrl = (): string => {
  // In browser, use window.__OPENCODE_URL__ if available (set by Next.js)
  if (typeof window !== 'undefined' && (window as any).__OPENCODE_URL__) {
    return (window as any).__OPENCODE_URL__;
  }
  return "/api";
};

function getRuntimeFilesAPI(): FilesAPI | null {
  if (typeof window === 'undefined') return null;
  const apis = (window as typeof window & { __OPENCHAMBER_RUNTIME_APIS__?: RuntimeAPIs }).__OPENCHAMBER_RUNTIME_APIS__;
  if (apis?.files) {
    return apis.files;
  }
  return null;
}

export async function execCommands(commands: string[], cwd: string): Promise<ExecResult> {
  const runtimeFiles = getRuntimeFilesAPI();
  if (runtimeFiles?.execCommands) {
    return runtimeFiles.execCommands(commands, cwd);
  }

  const response = await fetch(`${getBaseUrl()}/fs/exec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ commands, cwd, background: false }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error((error as { error?: string }).error || 'Command exec failed');
  }

  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; results?: CommandExecResult[] }
    | null;

  return {
    success: Boolean(payload?.success),
    results: Array.isArray(payload?.results) ? payload!.results! : [],
  };
}

export async function execCommand(command: string, cwd: string): Promise<CommandExecResult> {
  const result = await execCommands([command], cwd);
  const first = result.results[0];
  if (!first) {
    return { command, success: result.success };
  }
  return first;
}
