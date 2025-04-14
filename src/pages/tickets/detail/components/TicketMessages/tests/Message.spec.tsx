import React from 'react'

import { render } from '@testing-library/react'

import { TicketMessage } from 'models/ticket/types'
import Message from 'pages/tickets/detail/components/TicketMessages/Message'

jest.mock('pages/common/components/AIBanner/AIBanner', () => () => (
    <div>AIBanner</div>
))
jest.mock('../Body', () => () => <div>Body</div>)
jest.mock('../Actions', () => () => <div>Actions</div>)
jest.mock('../Attachments', () => () => <div>Attachments</div>)
jest.mock('../Errors', () => () => <div>Errors</div>)
jest.mock('../ReplyDetailsCard', () => () => <div>ReplyDetailsCard</div>)
jest.mock('../SourceDetailsHeader', () => () => <div>SourceDetailsHeader</div>)

describe('Message', () => {
    const defaultProps = {
        message: {
            body_text: 'a test',
            body_html: '<strong>a test</strong>',
            source: {
                type: 'email',
            },
        } as TicketMessage,
        showSourceDetails: false,
        ticketId: 1,
        timezone: 'UTC',
        isAIAgentMessage: false,
        messagePosition: 1,
    }

    it('should render a message with all required sections', () => {
        const { getByText } = render(<Message {...defaultProps} />)
        expect(getByText('Body')).toBeInTheDocument()
        expect(getByText('Attachments')).toBeInTheDocument()
        expect(getByText('Actions')).toBeInTheDocument()
        expect(getByText('Errors')).toBeInTheDocument()
    })

    it('should render the source details if showSourceDetails is true', () => {
        const { getByText } = render(
            <Message {...defaultProps} showSourceDetails />,
        )
        expect(getByText('SourceDetailsHeader')).toBeInTheDocument()
    })

    it('should display an embedded reply details card if meta.replied_to is present', () => {
        const { getByText } = render(
            <Message
                {...defaultProps}
                message={{
                    ...defaultProps.message,
                    meta: {
                        replied_to: {
                            ticket_id: 1,
                            ticket_message_id: 2,
                        },
                    },
                }}
            />,
        )
        expect(getByText('ReplyDetailsCard')).toBeInTheDocument()
    })
})
