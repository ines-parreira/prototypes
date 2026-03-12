import { screen } from '@testing-library/react'

import type { TicketThreadAuditLogEventByType } from '../../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../../hooks/types'
import { getCurrentUserHandler } from '../../../../../../tests/getCurrentUser.mock'
import { render } from '../../../../../../tests/render.utils'
import { server } from '../../../../../../tests/server'
import { TicketThreadAuditLogRuleSuggestionEvent } from '../TicketThreadAuditLogRuleSuggestionEvent'

function buildRuleSuggestionItem(
    type: 'rule-executed' | 'rule-suggestion-suggested',
    data: TicketThreadAuditLogEventByType<'rule-executed'>['data']['data'],
): TicketThreadAuditLogEventByType<
    'rule-executed' | 'rule-suggestion-suggested'
> {
    return {
        _tag: TicketThreadItemTag.Events.AuditLogEvent,
        type,
        datetime: '2024-03-21T11:00:00Z',
        meta: { attribution: 'none' },
        data: {
            object_type: 'Ticket',
            type,
            created_datetime: '2024-03-21T11:00:00Z',
            data,
        },
    } as unknown as TicketThreadAuditLogEventByType<
        'rule-executed' | 'rule-suggestion-suggested'
    >
}

function renderItem(
    item: TicketThreadAuditLogEventByType<
        'rule-executed' | 'rule-suggestion-suggested'
    >,
) {
    return render(<TicketThreadAuditLogRuleSuggestionEvent item={item} />)
}

describe('TicketThreadAuditLogRuleSuggestionEvent', () => {
    beforeEach(() => {
        server.use(getCurrentUserHandler().handler)
    })

    it('renders nothing when slug is missing', () => {
        const { container } = renderItem(
            buildRuleSuggestionItem('rule-suggestion-suggested', {}),
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders suggestion copy for rule-suggestion-suggested events', () => {
        renderItem(
            buildRuleSuggestionItem('rule-suggestion-suggested', {
                slug: 'order-refund',
            }),
        )

        expect(
            screen.getByText(/Gorgias Tip suggested rule/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'order-refund' }),
        ).toHaveAttribute('href', '/app/settings/rules/library?order-refund')
        expect(screen.getByText(/to ticket/i)).toBeInTheDocument()
    })

    it('renders manual-apply copy for rule-executed suggestion-shaped events', () => {
        renderItem(
            buildRuleSuggestionItem('rule-executed', {
                slug: 'priority-routing',
            }),
        )

        expect(screen.getByText(/Rule/i)).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'priority-routing' }),
        ).toHaveAttribute(
            'href',
            '/app/settings/rules/library?priority-routing',
        )
        expect(
            screen.getByText(/applied to ticket manually/i),
        ).toBeInTheDocument()
    })
})
