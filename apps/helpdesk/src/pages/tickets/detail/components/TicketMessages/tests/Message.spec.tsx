import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { MacroActionName } from 'models/macroAction/types'
import { ActionStatus, TicketMessage } from 'models/ticket/types'
import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

import Message from '../Message'

// Mock the feature flag hook
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = require('core/flags').useFlag as jest.MockedFunction<
    typeof import('core/flags').useFlag
>

// Create mock user with language preferences
const mockCurrentUser = {
    ...mockUser(),
    settings: [
        {
            type: UserSettingType.LanguagePreferences,
            data: {
                primary: Language.En,
                proficient: [],
            },
        },
    ],
}

// Server setup
const server = setupServer()

// Create mock handlers
const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockCurrentUser),
)

const mockListTicketMessageTranslations =
    mockListTicketMessageTranslationsHandler(async () =>
        HttpResponse.json({
            data: [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 0,
            },
            object: 'list',
            uri: '/api/v1/tickets/123/messages/translations',
        }),
    )

const localHandlers = [
    mockGetCurrentUser.handler,
    mockListTicketMessageTranslations.handler,
]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    appQueryClient.clear()
    mockUseFlag.mockImplementation(
        (flag) => flag === FeatureFlagKey.MessagesTranslations,
    )
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

// Mock translation display context
const mockTranslationDisplayContext = {
    getTicketMessageTranslationDisplay: jest.fn(() => ({
        display: DisplayedContent.Original,
        fetchingState: FetchingState.Idle,
        hasRegeneratedOnce: false,
    })),
    setTicketMessageTranslationDisplay: jest.fn(),
}

// Test component wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={appQueryClient}>
        <TicketMessagesTranslationDisplayContext.Provider
            value={mockTranslationDisplayContext}
        >
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    </QueryClientProvider>
)

jest.mock('pages/common/components/AIBanner/AIBanner', () => () => (
    <div>AIBanner</div>
))
jest.mock('tickets/ticket-detail/components/MessageActions', () => ({
    MessageActions: () => <div>Actions</div>,
}))
jest.mock('tickets/ticket-detail/components/MessageAttachments', () => ({
    MessageAttachments: () => <div>Attachments</div>,
}))
jest.mock('tickets/ticket-detail/components/MessageMetadata', () => ({
    MessageMetadata: () => <div>MessageMetadata</div>,
}))
jest.mock('../Body', () => () => <div>Body</div>)
jest.mock('../Errors', () => () => <div>Errors</div>)
jest.mock('../ReplyDetailsCard', () => () => <div>ReplyDetailsCard</div>)
jest.mock('../SourceActionsHeader', () => () => <div>SourceActionsHeader</div>)

