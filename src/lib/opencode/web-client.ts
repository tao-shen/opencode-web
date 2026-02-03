// Mock OpenCode Client for web environment
// This provides the same interface as the real client but with web-compatible implementations

import type { 
  Session,
  Message,
  Part,
  Provider,
  Config,
  Model,
  Agent,
  TextPartInput,
  FilePartInput,
  Event,
} from "@opencode-ai/sdk/v2";
import type { SessionStatus } from "@opencode-ai/sdk/v2";

type StreamEvent<TData> = {
  data: TData;
  event?: string;
  id?: string;
  retry?: number;
};

export type RoutedOpencodeEvent = {
  directory: string;
  payload: Event;
};

// Mock types
export type FilesystemEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymbolicLink?: boolean;
};

export type ProjectFileSearchHit = {
  name: string;
  path: string;
  relativePath: string;
  extension?: string;
};

export type DirectorySwitchResult = {
  success: boolean;
  restarted: boolean;
  path: string;
  agents?: Agent[];
  providers?: Provider[];
  models?: unknown[];
};

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'opencode',
    source: 'custom',
    name: 'OpenCode',
    env: [],
    options: {},
    models: {} as Record<string, Model>,
  },
  {
    id: 'anthropic',
    source: 'custom',
    name: 'Anthropic',
    env: [],
    options: {},
    models: {} as Record<string, Model>,
  },
  {
    id: 'openai',
    source: 'custom',
    name: 'OpenAI',
    env: [],
    options: {},
    models: {} as Record<string, Model>,
  },
  {
    id: 'google',
    source: 'custom',
    name: 'Google',
    env: [],
    options: {},
    models: {} as Record<string, Model>,
  },
  {
    id: 'deepseek',
    source: 'custom',
    name: 'DeepSeek',
    env: [],
    options: {},
    models: {} as Record<string, Model>,
  },
];

// Helper to get base URL
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__OPENCODE_URL__) {
    return (window as any).__OPENCODE_URL__;
  }
  return "/api";
};

class MockOpencodeService {
  private baseUrl: string;
  private currentDirectory: string | undefined = undefined;
  private globalSseListeners: Set<(event: RoutedOpencodeEvent) => void> = new Set();

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setDirectory(directory: string | undefined) {
    this.currentDirectory = directory;
  }

  getDirectory(): string | undefined {
    return this.currentDirectory;
  }

  // Session Management
  async listSessions(): Promise<Session[]> {
    const now = Date.now();
    return [
      {
        id: 'mock-session-1',
        title: 'Welcome to OpenChamber Web',
        slug: 'welcome',
        projectID: 'project-1',
        directory: this.currentDirectory || '/',
        version: '1.0.0',
        time: { created: now, updated: now },
      }
    ];
  }

  async createSession(params?: { parentID?: string; title?: string }): Promise<Session> {
    const now = Date.now();
    return {
      id: `session-${Date.now()}`,
      title: params?.title || 'New Session',
      slug: `session-${Date.now()}`,
      projectID: 'project-1',
      directory: this.currentDirectory || '/',
      version: '1.0.0',
      time: { created: now, updated: now },
      parentID: params?.parentID,
    };
  }

  async getSession(id: string): Promise<Session> {
    const now = Date.now();
    return {
      id,
      title: 'Mock Session',
      slug: id,
      projectID: 'project-1',
      directory: this.currentDirectory || '/',
      version: '1.0.0',
      time: { created: now, updated: now },
    };
  }

  async deleteSession(id: string): Promise<boolean> {
    return true;
  }

  async updateSession(id: string, title?: string): Promise<Session> {
    return this.getSession(id);
  }

  async getSessionMessages(id: string, limit?: number): Promise<{ info: Message; parts: Part[] }[]> {
    return [];
  }

  async getSessionTodos(sessionId: string): Promise<Array<{ id: string; content: string; status: string; priority: string }>> {
    return [];
  }

