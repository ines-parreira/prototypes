import { render, screen } from '@testing-library/react'

import type { TicketThreadEventItem } from '../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { TicketThreadEventItem as TicketThreadEventItemComponent } from '../TicketTheadEventItem'

const eventData = { type: 'ticket-updated', data: { action_name: 'setStatus' } }

function renderItem(item: TicketThreadEventItem) {
    return render(<TicketThreadEventItemComponent item={item} />)
}

describe('TicketThreadEventItem', () => {
    const eventTags = [
        { tag: TicketThreadItemTag.Events.TicketEvent, label: 'ticket event' },
        { tag: TicketThreadItemTag.Events.PhoneEvent, label: 'phone event' },
        {
            tag: TicketThreadItemTag.Events.AuditLogEvent,
            label: 'audit log event',
        },
        {
            tag: TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent,
            label: 'satisfaction survey responded event',
        },
        {
            tag: TicketThreadItemTag.Events.PrivateReplyEvent,
            label: 'private reply event',
        },
        {
            tag: TicketThreadItemTag.Events.ShoppingAssistantEvent,
            label: 'shopping assistant event',
        },
    ]

    it.each(eventTags)('renders $label item', ({ tag }) => {
        renderItem({
            _tag: tag,
            data: eventData,
            datetime: '2024-03-21T11:00:00Z',
        } as TicketThreadEventItem)

        expect(screen.getByText(JSON.stringify(eventData))).toBeInTheDocument()
    })
})
