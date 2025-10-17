import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockTicketMessageTranslation,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { TicketMessage } from 'models/ticket/types'
import {
    DisplayedContent,
    DisplayType,
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

// Mock the translations hook
jest.mock(
    'tickets/core/hooks/translations/useTicketMessageTranslations',
    () => ({
        useTicketMessageTranslations: jest.fn(),
    }),
)

const mockUseTicketMessageTranslations =
    require('tickets/core/hooks/translations/useTicketMessageTranslations')
        .useTicketMessageTranslations as jest.MockedFunction<any>

// Mock the user language preference hook
jest.mock(
    'tickets/core/hooks/translations/useCurrentUserPreferredLanguage',
    () => ({
        useCurrentUserPreferredLanguage: jest.fn(),
    }),
)

const mockUseCurrentUserPreferredLanguage =
    require('tickets/core/hooks/translations/useCurrentUserPreferredLanguage')
        .useCurrentUserPreferredLanguage as jest.MockedFunction<any>

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
    mockUseTicketMessageTranslations.mockReturnValue({
        getMessageTranslation: jest.fn(() => null),
    })
    mockUseCurrentUserPreferredLanguage.mockReturnValue({
        shouldShowTranslatedContent: jest.fn(() => true),
    })
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
    getTicketMessageTranslationDisplay: jest.fn(
        () =>
            ({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            }) as DisplayType,
    ),
    setTicketMessageTranslationDisplay: jest.fn(),
    allMessageDisplayState: DisplayedContent.Translated,
    setAllTicketMessagesToOriginal: jest.fn(),
    setAllTicketMessagesToTranslated: jest.fn(),
}

// Create mock store
const mockStore = {
    getState: () => ({
        ticket: fromJS({
            id: 1,
            language: 'es',
        }),
    }),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
}

// Test component wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={mockStore as any}>
        <QueryClientProvider client={appQueryClient}>
            <TicketMessagesTranslationDisplayContext.Provider
                value={mockTranslationDisplayContext}
            >
                {children}
            </TicketMessagesTranslationDisplayContext.Provider>
        </QueryClientProvider>
    </Provider>
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

const mockBodyComponent = jest.fn()
jest.mock('../Body', () => (props: any) => {
    mockBodyComponent(props)
    return <div>Body</div>
})

jest.mock('../Errors', () => () => <div>Errors</div>)
jest.mock('../ReplyDetailsCard', () => () => <div>ReplyDetailsCard</div>)
jest.mock('../SourceActionsHeader', () => () => <div>SourceActionsHeader</div>)
jest.mock('../TranslationsDropdown/TranslationsDropdown', () => ({
    TranslationsDropdown: () => <div>TranslationsDropdown</div>,
}))

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
        mockBodyComponent.mockClear()
        mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
            {
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
            },
        )
    })

    it('should render all message sections', () => {
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should render source details when showSourceDetails is true', () => {
        render(<Message {...defaultProps} showSourceDetails />, { wrapper })
        expect(screen.getByText('SourceActionsHeader')).toBeInTheDocument()
    })

    it('should render reply details card when meta.replied_to exists', () => {
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

    it('should not render reply details card when meta.replied_to is absent', () => {
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not render Actions when isAIAgentMessage is true', () => {
        render(<Message {...defaultProps} isAIAgentMessage />, { wrapper })
        expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })

    it('should handle message without id', () => {
        const messageWithoutId = {
            ...defaultProps.message,
            id: undefined,
        } as TicketMessage

        render(<Message {...defaultProps} message={messageWithoutId} />, {
            wrapper,
        })

        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('should show visible class on hover when showSourceDetails is true', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <Message {...defaultProps} showSourceDetails />,
            { wrapper },
        )

        const messageWrapper = container.firstChild as HTMLElement
        await user.hover(messageWrapper)

        const rightWrapper = container.querySelector('.rightWrapper')
        expect(rightWrapper).toHaveClass('visible')

        await user.unhover(messageWrapper)
        expect(rightWrapper).not.toHaveClass('visible')
    })

    describe('TranslationsDropdown visibility', () => {
        it('should not render when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            render(<Message {...defaultProps} />, { wrapper })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })

        it('should not render when message has no id', () => {
            const messageWithoutId = {
                ...defaultProps.message,
                id: undefined,
            } as TicketMessage

            render(<Message {...defaultProps} message={messageWithoutId} />, {
                wrapper,
            })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })

        it('should not render when no translations and fetching state is Idle', () => {
            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                },
            )

            render(<Message {...defaultProps} />, { wrapper })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })

        it('should render when fetching state is Loading', () => {
            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Loading,
                    hasRegeneratedOnce: false,
                },
            )

            render(<Message {...defaultProps} />, { wrapper })

            expect(screen.getByText('TranslationsDropdown')).toBeInTheDocument()
        })

        it('should render when translations exist', () => {
            const mockTranslation = mockTicketMessageTranslation({
                id: '456',
                ticket_message_id: 123,
                stripped_html: '<strong>translated test</strong>',
                stripped_text: 'translated test',
            })

            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: jest.fn(() => mockTranslation),
            })

            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                },
            )

            render(<Message {...defaultProps} />, { wrapper })

            expect(screen.getByText('TranslationsDropdown')).toBeInTheDocument()
        })
    })

    describe('Translation display', () => {
        it('should display original message when display type is Original', () => {
            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            )

            const mockTranslation = mockTicketMessageTranslation({
                id: '456',
                ticket_message_id: 123,
                stripped_html: '<strong>translated test</strong>',
                stripped_text: 'translated test',
            })

            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: jest.fn(() => mockTranslation),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(mockBodyComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.objectContaining({
                        id: 123,
                        body_text: 'a test',
                        body_html: '<strong>a test</strong>',
                    }),
                }),
            )
        })

        it('should display translated content when display type is Translated', () => {
            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            )

            const mockTranslation = mockTicketMessageTranslation({
                id: '456',
                ticket_message_id: 123,
                stripped_html: '<strong>translated test</strong>',
                stripped_text: 'translated test',
            })

            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: jest.fn(() => mockTranslation),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(mockBodyComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.objectContaining({
                        id: 123,
                        body_text: 'a test',
                        body_html: '<strong>a test</strong>',
                        stripped_html: '<strong>translated test</strong>',
                        stripped_text: 'translated test',
                    }),
                }),
            )
        })

        it('should fall back to original when display is Translated but no translation exists', () => {
            mockTranslationDisplayContext.getTicketMessageTranslationDisplay.mockReturnValue(
                {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            )

            render(<Message {...defaultProps} />, { wrapper })

            expect(mockBodyComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.objectContaining({
                        body_text: 'a test',
                        body_html: '<strong>a test</strong>',
                    }),
                }),
            )
        })
    })
})
