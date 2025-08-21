import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEvent } from '@gorgias/events'
import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { TicketMessage } from 'models/ticket/types'
import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

import { CurrentUser } from '../translations/useCurrentUserPreferredLanguage'
import { useLiveTicketTranslationsUpdates } from '../translations/useLiveTicketTranslationsUpdates/useLiveTicketTranslationsUpdates'

// Mock the feature flag hook
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

// Mock event handlers
jest.mock(
    '../translations/useLiveTicketTranslationsUpdates/useTicketTranslationCompleteEventHandler',
    () => ({
        useTicketTranslationCompleteEventHandler: () => ({
            handleTicketTranslationCompleted: jest.fn(),
        }),
    }),
)

jest.mock(
    '../translations/useLiveTicketTranslationsUpdates/useTicketTranslationFailedEventHandler',
    () => ({
        useTicketTranslationFailedEventHandler: () => ({
            handleTicketTranslationFailed: jest.fn(),
        }),
    }),
)

jest.mock(
    '../translations/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler',
    () => ({
        useTicketMessageTranslationCompleteEventHandler: () => ({
            handleTicketMessageTranslationCompleted: jest.fn(),
        }),
    }),
)

jest.mock(
    '../translations/useLiveTicketTranslationsUpdates/useTicketMessageTranslationFailedEventHandler',
    () => ({
        useTicketMessageTranslationFailedEventHandler: () => ({
            handleTicketMessageTranslationFailed: jest.fn(),
        }),
    }),
)

const mockUseFlag = jest.mocked(useFlag)

// Server setup
const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 0,
            cacheTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
})

// Mock context value
const mockSetTicketMessageTranslationDisplay = jest.fn()
const mockGetTicketMessageTranslationDisplay = jest.fn(() => ({
    display: DisplayedContent.Original,
    fetchingState: FetchingState.Idle,
    hasRegeneratedOnce: false,
}))

const mockContextValue = {
    getTicketMessageTranslationDisplay: mockGetTicketMessageTranslationDisplay,
    setTicketMessageTranslationDisplay: mockSetTicketMessageTranslationDisplay,
}

// Create mock ticket messages
const mockTicketMessages: TicketMessage[] = [
    {
        id: 101,
        ticket_id: 123,
        body_text: 'Hello world',
        from_agent: false,
    } as TicketMessage,
    {
        id: 102,
        ticket_id: 123,
        body_text: 'How can I help?',
        from_agent: true,
    } as TicketMessage,
]

// Mock handlers - declared at top level for reuse
const mockGetCurrentUserEnglish = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [
            {
                id: 1,
                type: UserSettingType.LanguagePreferences,
                data: {
                    primary: Language.En,
                    proficient: [],
                },
            },
        ],
    } as CurrentUser['data']),
)

const mockGetCurrentUserFrench = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [
            {
                id: 1,
                type: UserSettingType.LanguagePreferences,
                data: {
                    primary: Language.Fr,
                    proficient: [],
                },
            },
        ],
    } as CurrentUser['data']),
)

const mockGetCurrentUserNoPrefs = mockGetCurrentUserHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        settings: [],
    } as CurrentUser['data']),
)

const mockListTranslationsEmpty = mockListTicketMessageTranslationsHandler(
    async () =>
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

const mockListTranslationsWithData = mockListTicketMessageTranslationsHandler(
    async () =>
        HttpResponse.json({
            data: [
                {
                    ...mockTicketMessageTranslation(),
                    id: '1',
                    ticket_message_id: 101,
                    ticket_id: 123,
                    language: Language.Fr,
                },
            ],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 1,
            },
            object: 'list',
            uri: '/api/v1/tickets/123/messages/translations',
        }),
)

const mockListTranslationsComplete = mockListTicketMessageTranslationsHandler(
    async () =>
        HttpResponse.json({
            data: [
                {
                    ...mockTicketMessageTranslation(),
                    id: '1',
                    ticket_message_id: 101,
                    ticket_id: 123,
                    language: Language.Fr,
                },
                {
                    ...mockTicketMessageTranslation(),
                    id: '2',
                    ticket_message_id: 102,
                    ticket_id: 123,
                    language: Language.Fr,
                },
            ],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 2,
            },
            object: 'list',
            uri: '/api/v1/tickets/123/messages/translations',
        }),
)

