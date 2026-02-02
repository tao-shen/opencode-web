import { createOpencodeClient } from '@opencode-ai/sdk/client'

const OPENCODE_SERVER_URL = process.env.NEXT_PUBLIC_OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export const opencodeClient = createOpencodeClient({
  baseUrl: OPENCODE_SERVER_URL,
})

export function getOpenCodeServerUrl(): string {
  return OPENCODE_SERVER_URL
}
