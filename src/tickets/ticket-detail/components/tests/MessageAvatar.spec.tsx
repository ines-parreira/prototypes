import { render } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'
import { Avatar } from '@gorgias/merchant-ui-kit'

import * as predicates from 'models/ticket/predicates'

import { MessageAvatar } from '../MessageAvatar'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Avatar: jest.fn(() => null),
}))

jest.mock('models/ticket/predicates', () => ({
    isTicketMessageDeleted: jest.fn(),
    isTicketMessageHidden: jest.fn(),
}))

const isTicketMessageDeletedMock = jest.mocked(
    predicates.isTicketMessageDeleted,
)
const isTicketMessageHiddenMock = jest.mocked(predicates.isTicketMessageHidden)

describe('MessageAvatar', () => {
    const mockMessage = {
        sender: {
            name: 'Test User',
        },
        meta: {
            profile_picture_url: 'https://example.com/avatar.jpg',
            is_duplicated: false,
        },
    } as TicketMessage

    beforeEach(() => {
        isTicketMessageDeletedMock.mockReturnValue(false)
        isTicketMessageHiddenMock.mockReturnValue(false)
    })

    it('renders avatar with correct props for regular message', () => {
        render(<MessageAvatar message={mockMessage} isAI={false} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test User',
                url: 'https://example.com/avatar.jpg',
                size: 'md',
                shape: 'square',
            }),
            expect.anything(),
        )
    })

    it('renders avatar with AI icon when isAI is true', () => {
        render(<MessageAvatar message={mockMessage} isAI={true} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: expect.any(Object),
            }),
            expect.anything(),
        )
    })

    it('does not render avatar when message is deleted', () => {
        isTicketMessageDeletedMock.mockReturnValue(true)

        render(<MessageAvatar message={mockMessage} isAI={false} />)

        expect(Avatar).not.toHaveBeenCalled()
    })

    it('does not render avatar when message is hidden and not duplicated', () => {
        isTicketMessageHiddenMock.mockReturnValue(true)

        render(<MessageAvatar message={mockMessage} isAI={false} />)

        expect(Avatar).not.toHaveBeenCalled()
    })

    it('renders avatar when message is hidden but duplicated', () => {
        isTicketMessageHiddenMock.mockReturnValue(true)

        const duplicatedMessage: TicketMessage = {
            ...mockMessage,
            meta: {
                ...(mockMessage.meta as Record<string, unknown>),
                is_duplicated: true,
            },
        }

        render(<MessageAvatar message={duplicatedMessage} isAI={false} />)

        expect(Avatar).toHaveBeenCalled()
    })

    it('handles missing meta data gracefully', () => {
        const messageWithoutMeta: TicketMessage = {
            ...mockMessage,
            meta: undefined,
        }

        render(<MessageAvatar message={messageWithoutMeta} isAI={false} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test User',
                url: '',
            }),
            expect.anything(),
        )
    })

    it('handles missing sender name gracefully', () => {
        const messageWithoutSenderName: TicketMessage = {
            ...mockMessage,
            sender: {
                ...mockMessage.sender,
                name: null,
            },
        }

        render(
            <MessageAvatar message={messageWithoutSenderName} isAI={false} />,
        )

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: '',
            }),
            expect.anything(),
        )
    })
})
