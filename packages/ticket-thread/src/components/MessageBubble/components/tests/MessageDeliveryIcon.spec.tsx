import { render, screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { TicketThreadPendingState } from '../../../../hooks/messages/types'
import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { MessageDeliveryIcon } from '../MessageHeader/MessageDeliveryIcon'

function createItem(
    overrides: Partial<TicketThreadRegularMessageItem['data']> = {},
): TicketThreadRegularMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        datetime: '2024-03-21T11:00:00Z',
        data: mockTicketMessage({
            id: 1,
            ticket_id: 123,
            from_agent: true,
            failed_datetime: null,
            opened_datetime: null,
            sent_datetime: null,
            sender: {
                id: 1,
                name: 'Agent Smith',
                firstname: 'Agent',
                lastname: 'Smith',
                email: 'agent@example.com',
                meta: null,
            },
            ...overrides,
        }) as TicketThreadRegularMessageItem['data'],
    }
}

describe('MessageDeliveryIcon', () => {
    it('renders a spinner for active pending messages', () => {
        render(
            <MessageDeliveryIcon
                item={{
                    ...createItem(),
                    pendingState: TicketThreadPendingState.Active,
                }}
            />,
        )

        expect(
            screen.getByRole('progressbar', { name: 'Loading' }),
        ).toBeInTheDocument()
    })

    it('returns null for customer messages without a delivery state', () => {
        const { container } = render(
            <MessageDeliveryIcon
                item={createItem({ from_agent: false, public: true })}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
