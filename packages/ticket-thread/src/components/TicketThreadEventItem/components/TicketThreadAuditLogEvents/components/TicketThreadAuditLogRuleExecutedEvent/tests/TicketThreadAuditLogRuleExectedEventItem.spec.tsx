import type { ReactNode } from 'react'

import { screen } from '@testing-library/react'

import { SYSTEM_RULE_TYPE } from '../../../../../../../hooks/events/constants'
import type { TicketThreadAuditLogEventByType } from '../../../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../../../hooks/types'
import { render } from '../../../../../../../tests/render.utils'
import { TicketThreadAuditLogRuleExecutedEvent } from '../TicketThreadAuditLogRuleExecutedEvent'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>
    return {
        ...actual,
        Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
        TooltipTrigger: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
        TooltipContent: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
    }
})

function buildItem(
    eventData: TicketThreadAuditLogEventByType<'rule-executed'>['data']['data'],
): TicketThreadAuditLogEventByType<'rule-executed'> {
    return {
        _tag: TicketThreadItemTag.Events.AuditLogEvent,
        type: 'rule-executed',
        datetime: '2024-03-21T11:00:00Z',
        meta: { attribution: 'none' },
        data: {
            object_type: 'Ticket',
            type: 'rule-executed',
            created_datetime: '2024-03-21T11:00:00Z',
            data: eventData,
        },
    }
}

function renderItem(item: TicketThreadAuditLogEventByType<'rule-executed'>) {
    return render(<TicketThreadAuditLogRuleExecutedEvent item={item} />)
}

describe('TicketThreadAuditLogRuleExecutedEvent', () => {
    it('renders nothing for system rules', () => {
        const { container } = renderItem(
            buildItem({
                type: SYSTEM_RULE_TYPE,
            }),
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders rule link and triggering event type when rule metadata exists', () => {
        renderItem(
            buildItem({
                id: 153054,
                name: 'Divyam - Test auto-assignment',
                triggering_event_type: 'ticket-updated',
            }),
        )

        const ruleLink = screen.getByRole('link', {
            name: 'Divyam - Test auto-assignment',
        })
        expect(ruleLink).toHaveAttribute('href', '/app/settings/rules/153054')
        expect(screen.getByText('on "ticket-updated"')).toBeInTheDocument()
    })

    it('renders fallback wording when rule name is missing', () => {
        renderItem(buildItem({}))

        expect(screen.getByText('Rule executed')).toBeInTheDocument()
    })

    it('renders transformed failed action details', () => {
        renderItem(
            buildItem({
                failed_actions: [
                    {
                        action_name: 'setAssignee',
                        failure_reason: 'user-not-found',
                    },
                ],
            }),
        )

        expect(screen.getByText('Assign agent failed:')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Could not find the agent to assign this ticket to.',
            ),
        ).toBeInTheDocument()
    })
})
