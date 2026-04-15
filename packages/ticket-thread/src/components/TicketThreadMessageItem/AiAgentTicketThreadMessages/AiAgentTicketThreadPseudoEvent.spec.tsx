import { screen } from '@testing-library/react'

import { TicketThreadAiAgentPseudoEventAction } from '../../../hooks/ai-agent-pseudo-events/types'
import { render } from '../../../tests/render.utils'
import { AiAgentTicketThreadPseudoEvent } from './AiAgentTicketThreadPseudoEvent'

describe('AiAgentTicketThreadPseudoEvent', () => {
    const agentName = 'Support Copilot'

    it('renders nothing when there is no pseudo-event content', () => {
        const { container, rerender } = render(
            <AiAgentTicketThreadPseudoEvent />,
        )

        expect(container.firstChild).toBeNull()

        rerender(
            <AiAgentTicketThreadPseudoEvent
                pseudoEvent={{ action: null, tags: [] }}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('skips invalid tag entries while keeping the action row visible', () => {
        render(
            <AiAgentTicketThreadPseudoEvent
                agentName={agentName}
                pseudoEvent={{
                    action: TicketThreadAiAgentPseudoEventAction.Handover,
                    tags: [
                        {
                            id: 1,
                            name: '',
                            decoration: null,
                        },
                        {
                            id: 2,
                            name: 'customer-follow-up',
                            decoration: null,
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByText('Tagged')).toBeInTheDocument()
        expect(screen.getByText('Handed over')).toBeInTheDocument()
        expect(screen.getByText('customer-follow-up')).toBeInTheDocument()
        expect(screen.getAllByText(agentName)).toHaveLength(2)
    })

    it('renders colored tags and tolerates fallback keys for incomplete tags', () => {
        render(
            <AiAgentTicketThreadPseudoEvent
                agentName={agentName}
                pseudoEvent={{
                    action: TicketThreadAiAgentPseudoEventAction.Close,
                    tags: [
                        {
                            name: 'priority-customer',
                            decoration: { color: 'red' },
                        },
                        {
                            decoration: null,
                        } as never,
                    ],
                }}
            />,
        )

        expect(screen.getByText('Tagged')).toBeInTheDocument()
        expect(screen.getByText('priority-customer')).toBeInTheDocument()
        expect(screen.getByText('Closed')).toBeInTheDocument()
        expect(screen.getAllByText(agentName)).toHaveLength(2)
    })

    it('renders only the action row when there are no visible tags', () => {
        render(
            <AiAgentTicketThreadPseudoEvent
                pseudoEvent={{
                    action: TicketThreadAiAgentPseudoEventAction.Snooze,
                    tags: [],
                }}
            />,
        )

        expect(screen.queryByText('Tagged')).not.toBeInTheDocument()
        expect(screen.getByText('Snoozed')).toBeInTheDocument()
        expect(screen.getAllByText('AI Agent')).toHaveLength(1)
    })

    it('renders only the tag row when there is no action', () => {
        render(
            <AiAgentTicketThreadPseudoEvent
                pseudoEvent={{
                    action: null,
                    tags: [
                        {
                            id: 1,
                            name: 'vip-customer',
                            decoration: null,
                        },
                    ],
                }}
            />,
        )

        expect(screen.getByText('Tagged')).toBeInTheDocument()
        expect(screen.getByText('vip-customer')).toBeInTheDocument()
        expect(screen.queryByText('Closed')).not.toBeInTheDocument()
        expect(screen.queryByText('Handed over')).not.toBeInTheDocument()
        expect(screen.queryByText('Snoozed')).not.toBeInTheDocument()
        expect(screen.getAllByText('AI Agent')).toHaveLength(1)
    })
})
