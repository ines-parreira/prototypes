import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import type { DomainEventWithType } from '@gorgias/events'
import { queryKeys } from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'

import { useTicket } from '../../hooks/useTicket'
import { useTicketMessageTranslationCompleteEventHandler } from '../hooks/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler'
import { DisplayedContent, FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'

// Mock useTicket to provide ticket data
vi.mock('../../hooks/useTicket', () => ({
    useTicket: vi.fn(),
}))

const mockUseTicket = vi.mocked(useTicket)
const mockSetTicketMessageTranslationDisplay = vi.fn()

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

const createWrapper = (ticketId = '123') => {
    return ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/tickets/${ticketId}`]}>
            <Route path="/tickets/:ticketId">
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Route>
        </MemoryRouter>
    )
}

const wrapper = createWrapper()

describe('useTicketMessageTranslationCompleteEventHandler', () => {
    beforeAll(() => {
        // Spy on the zustand store's setter
        vi.spyOn(
            useTicketMessageTranslationDisplay.getState(),
            'setTicketMessageTranslationDisplay',
        ).mockImplementation(mockSetTicketMessageTranslationDisplay)
    })

    beforeEach(() => {
        vi.clearAllMocks()
        queryClient.clear()
        mockSetTicketMessageTranslationDisplay.mockClear()

        // Default mock implementation - returns ticket with message ID 456
        mockUseTicket.mockReturnValue({
            data: {
                data: {
                    id: 123,
                    messages: [{ id: 456 }],
                },
            },
        } as any)
    })

    describe('hook structure', () => {
        it('should return handleTicketMessageTranslationCompleted function', () => {
            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            expect(result.current).toEqual({
                handleTicketMessageTranslationCompleted: expect.any(Function),
            })
        })
    })

    describe('event handling', () => {
        const mockEvent: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'> =
            {
                id: 'test-event-1',
                dataschema:
                    '//helpdesk/ticket-message-translation.completed/1.0.1',
                data: {
                    id: 'translation-1',
                    ticket_id: 123,
                    ticket_message_id: 456,
                    language: Language.Fr,
                    account_id: 1,
                    completed_datetime: '2023-01-01T00:00:00Z',
                    requested_datetime: '2023-01-01T00:00:00Z',
                    stripped_html: '<p>Translated content</p>',
                    stripped_text: 'Translated content',
                },
                type: 'ticket-message-translation.completed',
                source: 'helpdesk',
                subject: 'message-456',
            }

        it('should update query data and display state when event is handled', () => {
            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Fr,
                ticket_id: 123,
            })

            const existingData = {
                status: 200,
                statusText: 'OK',
                config: {},
                headers: {},
                data: {
                    uri: '',
                    object: 'list',
                    data: [
                        {
                            id: 'existing-translation',
                            ticket_id: 999, // Different ticket_id
                            ticket_message_id: 888,
                            language: Language.Fr,
                            translated_body: 'Existing translation',
                        },
                    ],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 1,
                    },
                },
            }

            queryClient.setQueryData(queryKey, existingData)

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                ...existingData,
                data: {
                    ...existingData.data,
                    data: [
                        {
                            id: 'existing-translation',
                            ticket_id: 999,
                            ticket_message_id: 888,
                            language: Language.Fr,
                            translated_body: 'Existing translation',
                        },
                        mockEvent.data,
                    ],
                },
            })

            expect(mockSetTicketMessageTranslationDisplay).toHaveBeenCalledWith(
                [
                    {
                        messageId: 456,
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: false,
                    },
                ],
            )
        })

        it('should replace existing translation when ticket_id matches', () => {
            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Fr,
                ticket_id: 123,
            })

            const existingData = {
                status: 200,
                statusText: 'OK',
                config: {},
                headers: {},
                data: {
                    uri: '',
                    object: 'list',
                    data: [
                        {
                            id: 'old-translation',
                            ticket_id: 123, // Same ticket_id
                            ticket_message_id: 456,
                            language: Language.Fr,
                            translated_body: 'Old translation',
                            status: 'pending',
                        },
                        {
                            id: 'other-translation',
                            ticket_id: 999,
                            ticket_message_id: 888,
                            language: Language.Fr,
                            translated_body: 'Other translation',
                        },
                    ],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 2,
                    },
                },
            }

            queryClient.setQueryData(queryKey, existingData)

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                ...existingData,
                data: {
                    ...existingData.data,
                    data: [
                        {
                            id: 'other-translation',
                            ticket_id: 999,
                            ticket_message_id: 888,
                            language: Language.Fr,
                            translated_body: 'Other translation',
                        },
                        {
                            id: 'translation-1',
                            ticket_id: 123,
                            ticket_message_id: 456,
                            language: Language.Fr,
                            translated_body: 'Old translation',
                            status: 'pending',
                            account_id: 1,
                            completed_datetime: '2023-01-01T00:00:00Z',
                            requested_datetime: '2023-01-01T00:00:00Z',
                            stripped_html: '<p>Translated content</p>',
                            stripped_text: 'Translated content',
                        },
                    ],
                },
            })
        })

        it('should create new data structure when no existing data or empty array', () => {
            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Fr,
                ticket_id: 123,
            })

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                status: 200,
                statusText: 'OK',
                config: {},
                headers: {},
                data: {
                    uri: '',
                    object: 'list',
                    data: [mockEvent.data],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                },
            })

            expect(mockSetTicketMessageTranslationDisplay).toHaveBeenCalledWith(
                [
                    {
                        messageId: 456,
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                        hasRegeneratedOnce: false,
                    },
                ],
            )
        })
    })

    describe('ticket translations invalidation', () => {
        const mockEvent: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'> =
            {
                id: 'test-event-1',
                dataschema:
                    '//helpdesk/ticket-message-translation.completed/1.0.1',
                data: {
                    id: 'translation-1',
                    ticket_id: 123,
                    ticket_message_id: 456,
                    language: Language.Fr,
                    account_id: 1,
                    completed_datetime: '2023-01-01T00:00:00Z',
                    requested_datetime: '2023-01-01T00:00:00Z',
                    stripped_html: '<p>Translated content</p>',
                    stripped_text: 'Translated content',
                },
                type: 'ticket-message-translation.completed',
                source: 'helpdesk',
                subject: 'message-456',
            }

        it('should invalidate ticket translations queries when first message is translated', () => {
            const ticketTranslationsKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

            queryClient.setQueryData(ticketTranslationsKey, {
                status: 200,
                data: {
                    data: [
                        {
                            id: 123,
                            language: Language.Fr,
                            subject: 'Ticket subject',
                        },
                    ],
                },
            })

            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: ticketTranslationsKey,
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('should not invalidate queries when non-first message is translated', () => {
            const nonFirstMessageEvent: DomainEventWithType<'//helpdesk/ticket-message-translation.completed'> =
                {
                    ...mockEvent,
                    data: {
                        ...mockEvent.data,
                        ticket_message_id: 789,
                    },
                }

            const ticketTranslationsKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

            queryClient.setQueryData(ticketTranslationsKey, {
                status: 200,
                data: {
                    data: [
                        {
                            id: 123,
                            language: Language.Fr,
                            subject: 'Ticket subject',
                        },
                    ],
                },
            })

            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    nonFirstMessageEvent,
                )
            })

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()

            invalidateQueriesSpy.mockRestore()
        })

        it('should not invalidate queries when ticket has no messages', () => {
            // Override mock to return ticket with empty messages array
            mockUseTicket.mockReturnValue({
                data: {
                    data: {
                        id: 123,
                        messages: [],
                    },
                },
            } as any)

            const emptyTicketWrapper = createWrapper('123')

            const ticketTranslationsKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123],
                    },
                },
            ]

            queryClient.setQueryData(ticketTranslationsKey, {
                status: 200,
                data: {
                    data: [
                        {
                            id: 123,
                            language: Language.Fr,
                            subject: 'Ticket subject',
                        },
                    ],
                },
            })

            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper: emptyTicketWrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()

            invalidateQueriesSpy.mockRestore()
        })

        it('should filter queries correctly by ticket_id and array validation', () => {
            const relevantKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

            const irrelevantKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [999, 888],
                    },
                },
            ]

            const invalidKey = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: 123,
                    },
                },
            ]

            queryClient.setQueryData(relevantKey, {
                status: 200,
                data: { data: [] },
            })
            queryClient.setQueryData(irrelevantKey, {
                status: 200,
                data: { data: [] },
            })
            queryClient.setQueryData(invalidKey, {
                status: 200,
                data: { data: [] },
            })

            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: relevantKey,
            })
            expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
                queryKey: irrelevantKey,
            })
            expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
                queryKey: invalidKey,
            })

            invalidateQueriesSpy.mockRestore()
        })

        it('should invalidate multiple matching queries', () => {
            const key1 = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123],
                    },
                },
            ]

            const key2 = [
                'tickets',
                'listTicketTranslations',
                {
                    queryParams: {
                        language: Language.En,
                        ticket_ids: [123, 456],
                    },
                },
            ]

            queryClient.setQueryData(key1, {
                status: 200,
                data: { data: [] },
            })
            queryClient.setQueryData(key2, {
                status: 200,
                data: { data: [] },
            })

            const invalidateQueriesSpy = vi.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2)
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: key1,
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: key2,
            })

            invalidateQueriesSpy.mockRestore()
        })
    })
})
