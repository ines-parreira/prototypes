import { render } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import Header from 'pages/tickets/detail/components/TicketMessages/Header'

import { MessageHeader } from '../MessageHeader'
import { MessageMetadata } from '../MessageMetadata'

jest.mock('pages/tickets/detail/components/TicketMessages/Header', () =>
    jest.fn(({ sourceDetails }) => <div>Header{sourceDetails}</div>),
)

jest.mock('tickets/ticket-detail/components/MessageMetadata', () => {
    return {
        MessageMetadata: jest.fn(() => <div>Message Metadata</div>),
    }
})

describe('MessageHeader', () => {
    it('should call Header with the correct props', () => {
        const message = {} as TicketMessage
        const containerRef = { current: document.createElement('div') }
        render(
            <MessageHeader
                message={message}
                containerRef={containerRef}
                isFailed
                isAI
            />,
        )
        expect(Header).toHaveBeenCalledWith(
            expect.objectContaining({
                id: expect.any(String),
                hasError: true,
                isMessageDeleted: false,
                isMessageHidden: false,
                isMessageFromAIAgent: true,
                message,
                containerRef,
                sourceDetails: expect.any(Object),
            }),
            expect.any(Object),
        )
        expect(MessageMetadata).toHaveBeenCalledWith(
            expect.objectContaining({
                message,
            }),
            expect.any(Object),
        )
    })
})
