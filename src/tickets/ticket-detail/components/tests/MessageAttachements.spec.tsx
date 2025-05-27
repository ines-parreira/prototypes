import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketChannel, TicketVia } from 'business/types/ticket'
import TicketAttachments from 'pages/tickets/detail/components/ReplyArea/TicketAttachments'

import { MessageAttachments } from '../MessageAttachments'

jest.mock('pages/tickets/detail/components/ReplyArea/TicketAttachments', () =>
    jest.fn(() => null),
)

const TicketAttachmentsMock = jest.mocked(TicketAttachments)

describe('MessageAttachments', () => {
    const baseMessage = {
        id: 1,
        channel: TicketChannel.Email,
        via: TicketVia.Email,
        from_agent: false,
        created_datetime: '',
    } as TicketMessage & { isMessage: boolean }

    it('should return null when message has no attachments', () => {
        const message = { ...baseMessage, attachments: [] }
        const { container } = render(<MessageAttachments message={message} />)
        expect(container.firstChild).toBeNull()
    })

    it('should return null when message has undefined attachments', () => {
        const message = { ...baseMessage, attachments: null }
        const { container } = render(<MessageAttachments message={message} />)
        expect(container.firstChild).toBeNull()
    })

    it('should render attachments when message has attachments', () => {
        const attachments = [
            {
                url: 'https://example.com/file1.pdf',
                content_type: 'application/pdf',
                name: 'file1.pdf',
                public: true,
            },
            {
                url: 'https://example.com/file2.jpg',
                content_type: 'image/jpeg',
                name: 'file2.jpg',
                public: true,
            },
        ]

        const message = {
            ...baseMessage,
            attachments,
        }

        render(<MessageAttachments message={message} />)

        expect(screen.getByText('New media files')).toBeInTheDocument()
        expect(screen.getByText('attachment')).toBeInTheDocument()
        expect(TicketAttachmentsMock).toHaveBeenCalledWith(
            {
                context: 'ticket-message',
                className: expect.any(String),
                attachments: fromJS(attachments),
            },
            expect.anything(),
        )
    })
})
