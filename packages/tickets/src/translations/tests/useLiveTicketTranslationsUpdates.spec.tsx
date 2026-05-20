import { useFlag } from '@repo/feature-flags'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEvent } from '@gorgias/events'
import {
    mockGetCurrentUserHandler,
    mockListTicketMessageTranslationsHandler,
    mockListTicketTranslationsHandler,
    mockRequestTicketMessageTranslationHandler,
    mockRequestTicketTranslationHandler,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'
import {
    Language,
    TicketMessageSourceType,
    UserSettingType,
} from '@gorgias/helpdesk-types'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import { renderHook } from '../../tests/render.utils'
import type { CurrentUser } from '../hooks/useCurrentUserLanguagePreferences'
import { useLiveTicketTranslationsUpdates } from '../hooks/useLiveTicketTranslationsUpdates/useLiveTicketTranslationsUpdates'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

type UseLiveTicketTranslationsUpdatesParams = Parameters<
    typeof useLiveTicketTranslationsUpdates
>[0]

const {
    mockHandleTicketTranslationCompleted,
    mockHandleTicketTranslationFailed,
    mockHandleTicketMessageTranslationCompleted,
    mockHandleTicketMessageTranslationFailed,
} = vi.hoisted(() => ({
    mockHandleTicketTranslationCompleted: vi.fn(),
    mockHandleTicketTranslationFailed: vi.fn(),
    mockHandleTicketMessageTranslationCompleted: vi.fn(),
    mockHandleTicketMessageTranslationFailed: vi.fn(),
}))

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MessagesTranslations: 'MessagesTranslations',
    },
    useFlag: vi.fn(),
}))

// Mock event handlers
vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationCompleteEventHandler',
    () => ({
        useTicketTranslationCompleteEventHandler: () => ({
            handleTicketTranslationCompleted:
                mockHandleTicketTranslationCompleted,
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationFailedEventHandler',
    () => ({
        useTicketTranslationFailedEventHandler: () => ({
            handleTicketTranslationFailed: mockHandleTicketTranslationFailed,
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler',
    () => ({
        useTicketMessageTranslationCompleteEventHandler: () => ({
            handleTicketMessageTranslationCompleted:
                mockHandleTicketMessageTranslationCompleted,
        }),
    }),
)

vi.mock(
    '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationFailedEventHandler',
    () => ({
        useTicketMessageTranslationFailedEventHandler: () => ({
            handleTicketMessageTranslationFailed:
                mockHandleTicketMessageTranslationFailed,
        }),
    }),
)

const mockUseFlag = vi.mocked(useFlag)

// Server setup
const server = setupServer()

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
            type: TicketMessageSourceType.InternalNote,
        },
    } as TicketMessage,
    ...mockTicketMessages,
]

const mockTicketMessagesWithAiAgentResponse: TicketMessage[] = [
    {
        id: 104,
        ticket_id: 123,
        body_text: 'AI Agent response',
        from_agent: true,
        created_datetime: '2024-01-01T12:00:00Z',
        sender: {
            id: 1,
            name: 'AI Agent',
            firstname: 'AI',
            lastname: 'Agent',
            email: 'bot@658d6f54fbff9b7c6f2d0321',
            meta: null,
        },
        source: {
            type: TicketMessageSourceType.Chat,
        },
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

const mockListTicketTranslationsEmpty = mockListTicketTranslationsHandler(
    async ({ data }) =>
        HttpResponse.json({
            ...data,
            data: [],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
            object: 'list',
            uri: '/api/ticket-translations',
        }),
)

// Default handlers for common scenarios
const defaultHandlers = [
    mockGetCurrentUserEnglish.handler,
    mockListTranslationsEmpty.handler,
    mockListTicketTranslationsEmpty.handler,
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

describe('useLiveTicketTranslationsUpdates', () => {
    describe('hook structure and basic functionality', () => {
        it('should return the correct structure', async () => {
            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.Fr,
                    ticketMessages: [],
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessagesWithInternalNote,
                }),
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

        it('should generate message translations for AI Agent outbound responses', async () => {
            server.use(mockGetCurrentUserFrench.handler)

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessagesWithAiAgentResponse,
                }),
            )

            await waitFor(() => {
                expect(
                    mockSetTicketMessageTranslationDisplay,
                ).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({
                            messageId: 104,
                            fetchingState: FetchingState.Loading,
                        }),
                    ]),
                )
            })
        })

        it('should not generate translations when preferred language is undefined', async () => {
            server.use(
                mockGetCurrentUserNoPrefs.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.Fr,
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En, // Same as primary language
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            expect(mockHandleTicketTranslationCompleted).toHaveBeenCalledTimes(
                1,
            )
            expect(mockHandleTicketTranslationCompleted).toHaveBeenCalledWith(
                event,
            )

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })

            expect(mockHandleTicketTranslationCompleted).toHaveBeenCalledTimes(
                1,
            )
        })

        it('should handle ticket translation failed event', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            expect(mockHandleTicketTranslationFailed).toHaveBeenCalledTimes(1)
            expect(mockHandleTicketTranslationFailed).toHaveBeenCalledWith(
                event,
            )
        })

        it('should handle ticket message translation completed event', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            expect(
                mockHandleTicketMessageTranslationCompleted,
            ).toHaveBeenCalledTimes(1)
            expect(
                mockHandleTicketMessageTranslationCompleted,
            ).toHaveBeenCalledWith(event)
        })

        it('should handle ticket message translation failed event', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            expect(
                mockHandleTicketMessageTranslationFailed,
            ).toHaveBeenCalledTimes(1)
            expect(
                mockHandleTicketMessageTranslationFailed,
            ).toHaveBeenCalledWith(event)
        })

        it('should not process events when feature flag is disabled', async () => {
            mockUseFlag.mockReturnValue(false)

            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            expect(mockHandleTicketTranslationCompleted).not.toHaveBeenCalled()
        })

        it('should deduplicate events with same ID', async () => {
            server.use(
                mockGetCurrentUserEnglish.handler,
                mockListTranslationsEmpty.handler,
            )

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            act(() => {
                result.current.handleTicketMessageTranslationEvents(event)
            })

            expect(mockHandleTicketTranslationCompleted).toHaveBeenCalledTimes(
                1,
            )
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En, // Ticket is in English
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: [],
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: messagesWithoutIds,
                }),
            )

            await waitFor(() => {
                expect(result.current.shouldGenerateTicketTranslations).toBe(
                    false,
                )
            })
        })

        it('should automatically trigger translation generation when conditions are met', async () => {
            server.use(mockGetCurrentUserFrench.handler)

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            const { result } = renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: mockTicketMessages,
                }),
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

            renderHook(() =>
                useLiveTicketTranslationsUpdates({
                    ticketId: 123,
                    ticketLanguage: Language.En,
                    ticketMessages: manyMessages,
                }),
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
