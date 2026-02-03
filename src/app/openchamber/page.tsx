'use client'

import React from 'react'
import { ThemeSystemProvider } from '@/contexts/ThemeSystemContext'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionAuthGate } from '@/components/auth/SessionAuthGate'
import App from '@/App'
import type { RuntimeAPIs } from '@/lib/api/types'

// Mock runtime APIs for web deployment
const mockRuntimeAPIs: RuntimeAPIs = {
  runtime: {
    platform: 'web',
    isDesktop: false,
    isVSCode: false,
  },
  terminal: {
    // Mock Terminal APIs
    createSession: async () => ({ sessionId: 'mock-session', cols: 80, rows: 24 }),
    connect: () => ({ close: () => {} }),
    sendInput: async () => {},
    resize: async () => {},
    close: async () => {},
  },
  git: {
    // Mock Git APIs
    checkIsGitRepository: async () => false,
    getGitStatus: async () => ({
      current: 'main',
      tracking: null,
      ahead: 0,
      behind: 0,
      files: [],
      isClean: true,
    }),
    getGitDiff: async () => ({ diff: '' }),
    getGitFileDiff: async () => ({ original: '', modified: '', path: '' }),
    revertGitFile: async () => {},
    isLinkedWorktree: async () => false,
    getGitBranches: async () => ({
      all: ['main'],
      current: 'main',
      branches: {},
    }),
    deleteGitBranch: async () => ({ success: true }),
    deleteRemoteBranch: async () => ({ success: true }),
    generateCommitMessage: async () => ({ message: { subject: '', highlights: [] } }),
    generatePullRequestDescription: async () => ({ title: '', body: '' }),
    listGitWorktrees: async () => [],
    addGitWorktree: async () => ({ success: true, path: '', branch: '' }),
    removeGitWorktree: async () => ({ success: true }),
    ensureOpenChamberIgnored: async () => {},
    createGitCommit: async () => ({
      success: true,
      commit: '',
      branch: 'main',
      summary: { changes: 0, insertions: 0, deletions: 0 },
    }),
    gitPush: async () => ({
      success: true,
      pushed: [],
      repo: '',
      ref: {},
    }),
    gitPull: async () => ({
      success: true,
      summary: { changes: 0, insertions: 0, deletions: 0 },
      files: [],
      insertions: 0,
      deletions: 0,
    }),
    gitFetch: async () => ({ success: true }),
    checkoutBranch: async () => ({ success: true, branch: 'main' }),
    createBranch: async () => ({ success: true, branch: '' }),
    renameBranch: async () => ({ success: true, branch: '' }),
    getGitLog: async () => ({
      all: [],
      latest: null,
      total: 0,
    }),
    getCommitFiles: async () => ({ files: [] }),
    getCurrentGitIdentity: async () => null,
    setGitIdentity: async () => ({ success: true, profile: {
      id: '',
      name: '',
      userName: '',
      userEmail: '',
    } }),
    getGitIdentities: async () => [],
    createGitIdentity: async () => ({
      id: '',
      name: '',
      userName: '',
      userEmail: '',
    }),
    updateGitIdentity: async () => ({
      id: '',
      name: '',
      userName: '',
      userEmail: '',
    }),
    deleteGitIdentity: async () => {},
  },
  files: {
    // Mock Files APIs
    listDirectory: async () => ({ directory: '', entries: [] }),
    search: async () => [],
    createDirectory: async () => ({ success: true, path: '' }),
  },
  settings: {
    // Mock Settings APIs
    load: async () => ({
      settings: {},
      source: 'web',
    }),
    save: async () => ({
      settings: {},
    }),
  },
  permissions: {
    // Mock Permissions APIs
    requestDirectoryAccess: async () => ({ success: true, path: '' }),
    startAccessingDirectory: async () => ({ success: true }),
    stopAccessingDirectory: async () => ({ success: true }),
  },
  notifications: {
    // Mock Notifications APIs
    notifyAgentCompletion: async () => false,
  },
  tools: {
    // Mock Tools APIs
    getAvailableTools: async () => [],
  },
}

export default function OpenChamberPage() {
  return (
    <div className="h-full w-full">
      <ThemeSystemProvider>
        <ThemeProvider>
          <SessionAuthGate>
            <App apis={mockRuntimeAPIs} />
          </SessionAuthGate>
        </ThemeProvider>
      </ThemeSystemProvider>
    </div>
  )
}