  async sendMessage(params: {
    id: string;
    providerID: string;
    modelID: string;
    text: string;
    prefaceText?: string;
    prefaceTextSynthetic?: boolean;
    agent?: string;
    variant?: string;
    files?: Array<{ type: 'file'; mime: string; filename?: string; url: string }>;
    additionalParts?: Array<{ text: string; synthetic?: boolean; files?: Array<{ type: 'file'; mime: string; filename?: string; url: string }> }>;
    messageId?: string;
    agentMentions?: Array<{ name: string; source?: { value: string; start: number; end: number } }>;
  }): Promise<string> {
    try {
      const response = await fetch(`${getBaseUrl()}/v2/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID: params.id,
          providerID: params.providerID,
          modelID: params.modelID,
          text: params.text,
          agent: params.agent,
          variant: params.variant,
          files: params.files,
          additionalParts: params.additionalParts,
          agentMentions: params.agentMentions,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      return data.messageID || `msg-${Date.now()}`;
    } catch (error) {
      console.error('Send message error:', error);
      // Return a mock ID so the UI doesn't freeze
      return `msg-${Date.now()}`;
    }
  }

  async abortSession(id: string): Promise<boolean> {
    return true;
  }

  async revertSession(sessionId: string, messageId: string, partId?: string): Promise<Session> {
    return this.getSession(sessionId);
  }

  async unrevertSession(sessionId: string): Promise<Session> {
    return this.getSession(sessionId);
  }

  async forkSession(sessionId: string, messageId?: string): Promise<Session> {
    return this.createSession({ title: 'Forked Session' });
  }

  async getSessionStatus(): Promise<Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>> {
    return {};
  }

  async getSessionStatusForDirectory(directory: string | null | undefined): Promise<Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>> {
    return {};
  }

  async getGlobalSessionStatus(): Promise<Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>> {
    return {};
  }

  async getWebServerSessionActivity(): Promise<Record<string, { type: string }> | null> {
    return null;
  }

  // System Info
  async getSystemInfo(): Promise<{ homeDirectory: string; username?: string }> {
    return { homeDirectory: '/home/webuser', username: 'webuser' };
  }

  async getFilesystemHome(): Promise<string> {
    return '/home/webuser';
  }

  async getApiClient(): Promise<any> {
    return this;
  }

  async getCommandDetails(command: string): Promise<{ template?: string }> {
    return {
      template: `Command ${command} executed with $ARGUMENTS`
    };
  }

  // Tools
  async listToolIds(options?: { directory?: string | null }): Promise<string[]> {
    return [];
  }

  // Permissions
  async replyToPermission(requestId: string, reply: 'once' | 'always' | 'reject', options?: { message?: string }): Promise<boolean> {
    return true;
  }

  async listPendingPermissions(): Promise<any[]> {
    return [];
  }

  // Questions
  async replyToQuestion(requestId: string, answers: string[] | string[][]): Promise<boolean> {
    return true;
  }

  async rejectQuestion(requestId: string): Promise<boolean> {
    return true;
  }

  async listPendingQuestions(options?: { directories?: Array<string | null | undefined> }): Promise<any[]> {
    return [];
  }

  // Configuration
  async getConfig(): Promise<Config> {
    return {
      theme: 'dark',
    } as Config;
  }

  async updateConfig(config: Record<string, unknown>): Promise<Config> {
    return this.getConfig();
  }

  async updateConfigPartial(modifier: (config: Config) => Config): Promise<Config> {
    const current = await this.getConfig();
    return modifier(current);
  }

  async getProviders(): Promise<{ providers: Provider[]; default: { [key: string]: string } }> {
    return {
      providers: MOCK_PROVIDERS,
      default: { default: 'opencode' }
    };
  }

  // App Management
  async getApp(): Promise<any> {
    return {
      version: "0.0.3-web",
      config: await this.getConfig()
    };
  }

  async initApp(): Promise<boolean> {
    return true;
  }

  // Agent Management
  async listAgents(): Promise<Agent[]> {
    return [];
  }

  // File Operations
  async readFile(path: string): Promise<string> {
    return `// Mock content for ${path}`;
  }

  async listFiles(directory?: string): Promise<Record<string, unknown>[]> {
    return [];
  }

  async listLocalDirectory(): Promise<Record<string, unknown>[]> {
    return [];
  }

  // Directory Operations
  async probeDirectory(directory: string): Promise<boolean> {
    return true;
  }

  // Event Streaming
  subscribeToGlobalEvents(
    onEvent: (event: RoutedOpencodeEvent) => void,
    onError?: (error: unknown) => void,
    onOpen?: () => void,
    options?: { directory?: string | null }
  ): () => void {
    if (onOpen) setTimeout(() => onOpen(), 0);
    
    setTimeout(() => {
      onEvent({
        directory: options?.directory || 'global',
        payload: {
          type: 'session.created',
          properties: {
            info: {
              id: 'mock-session-1',
              title: 'Welcome',
              slug: 'welcome',
              projectID: 'project-1',
              directory: '/',
              version: '1.0.0',
              time: { created: Date.now(), updated: Date.now() },
            }
          }
        }
      });
    }, 100);

    return () => {};
  }

  subscribeToEvents(
    onMessage: (event: { type: string; properties?: Record<string, unknown> }) => void,
    onError?: (error: unknown) => void,
    onOpen?: () => void,
    directoryOverride?: string | null,
    options?: { scope?: 'global' | 'directory'; key?: string }
  ): () => void {
    if (onOpen) setTimeout(() => onOpen(), 0);
    setTimeout(() => onMessage({ type: 'session_status', properties: { status: 'idle' } }), 100);
    return () => {};
  }

  // Utility methods
  private normalizeCandidatePath(path?: string | null): string | null {
    if (typeof path !== 'string') return null;
    return path.replace(/\\/g, '/');
  }

  async withDirectory<T>(directory: string | undefined | null, fn: () => Promise<T>): Promise<T> {
    const previousDirectory = this.currentDirectory;
    this.currentDirectory = directory || undefined;
    try {
      return await fn();
    } finally {
      this.currentDirectory = previousDirectory;
    }
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }
}

// Create a singleton instance
export const opencodeClient = new MockOpencodeService();

// Export types for compatibility
export type { OpencodeClient } from "@opencode-ai/sdk/v2";