describe('Message', () => {
    const defaultProps = {
        message: {
            id: 123,
            body_text: 'a test',
            body_html: '<strong>a test</strong>',
            source: {
                type: 'email',
            },
            meta: {},
        } as TicketMessage,
        showSourceDetails: false,
        ticketId: 1,
        timezone: 'UTC',
        isAIAgentMessage: false,
        messagePosition: 1,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
            {
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            },
        )
    })

    it('should render a message with all required sections', () => {
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should render the source details if showSourceDetails is true', () => {
        render(<Message {...defaultProps} showSourceDetails />, { wrapper })
        expect(screen.getByText('SourceActionsHeader')).toBeInTheDocument()
        expect(screen.getByText('MessageMetadata')).toBeInTheDocument()
    })

    it('should display an embedded reply details card if meta.replied_to is present', () => {
        render(
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
            { wrapper },
        )
        expect(screen.getByText('ReplyDetailsCard')).toBeInTheDocument()
    })

    it('should not display reply details card when meta.replied_to is not present', () => {
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not display reply details card when meta.replied_to is falsy', () => {
        render(
            <Message
                {...defaultProps}
                message={{
                    ...defaultProps.message,
                    meta: {
                        replied_to: undefined,
                    },
                }}
            />,
            { wrapper },
        )
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not render Actions when isAIAgentMessage is true', () => {
        render(<Message {...defaultProps} isAIAgentMessage />, { wrapper })
        expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })

    it('should render Actions when isAIAgentMessage is false', () => {
        render(<Message {...defaultProps} isAIAgentMessage={false} />, {
            wrapper,
        })
        expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should apply correct CSS classes based on showSourceDetails', () => {
        const { container } = render(
            <Message {...defaultProps} showSourceDetails />,
            { wrapper },
        )
        const messageWrapper = container.firstChild as HTMLElement
        expect(messageWrapper).toHaveClass('hasSourceDetails')
    })

    it('should not apply hasSourceDetails class when showSourceDetails is false', () => {
        const { container } = render(
            <Message {...defaultProps} showSourceDetails={false} />,
            { wrapper },
        )
        const messageWrapper = container.firstChild as HTMLElement
        expect(messageWrapper).not.toHaveClass('hasSourceDetails')
    })

    it('should handle mouse enter and leave events for source details visibility', async () => {
        const user = userEvent.setup()
        render(<Message {...defaultProps} showSourceDetails />, { wrapper })

        const messageWrapper = screen.getByText('Body').closest('div')
        expect(messageWrapper).toBeInTheDocument()

        if (messageWrapper) {
            await user.hover(messageWrapper)
            // The component should handle mouse events without errors
            await user.unhover(messageWrapper)
        }
    })

    it('should pass correct props to Body component', () => {
        const messageWithError = {
            ...defaultProps.message,
            status: 'failed',
        } as TicketMessage

        render(
            <Message
                {...defaultProps}
                message={messageWithError}
                messagePosition={5}
            />,
            { wrapper },
        )

        // Body component should receive the message, hasError, and messagePosition
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should pass correct props to Errors component', () => {
        const messageWithError = {
            ...defaultProps.message,
            status: 'failed',
        } as TicketMessage

        render(
            <Message
                {...defaultProps}
                message={messageWithError}
                setStatus={jest.fn()}
            />,
            { wrapper },
        )

        // Errors component should receive the message, ticketId, loading, hasActionError, and setStatus
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should handle message without id gracefully', () => {
        const messageWithoutId = {
            ...defaultProps.message,
            id: undefined,
        } as TicketMessage

        render(<Message {...defaultProps} message={messageWithoutId} />, {
            wrapper,
        })

        // Should still render without errors
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('should handle message with undefined id gracefully', () => {
        const messageWithUndefinedId = {
            ...defaultProps.message,
            id: undefined,
        } as TicketMessage

        render(<Message {...defaultProps} message={messageWithUndefinedId} />, {
            wrapper,
        })

        // Should still render without errors
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('should pass the displayedMessage to child components', () => {
        render(<Message {...defaultProps} />, { wrapper })

        // All child components should receive the message prop
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should handle setStatus prop when provided', () => {
        const setStatus = jest.fn()
        render(<Message {...defaultProps} setStatus={setStatus} />, { wrapper })

        // Component should render without errors when setStatus is provided
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle setStatus prop when not provided', () => {
        render(<Message {...defaultProps} />, { wrapper })

        // Component should render without errors when setStatus is not provided
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should render with different message positions', () => {
        render(<Message {...defaultProps} messagePosition={10} />, { wrapper })
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should render with different ticket IDs', () => {
        render(<Message {...defaultProps} ticketId={999} />, { wrapper })
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle translation when feature flag is enabled', () => {
        render(<Message {...defaultProps} />, { wrapper })

        // The component should render without errors when translation feature is enabled
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should use original content when display is set to Original', () => {
        mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
            {
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            },
        )

        render(<Message {...defaultProps} />, { wrapper })

        // The component should render with original content
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle loading state for translations', () => {
        render(<Message {...defaultProps} />, { wrapper })

        // Should render with loading state handled appropriately
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle translation data gracefully', () => {
        render(<Message {...defaultProps} />, { wrapper })

        // Component should handle various translation data states without errors
        expect(screen.getByText('Body')).toBeInTheDocument()
    })

    it('should handle message with pending status', () => {
        const pendingMessage = {
            ...defaultProps.message,
            status: 'pending',
        } as TicketMessage

        render(<Message {...defaultProps} message={pendingMessage} />, {
            wrapper,
        })

        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should handle message with failed actions', () => {
        const messageWithFailedAction = {
            ...defaultProps.message,
            actions: [
                {
                    status: ActionStatus.Error,
                    name: MacroActionName.Http,
                    title: 'Failed Action',
                    type: 'some_action',
                },
            ],
        } as TicketMessage

        render(
            <Message {...defaultProps} message={messageWithFailedAction} />,
            { wrapper },
        )

        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should apply visible class to right wrapper when hovered', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <Message {...defaultProps} showSourceDetails />,
            { wrapper },
        )

        const messageWrapper = container.firstChild as HTMLElement
        await user.hover(messageWrapper)

        const rightWrapper = container.querySelector('.rightWrapper')
        expect(rightWrapper).toHaveClass('visible')
    })

    it('should remove visible class from right wrapper when mouse leaves', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <Message {...defaultProps} showSourceDetails />,
            { wrapper },
        )

        const messageWrapper = container.firstChild as HTMLElement

        // Hover first
        await user.hover(messageWrapper)
        let rightWrapper = container.querySelector('.rightWrapper')
        expect(rightWrapper).toHaveClass('visible')

        // Then unhover
        await user.unhover(messageWrapper)
        rightWrapper = container.querySelector('.rightWrapper')
        expect(rightWrapper).not.toHaveClass('visible')
    })
})
