import { screen, within } from '@testing-library/react'

import { TicketThreadAuditLogRuleExecutedEvent } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEvents/components/TicketThreadAuditLogRuleExecutedEvent/TicketThreadAuditLogRuleExecutedEvent'
import { SYSTEM_RULE_TYPE } from '#events/constants'
import type { TicketThreadAuditLogEventByType } from '#events/types'
import { getCurrentUserHandler } from '#tests/getCurrentUser.mock'
import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { TicketThreadItemTag } from '#thread/itemTags'

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
    beforeEach(() => {
        server.use(getCurrentUserHandler().handler)
    })

    it('renders nothing for system rules', () => {
        const { container } = renderItem(
            buildItem({
                type: SYSTEM_RULE_TYPE,
            }),
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders rule link and triggering event type when rule metadata exists', async () => {
        const { user } = renderItem(
            buildItem({
                code: "if (ticket.tags.name == 'vip')",
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

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(
            within(tooltip).getByText("if (ticket.tags.name == 'vip')"),
        ).toBeInTheDocument()
    })

    it('renders fallback wording when rule name is missing', () => {
        renderItem(buildItem({}))

        expect(screen.getByText('Rule executed')).toBeInTheDocument()
    })

    it('renders transformed failed action details', async () => {
        const { user } = renderItem(
            buildItem({
                failed_actions: [
                    {
                        action_name: 'setAssignee',
                        failure_reason: 'user-not-found',
                    },
                ],
            }),
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(
            within(tooltip).getByText('Assign agent failed:'),
        ).toBeInTheDocument()
        expect(
            within(tooltip).getByText(
                'Could not find the agent to assign this ticket to.',
            ),
        ).toBeInTheDocument()
    })

    it('truncates long rule preview code', async () => {
        const { user } = renderItem(
            buildItem({
                code: 'a'.repeat(600),
                id: 153054,
                name: 'Long rule',
            }),
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(
            within(tooltip).getByText(
                `${'a'.repeat(454)}... [see the rest of the rule in the settings]`,
            ),
        ).toBeInTheDocument()
    })
})
