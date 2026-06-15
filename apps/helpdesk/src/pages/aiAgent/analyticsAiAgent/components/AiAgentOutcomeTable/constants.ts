export const AI_AGENT_OUTCOME_LABELS = {
    'Close::With message': 'Closed with a message',
    'Close::Without message': 'Closed without a message',
    'Handover::With message': 'Handover with a message',
    'Handover::Without message': 'Handover without a message',
} as const

export type AiAgentOutcomeCode = keyof typeof AI_AGENT_OUTCOME_LABELS

export const AI_AGENT_OUTCOME_CODES = Object.keys(
    AI_AGENT_OUTCOME_LABELS,
) as AiAgentOutcomeCode[]

export const formatAiAgentOutcome = (code: string): string =>
    AI_AGENT_OUTCOME_LABELS[code as AiAgentOutcomeCode] ?? code

export const AI_AGENT_ROLE = {
    support: 'ai-agent-support',
    shopping: 'ai-agent-sales',
} as const

export const AI_AGENT_OUTCOME_TABLE = {
    title: 'AI Agent Outcome',
    description:
        'Ticket counts per AI Agent outcome, split across all AI agents, the AI Support Agent, and the AI Shopping assistant.',
}
