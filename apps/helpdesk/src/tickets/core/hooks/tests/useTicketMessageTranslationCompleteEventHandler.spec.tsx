import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

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

const mockStore = configureMockStore([thunk])

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
    allMessageDisplayState: DisplayedContent.Translated,
    setAllTicketMessagesToOriginal: jest.fn(),
    setAllTicketMessagesToTranslated: jest.fn(),
}

const mockTicket = fromJS({
    id: 123,
    messages: [
        { id: 456, body_text: 'First message' },
        { id: 789, body_text: 'Second message' },
    ],
})

const createWrapper = (ticketData = mockTicket) => {
    const store = mockStore({
        ticket: ticketData,
    })

    return ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <TicketMessagesTranslationDisplayContext.Provider
                    value={mockContextValue}
                >
                    {children}
                </TicketMessagesTranslationDisplayContext.Provider>
            </QueryClientProvider>
        </Provider>
    )
}

const wrapper = createWrapper()

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

            const invalidateQueriesSpy = jest.spyOn(
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
            const nonFirstMessageEvent: ExtractEvent<'//helpdesk/ticket-message-translation.completed/1.0.0'> =
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

            const invalidateQueriesSpy = jest.spyOn(
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
            const emptyTicketWrapper = createWrapper(
                fromJS({
                    id: 123,
                    messages: [],
                }),
            )

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

            const invalidateQueriesSpy = jest.spyOn(
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

            const invalidateQueriesSpy = jest.spyOn(
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

            const invalidateQueriesSpy = jest.spyOn(
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
