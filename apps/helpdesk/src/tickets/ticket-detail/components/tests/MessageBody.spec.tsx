import { render, screen } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'

import { MessageActions } from '../MessageActions'
import { MessageAttachments } from '../MessageAttachments'
import { MessageBody } from '../MessageBody'

jest.mock('../MessageAttachments', () => ({
    MessageAttachments: jest.fn(() => null),
}))

jest.mock('../MessageActions', () => ({
    MessageActions: jest.fn(() => <div>Actions</div>),
}))

describe('MessageBody', () => {
    const mockMessage = {
        id: 1,
    } as TicketMessage

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders children content', () => {
        render(
            <MessageBody message={mockMessage} isAI={false}>
                <div>Test Child Content</div>
            </MessageBody>,
        )

        expect(screen.getByText('Test Child Content')).toBeInTheDocument()
    })

    it('renders MessageAttachments component', () => {
        render(
            <MessageBody message={mockMessage} isAI={false}>
                <div>Test Child</div>
            </MessageBody>,
        )

        expect(MessageAttachments).toHaveBeenCalledWith(
            { message: mockMessage },
            expect.anything(),
        )
    })

    it('renders MessageActions when isAI is false', () => {
        render(
            <MessageBody message={mockMessage} isAI={false}>
                <div>Test Child</div>
            </MessageBody>,
        )

        expect(MessageActions).toHaveBeenCalledWith(
            { message: mockMessage },
            expect.anything(),
        )
    })

    it('does not render MessageActions when isAI is true', () => {
        render(
            <MessageBody message={mockMessage} isAI={true}>
                <div>Test Child</div>
            </MessageBody>,
        )

        expect(MessageActions).not.toHaveBeenCalled()
    })
})
