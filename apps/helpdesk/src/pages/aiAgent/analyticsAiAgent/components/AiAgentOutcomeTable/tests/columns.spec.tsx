import {
    AI_AGENT_OUTCOME_COLUMNS,
    AI_AGENT_OUTCOME_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/columns'
import { formatAiAgentOutcome } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/constants'

describe('AiAgentOutcomeTable columns', () => {
    it('exposes a single "AI Agent outcome" name column formatted via formatAiAgentOutcome', () => {
        expect(AI_AGENT_OUTCOME_NAME_COLUMNS).toEqual([
            {
                accessor: 'entity',
                label: 'AI Agent outcome',
                formatName: formatAiAgentOutcome,
            },
        ])
    })

    it('exposes one column per role with the expected labels and accessors', () => {
        expect(
            AI_AGENT_OUTCOME_COLUMNS.map((col) => [
                col.accessorKey,
                col.label,
                col.metricFormat,
                col.loadingStateKeys,
            ]),
        ).toEqual([
            ['allAgents', 'All AI Agents', 'decimal', ['ticketCount']],
            ['supportAgent', 'AI Support Agent', 'decimal', ['ticketCount']],
            [
                'shoppingAssistant',
                'AI Shopping assistant',
                'decimal',
                ['ticketCount'],
            ],
        ])
    })
})

describe('formatAiAgentOutcome', () => {
    it('maps known outcome codes to their display label', () => {
        expect(formatAiAgentOutcome('Close::With message')).toBe(
            'Closed with a message',
        )
        expect(formatAiAgentOutcome('Close::Without message')).toBe(
            'Closed without a message',
        )
        expect(formatAiAgentOutcome('Handover::With message')).toBe(
            'Handover with a message',
        )
        expect(formatAiAgentOutcome('Handover::Without message')).toBe(
            'Handover without a message',
        )
    })

    it('falls back to the raw value for unknown codes', () => {
        expect(formatAiAgentOutcome('some-unmapped-code')).toBe(
            'some-unmapped-code',
        )
    })
})
