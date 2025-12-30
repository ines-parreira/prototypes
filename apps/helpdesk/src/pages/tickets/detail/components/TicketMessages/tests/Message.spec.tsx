import type React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { DisplayedContent, FetchingState } from '@repo/tickets'
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
import type { TicketMessage } from 'models/ticket/types'

import MessageQuoteContext from '../../MessageQuoteContext'
import Message from '../Message'

// Mock the feature flag hook
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = require('@repo/feature-flags')
    .useFlag as jest.MockedFunction<
    typeof import('@repo/feature-flags').useFlag
>

// Mock the translations hook
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    useTicketMessageTranslations: jest.fn(),
    useCurrentUserLanguagePreferences: jest.fn(),
    useTicketMessageDisplayState: jest.fn(),
}))

const mockUseTicketMessageTranslations = require('@repo/tickets')
    .useTicketMessageTranslations as jest.MockedFunction<any>

const mockUseCurrentUserPreferredLanguage = require('@repo/tickets')
    .useCurrentUserLanguagePreferences as jest.MockedFunction<any>

const mockUseTicketMessageDisplayState = require('@repo/tickets')
    .useTicketMessageDisplayState as jest.MockedFunction<any>

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
    mockUseTicketMessageDisplayState.mockReturnValue({
        display: DisplayedContent.Original,
        fetchingState: FetchingState.Idle,
        hasRegeneratedOnce: false,
        setTicketMessageTranslationDisplay: jest.fn(),
    })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

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

// Default MessageQuoteContext value
const defaultMessageQuoteContext = {
    expandedQuotes: [] as number[],
    toggleQuote: jest.fn(),
}

// Test component wrapper
const createWrapper =
    (messageQuoteContextValue = defaultMessageQuoteContext) =>
    ({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore as any}>
            <QueryClientProvider client={appQueryClient}>
                <MessageQuoteContext.Provider value={messageQuoteContextValue}>
                    {children}
                </MessageQuoteContext.Provider>
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
        mockUseTicketMessageDisplayState.mockReturnValue({
            display: DisplayedContent.Original,
            fetchingState: FetchingState.Idle,
            hasRegeneratedOnce: false,
            setTicketMessageTranslationDisplay: jest.fn(),
        })
        defaultMessageQuoteContext.toggleQuote.mockClear()
    })

    it('should render all message sections', () => {
        const wrapper = createWrapper()
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.getByText('Body')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
        expect(screen.getByText('Errors')).toBeInTheDocument()
    })

    it('should render source details when showSourceDetails is true', () => {
        const wrapper = createWrapper()
        render(<Message {...defaultProps} showSourceDetails />, { wrapper })
        expect(screen.getByText('SourceActionsHeader')).toBeInTheDocument()
    })

    it('should render reply details card when meta.replied_to exists', () => {
        const wrapper = createWrapper()
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
        const wrapper = createWrapper()
        render(<Message {...defaultProps} />, { wrapper })
        expect(screen.queryByText('ReplyDetailsCard')).not.toBeInTheDocument()
    })

    it('should not render Actions when isAIAgentMessage is true', () => {
        const wrapper = createWrapper()
        render(<Message {...defaultProps} isAIAgentMessage />, { wrapper })
        expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })

    it('should handle message without id', () => {
        const wrapper = createWrapper()
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
        const wrapper = createWrapper()
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
            const wrapper = createWrapper()
            mockUseFlag.mockReturnValue(false)

            render(<Message {...defaultProps} />, { wrapper })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })

        it('should not render when message has no id', () => {
            const wrapper = createWrapper()
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
            const wrapper = createWrapper()
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })

        it('should render when fetching state is Loading', () => {
            const wrapper = createWrapper()
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Loading,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(screen.getByText('TranslationsDropdown')).toBeInTheDocument()
        })

        it('should render when translations exist', () => {
            const wrapper = createWrapper()
            const mockTranslation = mockTicketMessageTranslation({
                id: '456',
                ticket_message_id: 123,
                stripped_html: '<strong>translated test</strong>',
                stripped_text: 'translated test',
            })

            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: jest.fn(() => mockTranslation),
            })

            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(screen.getByText('TranslationsDropdown')).toBeInTheDocument()
        })

        it('should not render when message is expanded', () => {
            const wrapper = createWrapper({
                expandedQuotes: [123],
                toggleQuote: jest.fn(),
            })

            const mockTranslation = mockTicketMessageTranslation({
                id: '456',
                ticket_message_id: 123,
                stripped_html: '<strong>translated test</strong>',
                stripped_text: 'translated test',
            })

            mockUseTicketMessageTranslations.mockReturnValue({
                getMessageTranslation: jest.fn(() => mockTranslation),
            })

            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Idle,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

            render(<Message {...defaultProps} />, { wrapper })

            expect(
                screen.queryByText('TranslationsDropdown'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Translation display', () => {
        it('should display original message when display type is Original', () => {
            const wrapper = createWrapper()
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Completed,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

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
            const wrapper = createWrapper()
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Translated,
                fetchingState: FetchingState.Completed,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

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
                        translations: expect.objectContaining({
                            stripped_html: '<strong>translated test</strong>',
                            stripped_text: 'translated test',
                        }),
                    }),
                }),
            )
        })

        it('should fall back to original when display is Translated but no translation exists', () => {
            const wrapper = createWrapper()
            mockUseTicketMessageDisplayState.mockReturnValue({
                display: DisplayedContent.Translated,
                fetchingState: FetchingState.Completed,
                hasRegeneratedOnce: false,
                setTicketMessageTranslationDisplay: jest.fn(),
            })

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

    describe('Message quote expansion', () => {
        it.each([
            {
                description: 'when message id is in expandedQuotes',
                expandedQuotes: [456, 123, 789],
                expected: true,
            },
            {
                description: 'when message id is not in expandedQuotes',
                expandedQuotes: [456, 789],
                expected: false,
            },
            {
                description: 'when expandedQuotes is empty',
                expandedQuotes: [],
                expected: false,
            },
        ])(
            'should set isMessageExpanded to $expected $description',
            ({ expandedQuotes, expected }) => {
                const wrapper = createWrapper({
                    expandedQuotes,
                    toggleQuote: jest.fn(),
                })

                render(<Message {...defaultProps} />, { wrapper })

                expect(mockBodyComponent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        isMessageExpanded: expected,
                    }),
                )
            },
        )

        it('should pass isMessageExpanded as false when message has no id', () => {
            const wrapper = createWrapper({
                expandedQuotes: [123],
                toggleQuote: jest.fn(),
            })

            const messageWithoutId = {
                ...defaultProps.message,
                id: undefined,
            } as TicketMessage

            render(<Message {...defaultProps} message={messageWithoutId} />, {
                wrapper,
            })

            expect(mockBodyComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    isMessageExpanded: false,
                }),
            )
        })
    })
})