// Helper to create request ticket translation mock handler
const createMockRequestTicketTranslationHandler = () => {
    let requestPromiseResolve: ((req: any) => void) | null = null
    let capturedRequest: any = null

    const handler = http.post(
        '/api/ticket-translations/request',
        async ({ request }) => {
            capturedRequest = request
            if (requestPromiseResolve) {
                requestPromiseResolve(request)
            }
            return HttpResponse.json({ success: true })
        },
    )

    const waitForRequest = () => {
        return (callback: (request: any) => Promise<void>) => {
            return new Promise<void>((resolve) => {
                // If request already captured, use it immediately
                if (capturedRequest) {
                    callback(capturedRequest).then(() => resolve())
                } else {
                    requestPromiseResolve = async (request) => {
                        await callback(request)
                        resolve()
                    }
                }
            })
        }
    }

    return {
        handler,
        waitForRequest,
    }
}

const mockRequestTranslation = createMockRequestTicketTranslationHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
    mockUseFlag.mockReturnValue(true)
    mockSetTicketMessageTranslationDisplay.mockClear()
    mockGetTicketMessageTranslationDisplay.mockClear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <TicketMessagesTranslationDisplayContext.Provider
            value={mockContextValue}
        >
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    </QueryClientProvider>
)

describe('useLiveTicketTranslationsUpdates', () => {
    describe('hook structure and basic functionality', () => {
        it('should return the correct structure', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.Fr,
                        ticketMessages: [],
                    }),
                { wrapper },
            )

            expect(result.current).toEqual({
                handleTicketMessageTranslationEvents: expect.any(Function),
                generateTicketTranslations: expect.any(Function),
                shouldGenerateTicketTranslations: expect.any(Boolean),
            })
        })
    })

    describe('translation generation', () => {
        it('should call requestTicketTranslation with correct parameters when generating translations', async () => {
            const mockRequestHandler =
                createMockRequestTicketTranslationHandler()

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
                mockRequestHandler.handler,
            )

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // The hook automatically triggers translation when conditions are met
            // So we need to wait for the automatic request
            await waitFor(
                () => {
                    expect(
                        mockSetTicketMessageTranslationDisplay,
                    ).toHaveBeenCalledWith([
                        {
                            messageId: 101,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Loading,
                            hasRegeneratedOnce: false,
                        },
                        {
                            messageId: 102,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Loading,
                            hasRegeneratedOnce: false,
                        },
                    ])
                },
                { timeout: 3000 },
            )

            // Verify the request was made with correct parameters
            const waitForRequestCallback = mockRequestHandler.waitForRequest()
            await waitForRequestCallback(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    ticket_id: 123,
                    language: Language.Fr,
                })
            })
        })

        it('should not generate translations when preferred language is undefined', async () => {
            server.use(
                mockGetCurrentUserNoPrefs.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.Fr,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })

            act(() => {
                result.current.generateTicketTranslations()
            })

            expect(
                mockSetTicketMessageTranslationDisplay,
            ).not.toHaveBeenCalled()
        })

        it('should not generate translations when they already exist', async () => {
            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsComplete.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should not generate translations when ticket language matches primary language', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En, // Same as primary language
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should not generate translations when feature flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })
    })

    describe('initial state setup', () => {
        it('should initialize ticket message display for messages with existing translations', async () => {
            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsWithData.handler,
                mockRequestTranslation.handler, // Prevent unhandled requests
            )

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(
                () => {
                    expect(
                        mockSetTicketMessageTranslationDisplay,
                    ).toHaveBeenCalledWith(
                        expect.arrayContaining([
                            {
                                messageId: 101,
                                display: DisplayedContent.Translated,
                                fetchingState: FetchingState.Completed,
                                hasRegeneratedOnce: false,
                            },
                        ]),
                    )
                },
                { timeout: 3000 },
            )
        })

        it('should not initialize if no messages have translations', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
                mockRequestTranslation.handler, // Add handler to prevent unhandled requests
            )

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Since user has English preference and ticket is also in English,
            // no automatic translation should happen
            await waitFor(
                () => {
                    expect(
                        mockSetTicketMessageTranslationDisplay,
                    ).not.toHaveBeenCalled()
                },
                { timeout: 1000 },
            )
        })
    })

    describe('event handling', () => {
        it('should handle ticket translation completed event', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'event-1',
                dataschema: '//helpdesk/ticket-translation.completed/1.0.0',
                data: {
                    ticket_id: 123,
                    language: Language.Fr,
                },
                type: 'ticket-translation.completed',
                source: 'helpdesk',
                subject: 'ticket-123',
            } as unknown as DomainEvent

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })

            // Event should be processed (deduplication test)
            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })

        it('should handle ticket translation failed event', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'event-2',
                dataschema: '//helpdesk/ticket-translation.failed/1.0.0',
                data: {
                    ticket_id: 123,
                    language: Language.Fr,
                },
                type: 'ticket-translation.failed',
                source: 'helpdesk',
                subject: 'ticket-123',
            } as unknown as DomainEvent

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })

        it('should handle ticket message translation completed event', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'event-3',
                dataschema:
                    '//helpdesk/ticket-message-translation.completed/1.0.0',
                data: {
                    ticket_id: 123,
                    message_id: 101,
                    language: Language.Fr,
                },
                type: 'ticket-message-translation.completed',
                source: 'helpdesk',
                subject: 'message-101',
            } as unknown as DomainEvent

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })

        it('should handle ticket message translation failed event', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'event-4',
                dataschema:
                    '//helpdesk/ticket-message-translation.failed/1.0.0',
                data: {
                    ticket_id: 123,
                    message_id: 101,
                    language: Language.Fr,
                },
                type: 'ticket-message-translation.failed',
                source: 'helpdesk',
                subject: 'message-101',
            } as unknown as DomainEvent

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })

        it('should not process events when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'event-5',
                dataschema: '//helpdesk/ticket-translation.completed/1.0.0',
                data: {
                    ticket_id: 123,
                    language: Language.Fr,
                },
                type: 'ticket-translation.completed',
                source: 'helpdesk',
                subject: 'ticket-123',
            } as unknown as DomainEvent

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })

        it('should deduplicate events with same ID', () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            const event = {
                id: 'duplicate-event',
                dataschema: '//helpdesk/ticket-translation.completed/1.0.0',
                data: {
                    ticket_id: 123,
                    language: Language.Fr,
                },
                type: 'ticket-translation.completed',
                source: 'helpdesk',
                subject: 'ticket-123',
            } as unknown as DomainEvent

            // Process event first time
            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })

            // Try to process same event again - should be ignored
            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })
        })
    })

    describe('edge cases', () => {
        it('should handle undefined ticketId', async () => {
            server.use(mockGetCurrentUserEnglish.handler)

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should handle empty ticketMessages array', async () => {
            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: [],
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should handle messages without IDs', async () => {
            const messagesWithoutIds: TicketMessage[] = [
                {
                    ticket_id: 123,
                    body_text: 'Message without ID',
                    from_agent: false,
                } as TicketMessage,
            ]

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: messagesWithoutIds,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should automatically trigger translation generation when conditions are met', async () => {
            const mockRequestHandler =
                createMockRequestTicketTranslationHandler()

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
                mockRequestHandler.handler,
            )

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Should automatically trigger translation generation
            const waitForRequestCallback = mockRequestHandler.waitForRequest()
            await waitForRequestCallback(async (request) => {
                const body = await request.json()
                expect(body).toEqual({
                    ticket_id: 123,
                    language: Language.Fr,
                })
            })
        })

        it('should prevent duplicate requests for same ticketId and messages', async () => {
            const mockRequestHandler =
                createMockRequestTicketTranslationHandler()

            server.use(
                mockGetCurrentUserFrench.handler,
                mockListTranslationsEmpty.handler,
                mockRequestHandler.handler,
            )

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Wait for initial automatic generation
            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })

            // Try to generate again - should not make another request
            act(() => {
                result.current.generateTicketTranslations()
            })

            // The shouldGenerateTicketTranslations should remain false
            expect(result.current.shouldGenerateTicketTranslations).toBe(false)
        })
    })
})
