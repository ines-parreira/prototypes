import { render, screen } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadRegularMessageItem } from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { getDeliveryStatusIcon } from '../getDeliveryStatusIcon'

const baseItem: TicketThreadRegularMessageItem = {
    _tag: TicketThreadItemTag.Messages.Message,
    data: mockTicketMessage({
        failed_datetime: null,
        sent_datetime: null,
        opened_datetime: null,
    }),
    datetime: '2024-03-21T00:00:00Z',
    isPending: false,
}

function renderIcon(item: TicketThreadRegularMessageItem) {
    const icon = getDeliveryStatusIcon(item)
    return render(<>{icon}</>)
}

describe('getDeliveryStatusIcon', () => {
    it('returns null when no status condition is met', () => {
        const { container } = renderIcon(baseItem)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders a spinner when the message is pending', () => {
        const item = { ...baseItem, isPending: true }

        renderIcon(item)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders a sent icon when sent_datetime is set', () => {
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sent_datetime: '2024-03-21T11:00:00Z',
            }),
        }

        renderIcon(item)

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('renders a double-check icon when opened_datetime is set', () => {
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sent_datetime: '2024-03-21T11:00:00Z',
                opened_datetime: '2024-03-21T12:00:00Z',
            }),
        }

        renderIcon(item)

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('renders a failed icon when failed_datetime is set', () => {
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                failed_datetime: '2024-03-21T11:00:00Z',
            }),
        }

        renderIcon(item)

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
})
