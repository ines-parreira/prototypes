import { render, screen, waitFor } from '@testing-library/react'

import type { TicketMessage } from '@gorgias/helpdesk-types'
import { Avatar } from '@gorgias/merchant-ui-kit'

import { useFlag } from 'core/flags'
import * as predicates from 'models/ticket/predicates'
import { getAvatar } from 'pages/common/components/Avatar/utils'
import { assumeMock } from 'utils/testing'

import { AVATAR_SIZE, MessageAvatar } from '../MessageAvatar'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Avatar: jest.fn(() => null),
}))

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('models/ticket/predicates', () => ({
    isTicketMessageDeleted: jest.fn(),
    isTicketMessageHidden: jest.fn(),
}))

jest.mock('pages/common/components/Avatar/utils', () => ({
    getAvatar: jest.fn(),
    getAvatarFromCache: jest.fn(),
}))

jest.mock('pages/tickets/detail/components/TicketMessages/Avatar', () => ({
    Avatar: () => <div>New Avatar</div>,
}))

const isTicketMessageDeletedMock = jest.mocked(
    predicates.isTicketMessageDeleted,
)
const isTicketMessageHiddenMock = jest.mocked(predicates.isTicketMessageHidden)
const getAvatarMock = jest.mocked(getAvatar)

describe('MessageAvatar', () => {
    const mockMessage = {
        sender: {
            name: 'Test User',
            meta: { profile_picture_url: 'https://example.com/avatar.jpg' },
        },
    } as TicketMessage

    beforeEach(() => {
        getAvatarMock.mockResolvedValue('ok')
        isTicketMessageDeletedMock.mockReturnValue(false)
        isTicketMessageHiddenMock.mockReturnValue(false)
        useFlagMock.mockReturnValue(false)
    })

    it('renders avatar with correct props for regular message', () => {
        render(<MessageAvatar message={mockMessage} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                className: expect.any(String),
                name: 'Test User',
                url: 'https://example.com/avatar.jpg',
                size: 'md',
                shape: 'square',
            }),
            expect.anything(),
        )
    })

    it('renders avatar with AI icon when isAI is true', () => {
        render(<MessageAvatar message={mockMessage} isAI />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                icon: expect.any(Object),
            }),
            expect.anything(),
        )
    })

    it('does not render avatar when message is deleted', () => {
        isTicketMessageDeletedMock.mockReturnValue(true)

        render(<MessageAvatar message={mockMessage} />)

        expect(Avatar).not.toHaveBeenCalled()
    })

    it('does not render avatar when message is hidden and not duplicated', () => {
        isTicketMessageHiddenMock.mockReturnValue(true)

        render(<MessageAvatar message={mockMessage} />)

        expect(Avatar).not.toHaveBeenCalled()
    })

    it('renders avatar when message is hidden but duplicated', () => {
        isTicketMessageHiddenMock.mockReturnValue(true)

        const duplicatedMessage: TicketMessage = {
            ...mockMessage,
            meta: {
                is_duplicated: true,
            },
        }

        render(<MessageAvatar message={duplicatedMessage} />)

        expect(Avatar).toHaveBeenCalled()
    })

    it('handles missing meta data gracefully', () => {
        const messageWithoutMeta: TicketMessage = {
            ...mockMessage,
            sender: {
                ...mockMessage.sender,
                meta: undefined,
            },
        }

        render(<MessageAvatar message={messageWithoutMeta} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Test User',
                url: undefined,
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

        render(<MessageAvatar message={messageWithoutSenderName} />)

        expect(Avatar).toHaveBeenCalledWith(
            expect.objectContaining({
                name: '',
            }),
            expect.anything(),
        )
    })

    it('generates avatar url from email when agent profile picture is not defined', async () => {
        const messageWithoutProfilePicture: TicketMessage = {
            ...mockMessage,
            from_agent: false,
            sender: {
                ...mockMessage.sender,
                email: 'test@example.com',
                meta: { profile_picture_url: undefined },
            },
        }

        render(<MessageAvatar message={messageWithoutProfilePicture} />)

        expect(getAvatarMock).toHaveBeenCalledWith({
            email: 'test@example.com',
            size: AVATAR_SIZE,
        })

        await waitFor(() =>
            expect(Avatar).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    url: 'ok',
                }),
                expect.anything(),
            ),
        )
    })

    it('should render the new avatar if the ticket thread revamp is enabled', () => {
        useFlagMock.mockReturnValue(true)
        render(<MessageAvatar message={mockMessage} />)
        expect(screen.getByText('New Avatar')).toBeInTheDocument()
    })
})
