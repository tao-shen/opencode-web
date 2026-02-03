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
    // Return mock sessions
    return [
      {
        id: 'mock-session-1',
        title: 'Welcome to OpenChamber Web',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        directory: this.currentDirectory || '/',
        status: 'idle',
        messages: [],
        metadata: {},
      }
    ];
  }

  async createSession(params?: { parentID?: string; title?: string }): Promise<Session> {
    const session: Session = {
      id: `session-${Date.now()}`,
      title: params?.title || 'New Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      directory: this.currentDirectory || '/',
      status: 'idle',
      messages: [],
      metadata: {},
    };
    return session;
  }

  async getSession(id: string): Promise<Session> {
    // Return mock session
    return {
      id,
      title: 'Mock Session',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      directory: this.currentDirectory || '/',
      status: 'idle',
      messages: [],
      metadata: {},
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
    files?: Array<{
      type: 'file';
      mime: string;
      filename?: string;
      url: string;
    }>;
    additionalParts?: Array<{
      text: string;
      synthetic?: boolean;
      files?: Array<{
        type: 'file';
        mime: string;
        filename?: string;
        url: string;
      }>;
    }>;
    messageId?: string;
    agentMentions?: Array<{ name: string; source?: { value: string; start: number; end: number } }>;
  }): Promise<string> {
    // Return a mock message ID
    return `msg-${Date.now()}`;
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

  async getSessionStatus(): Promise<
    Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>
  > {
    return {};
  }

  async getSessionStatusForDirectory(
    directory: string | null | undefined
  ): Promise<Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>> {
    return {};
  }

  async getGlobalSessionStatus(): Promise<
    Record<string, { type: "idle" | "busy" | "retry"; attempt?: number; message?: string; next?: number }>
  > {
    return {};
  }

  async getWebServerSessionActivity(): Promise<Record<string, { type: string }> | null> {
    return null;
  }

  // System Info
  async getSystemInfo(): Promise<{ homeDirectory: string; username?: string }> {
    return {
      homeDirectory: '/home/webuser',
      username: 'webuser'
    };
  }

  // Tools
  async listToolIds(options?: { directory?: string | null }): Promise<string[]> {
    return [];
  }

  // Permissions
  async replyToPermission(
    requestId: string,
    reply: 'once' | 'always' | 'reject',
    options?: { message?: string }
  ): Promise<boolean> {
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
      providers: [],
      models: {},
      agents: [],
      settings: {},
      version: '0.0.3-web',
    };
  }

  async updateConfig(config: Record<string, unknown>): Promise<Config> {
    return this.getConfig();
  }

  async updateConfigPartial(modifier: (config: Config) => Config): Promise<Config> {
    const current = await this.getConfig();
    return modifier(current);
  }

  async getProviders(): Promise<{
    providers: Provider[];
    default: { [key: string]: string };
  }> {
    return {
      providers: [],
      default: {}
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
    return `// Mock content for ${path}\n// This is a web-compatible implementation`;
  }

  async listFiles(directory?: string): Promise<Record<string, unknown>[]> {
    return [];
  }

  // Directory Operations
  async probeDirectory(directory: string): Promise<boolean> {
    return true;
  }

  // Event Streaming (Mock Implementation)
  subscribeToGlobalEvents(
    onEvent: (event: RoutedOpencodeEvent) => void,
    onError?: (error: unknown) => void,
    onOpen?: () => void,
    options?: { directory?: string | null }
  ): () => void {
    // Mock implementation - just return a cleanup function
    if (onOpen) {
      setTimeout(() => onOpen(), 0);
    }
    
    // Send a mock event
    setTimeout(() => {
      const mockEvent: RoutedOpencodeEvent = {
        directory: options?.directory || 'global',
        payload: {
          type: 'session_created',
          timestamp: new Date().toISOString(),
          properties: {}
        }
      };
      onEvent(mockEvent);
    }, 100);

    return () => {
      // Cleanup
    };
  }

  subscribeToEvents(
    onMessage: (event: { type: string; properties?: Record<string, unknown> }) => void,
    onError?: (error: unknown) => void,
    onOpen?: () => void,
    directoryOverride?: string | null,
    options?: { scope?: 'global' | 'directory'; key?: string }
  ): () => void {
    // Mock implementation
    if (onOpen) {
      setTimeout(() => onOpen(), 0);
    }
    
    // Send mock events
    const mockEvent = {
      type: 'session_status',
      properties: {
        status: 'idle'
      }
    };
    
    setTimeout(() => onMessage(mockEvent), 100);

    return () => {
      // Cleanup
    };
  }

  // Utility methods
  private normalizeCandidatePath(path?: string | null): string | null {
    if (typeof path !== 'string') {
      return null;
    }
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