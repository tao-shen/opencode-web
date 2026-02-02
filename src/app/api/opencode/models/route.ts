import { NextResponse } from 'next/server'

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || 'https://nngpveejjssh.eu-central-1.clawcloudrun.com'

export const runtime = 'edge'

interface Model {
  id: string
  name: string
  providerID: string
  providerName: string
  family: string
}

export async function GET() {
  try {
    const response = await fetch(`${OPENCODE_SERVER}/provider`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.status}`)
    }

    const data = await response.json()
    const models: Model[] = []

    // Extract models from providers
    if (data.all && Array.isArray(data.all)) {
      for (const provider of data.all) {
        if (provider.models) {
          for (const [modelId, model] of Object.entries(provider.models)) {
            const m = model as any
            // Only include models with tool call capability (for coding assistants)
            if (m.capabilities?.toolcall) {
              models.push({
                id: modelId,
                name: m.name || modelId,
                providerID: provider.id,
                providerName: provider.name,
                family: m.family || 'unknown',
              })
            }
          }
        }
      }
    }

    // Sort by provider name and model name
    models.sort((a, b) => {
      if (a.providerName !== b.providerName) {
        return a.providerName.localeCompare(b.providerName)
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: String(error), models: [] },
      { status: 500 }
    )
  }
}
