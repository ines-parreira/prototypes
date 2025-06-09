import { render } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import Header from 'pages/tickets/detail/components/TicketMessages/Header'

import { MessageHeader } from '../MessageHeader'

jest.mock('pages/tickets/detail/components/TicketMessages/Header', () =>
    jest.fn(({ sourceDetails }) => <div>Header{sourceDetails}</div>),
)

describe('MessageHeader', () => {
    it('should call Header with the correct props', () => {
        const message = {} as TicketMessage
        const messageMetadata = <div>Message Metadata</div>
        render(
            <MessageHeader
                message={message}
                isFailed
                isAI
                messageMetadata={messageMetadata}
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
                sourceDetails: messageMetadata,
            }),
            expect.any(Object),
        )
    })
})
