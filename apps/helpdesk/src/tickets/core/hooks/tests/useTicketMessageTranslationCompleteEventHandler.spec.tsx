import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { queryKeys } from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'

import {
    DisplayedContent,
    FetchingState,
    TicketMessagesTranslationDisplayContext,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'

import type { ExtractEvent } from '../translations/types'
import { useTicketMessageTranslationCompleteEventHandler } from '../translations/useLiveTicketTranslationsUpdates/useTicketMessageTranslationCompleteEventHandler'

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
}))

const mockContextValue = {
    getTicketMessageTranslationDisplay: mockGetTicketMessageTranslationDisplay,
    setTicketMessageTranslationDisplay: mockSetTicketMessageTranslationDisplay,
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <TicketMessagesTranslationDisplayContext.Provider
            value={mockContextValue}
        >
            {children}
        </TicketMessagesTranslationDisplayContext.Provider>
    </QueryClientProvider>
)

describe('useTicketMessageTranslationCompleteEventHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockSetTicketMessageTranslationDisplay.mockClear()
        mockGetTicketMessageTranslationDisplay.mockClear()
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
        const mockEvent: ExtractEvent<'//helpdesk/ticket-message-translation.completed/1.0.0'> =
            {
                id: 'test-event-1',
                dataschema:
                    '//helpdesk/ticket-message-translation.completed/1.0.0',
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

        it('should create new data structure when no existing data', () => {
            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Fr,
                ticket_id: 123,
            })

            // No existing data in cache

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
                    },
                ],
            )
        })

        it('should handle empty data array', () => {
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
                    data: [], // Empty data array
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
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
                    data: [mockEvent.data],
                },
            })
        })

        it('should update display state correctly', () => {
            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    mockEvent,
                )
            })

            expect(
                mockSetTicketMessageTranslationDisplay,
            ).toHaveBeenCalledTimes(1)
            expect(mockSetTicketMessageTranslationDisplay).toHaveBeenCalledWith(
                [
                    {
                        messageId: 456,
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                    },
                ],
            )
        })

        it('should handle different languages', () => {
            const spanishEvent: ExtractEvent<'//helpdesk/ticket-message-translation.completed/1.0.0'> =
                {
                    ...mockEvent,
                    data: {
                        ...mockEvent.data,
                        language: Language.Es,
                    },
                }

            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Es,
                ticket_id: 123,
            })

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    spanishEvent,
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
                    data: [spanishEvent.data],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                },
            })
        })

        it('should handle different ticket IDs', () => {
            const differentTicketEvent: ExtractEvent<'//helpdesk/ticket-message-translation.completed/1.0.0'> =
                {
                    ...mockEvent,
                    data: {
                        ...mockEvent.data,
                        ticket_id: 999,
                        ticket_message_id: 777,
                    },
                }

            const queryKey = queryKeys.tickets.listTicketMessageTranslations({
                language: Language.Fr,
                ticket_id: 999,
            })

            const { result } = renderHook(
                () => useTicketMessageTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketMessageTranslationCompleted(
                    differentTicketEvent,
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
                    data: [differentTicketEvent.data],
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
                        messageId: 777,
                        display: DisplayedContent.Translated,
                        fetchingState: FetchingState.Completed,
                    },
                ],
            )
        })
    })
})
