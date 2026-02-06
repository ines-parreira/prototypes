import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEvent } from '@gorgias/events'
import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockRequestTicketMessageTranslationHandler,
    mockRequestTicketTranslationHandler,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'
import { Language, UserSettingType } from '@gorgias/helpdesk-types'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import type { CurrentUser } from '../hooks/useCurrentUserLanguagePreferences'
import { useLiveTicketTranslationsUpdates } from '../hooks/useLiveTicketTranslationsUpdates/useLiveTicketTranslationsUpdates'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

type UseLiveTicketTranslationsUpdatesParams = Parameters<
    typeof useLiveTicketTranslationsUpdates
>[0]

vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn(),
}))

// Mock event handlers
vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationCompleteEventHandler',
    () => ({
        useTicketTranslationCompleteEventHandler: () => ({
            handleTicketTranslationCompleted: vi.fn(),
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationFailedEventHandler',
    () => ({
        useTicketTranslationFailedEventHandler: () => ({
            handleTicketTranslationFailed: vi.fn(),
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler',
    () => ({
        useTicketMessageTranslationCompleteEventHandler: () => ({
            handleTicketMessageTranslationCompleted: vi.fn(),
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationFailedEventHandler',
    () => ({
        useTicketMessageTranslationFailedEventHandler: () => ({
            handleTicketMessageTranslationFailed: vi.fn(),
        }),
    }),
)

const mockUseFlag = vi.mocked(useFlag)

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

// Create mock ticket messages
const mockTicketMessages: TicketMessage[] = [
    {
        id: 101,
        ticket_id: 123,
        body_text: 'Hello world',
        from_agent: false,
        created_datetime: '2024-01-01T10:00:00Z',
    } as TicketMessage,
    {
        id: 102,
        ticket_id: 123,
        body_text: 'How can I help?',
        from_agent: true,
        created_datetime: '2024-01-01T11:00:00Z',
    } as TicketMessage,
]

const mockTicketMessagesWithInternalNote: TicketMessage[] = [
    {
        id: 103,
        ticket_id: 123,
        body_text: 'Internal note',
        from_agent: true,
        created_datetime: '2024-01-01T12:00:00Z',
        source: {
            type: 'internal-note',
        } as any,
    } as TicketMessage,
    ...mockTicketMessages,
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
                    enabled: true,
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
                    enabled: true,
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

// Default mock handlers - declared at top level for reuse
const mockRequestTicketTranslation = mockRequestTicketTranslationHandler()
const mockRequestMessageTranslation =
    mockRequestTicketMessageTranslationHandler()

// Mock handler for ticket translations (for subject translations)
const mockListTicketTranslationsEmpty = http.get(
    '/api/ticket-translations',
    () => {
        return HttpResponse.json({
            data: [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
                total_resources: 0,
            },
            object: 'list',
            uri: '/api/ticket-translations',
        })
    },
)

// Default handlers for common scenarios
const defaultHandlers = [
    mockGetCurrentUserEnglish.handler,
    mockListTranslationsEmpty.handler,
    mockListTicketTranslationsEmpty,
    mockRequestTicketTranslation.handler,
    mockRequestMessageTranslation.handler,
]

// Create a spy for the store's setTicketMessageTranslationDisplay method
const mockSetTicketMessageTranslationDisplay = vi.fn()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    // Spy on the zustand store's setter
    vi.spyOn(
        useTicketMessageTranslationDisplay.getState(),
        'setTicketMessageTranslationDisplay',
    ).mockImplementation(mockSetTicketMessageTranslationDisplay)
})

beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    mockUseFlag.mockReturnValue(true)
    mockSetTicketMessageTranslationDisplay.mockClear()
    // Reset zustand store - wrapped in act to prevent warnings
    act(() => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Translated,
        })
    })
    server.use(...defaultHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useLiveTicketTranslationsUpdates', () => {
    describe('hook structure and basic functionality', () => {
        it('should return the correct structure', async () => {
            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.Fr,
                        ticketMessages: [],
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current).toEqual({
                    handleTicketMessageTranslationEvents: expect.any(Function),
                    generateTicketMessagesTranslations: expect.any(Function),
                    shouldGenerateTicketTranslations: expect.any(Boolean),
                    shouldGenerateTicketSubjectTranslation: expect.any(Boolean),
                    generateTicketSubjectTranslation: expect.any(Function),
                })
            })
        })
    })

    describe('translation generation', () => {
        it('should generate translations automatically when ticket message translations loaded', async () => {
            server.use(mockGetCurrentUserFrench.handler)

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Wait for the hook to stabilize before checking request
            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })

            // Wait for message translation requests to be made
            const waitForFirstRequest =
                mockRequestMessageTranslation.waitForRequest(server)
            await waitForFirstRequest(async (request: any) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    ticket_message_id: expect.any(Number),
                    language: Language.Fr,
                })
            })
        })

        it('should call requestTicketTranslation for ticket subject when no translation exists', async () => {
            server.use(mockGetCurrentUserFrench.handler)

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Verify the ticket subject translation request was made
            const waitForRequestCallback =
                mockRequestTicketTranslation.waitForRequest(server)
            await waitForRequestCallback(async (request: any) => {
                const body = await request.json()
                expect(body).toEqual({
                    ticket_id: 123,
                    language: Language.Fr,
                })
            })
        })

        it('should not generate message translations for internal notes', async () => {
            server.use(mockGetCurrentUserFrench.handler)

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessagesWithInternalNote,
                    }),
                { wrapper },
            )

            // Wait and verify that only non-internal messages get translation display updates
            await waitFor(
                () => {
                    expect(
                        mockSetTicketMessageTranslationDisplay,
                    ).toHaveBeenCalledWith(
                        expect.not.arrayContaining([
                            expect.objectContaining({
                                messageId: 103, // Internal note should not be included
                            }),
                        ]),
                    )
                },
                { timeout: 3000 },
            )

            // Verify only 2 messages (non-internal) get translations
            await waitFor(() => {
                const calls = mockSetTicketMessageTranslationDisplay.mock.calls
                const allMessages = calls.flatMap((call) => call[0])
                const uniqueMessageIds = new Set(
                    allMessages.map((m: any) => m.messageId),
                )
                expect(uniqueMessageIds.has(103)).toBe(false)
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
                result.current.generateTicketMessagesTranslations()
            })

            await waitFor(() => {
                expect(
                    mockSetTicketMessageTranslationDisplay,
                ).not.toHaveBeenCalled()
            })
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
            // Default handlers are already loaded in beforeEach

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
        it('should handle ticket translation completed event', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

        it('should handle ticket translation failed event', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

        it('should handle ticket message translation completed event', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

        it('should handle ticket message translation failed event', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

        it('should not process events when feature flag is disabled', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

        it('should deduplicate events with same ID', async () => {
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

            // Wait for hook to stabilize after initial render
            await waitFor(() => {
                expect(
                    result.current.handleTicketMessageTranslationEvents,
                ).toBeDefined()
            })

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

    describe('language preferences and translation logic', () => {
        it('should respect proficient languages and not translate', async () => {
            const mockUserWithProficientLanguage = mockGetCurrentUserHandler(
                async ({ data }) =>
                    HttpResponse.json({
                        ...data,
                        settings: [
                            {
                                id: 1,
                                type: UserSettingType.LanguagePreferences,
                                data: {
                                    primary: Language.Fr,
                                    proficient: [Language.En], // User is proficient in English
                                },
                            },
                        ],
                    } as CurrentUser['data']),
            )

            server.use(mockUserWithProficientLanguage.handler)

            const { result } = renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En, // Ticket is in English
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

        it('should handle language preference updates dynamically', async () => {
            server.use(mockGetCurrentUserEnglish.handler)

            const { result, rerender } = renderHook(
                (props: Partial<UseLiveTicketTranslationsUpdatesParams> = {}) =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.Fr,
                        ticketMessages: mockTicketMessages,
                        ...props,
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })

            server.use(mockGetCurrentUserFrench.handler)
            rerender()

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
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
            server.use(mockGetCurrentUserFrench.handler)

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: mockTicketMessages,
                    }),
                { wrapper },
            )

            // Should automatically trigger ticket subject translation generation
            const waitForRequestCallback =
                mockRequestTicketTranslation.waitForRequest(server)
            await waitForRequestCallback(async (request: any) => {
                const body = await request.json()
                expect(body).toEqual({
                    ticket_id: 123,
                    language: Language.Fr,
                })
            })

            // Should also trigger message translations
            await waitFor(() => {
                expect(
                    mockSetTicketMessageTranslationDisplay,
                ).toHaveBeenCalled()
            })
        })

        it('should prevent duplicate requests for same ticketId and messages', async () => {
            server.use(mockGetCurrentUserFrench.handler)

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
                result.current.generateTicketMessagesTranslations()
            })

            // The shouldGenerateTicketTranslations should remain false
            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should chunk messages and process them in batches', async () => {
            // Create more than 5 messages to test chunking
            const manyMessages: TicketMessage[] = Array.from(
                { length: 12 },
                (_, i) =>
                    ({
                        id: 200 + i,
                        ticket_id: 123,
                        body_text: `Message ${i}`,
                        from_agent: i % 2 === 0,
                        created_datetime: new Date(
                            2024,
                            0,
                            1,
                            10,
                            i,
                        ).toISOString(),
                    }) as TicketMessage,
            )

            server.use(mockGetCurrentUserFrench.handler)

            renderHook(
                () =>
                    useLiveTicketTranslationsUpdates({
                        ticketId: 123,
                        ticketLanguage: Language.En,
                        ticketMessages: manyMessages,
                    }),
                { wrapper },
            )

            // Wait for translations to be triggered
            await waitFor(
                () => {
                    // Should be called 3 times (12 messages / 5 per chunk = 3 chunks)
                    expect(
                        mockSetTicketMessageTranslationDisplay,
                    ).toHaveBeenCalledTimes(3)

                    // Each call should have at most 5 messages
                    const calls =
                        mockSetTicketMessageTranslationDisplay.mock.calls
                    expect(calls[0][0].length).toBe(5)
                    expect(calls[1][0].length).toBe(5)
                    expect(calls[2][0].length).toBe(2)
                },
                { timeout: 5000 },
            )
        })
    })
})
