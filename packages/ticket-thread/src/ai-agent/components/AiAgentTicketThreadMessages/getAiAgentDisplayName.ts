export const DEFAULT_AI_AGENT_NAME = 'AI Agent'

export function getAiAgentDisplayName(name?: string | null): string {
    const trimmedName = name?.trim()

    return trimmedName || DEFAULT_AI_AGENT_NAME
}
