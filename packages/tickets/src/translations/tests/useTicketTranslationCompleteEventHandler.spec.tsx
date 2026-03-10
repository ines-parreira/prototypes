import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import type { DomainEventWithType } from '@gorgias/events'
import { Language } from '@gorgias/helpdesk-types'

import { KeyPrefixes } from '../hooks/constants'
import { useTicketTranslationCompleteEventHandler } from '../hooks/useLiveTicketTranslationsUpdates/useTicketTranslationCompleteEventHandler'

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useTicketTranslationCompleteEventHandler', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    describe('hook structure', () => {
        it('should return handleTicketTranslationCompleted function', () => {
            const { result } = renderHook(
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            expect(result.current).toEqual({
                handleTicketTranslationCompleted: expect.any(Function),
            })
        })
    })

    describe('event handling', () => {
        const mockEvent: DomainEventWithType<'//helpdesk/ticket-translation.completed'> =
            {
                id: 'test-event-1',
                dataschema: '//helpdesk/ticket-translation.completed/1.0.1',
                data: {
                    ticket_id: 123,
                    language: Language.Fr,
                    account_id: 1,
                    completed_datetime: '2023-01-01T00:00:00Z',
                    id: 'translation-123',
                    requested_datetime: '2023-01-01T00:00:00Z',
                    subject: 'Translated subject',
                },
                type: 'ticket-translation.completed',
                source: 'helpdesk',
                subject: 'ticket-123',
            }

        it('should handle ticket translation completion with no existing data', () => {
            const { result } = renderHook(
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const queryCache = queryClient.getQueryCache()
            const queries = queryCache.findAll({
                queryKey: KeyPrefixes.ticketTranslations,
            })

            expect(queries).toHaveLength(0)
        })

        it('should update existing query data when ticket matches', () => {
            const queryKey = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

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
                            ticket_id: 456,
                            translated_subject: 'Existing subject',
                            translated_excerpt: 'Existing excerpt',
                            language: Language.Fr,
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
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                ...existingData,
                data: {
                    ...existingData.data,
                    data: [
                        {
                            ticket_id: 456,
                            translated_subject: 'Existing subject',
                            translated_excerpt: 'Existing excerpt',
                            language: Language.Fr,
                        },
                        {
                            excerpt: null,
                            ticket_translation_id: null,
                            ...mockEvent.data,
                        },
                    ],
                },
            })
        })

        it('should replace existing ticket translation when ticket_id matches', () => {
            const queryKey = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

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
                            ticket_id: 123,
                            translated_subject: 'Old subject',
                            translated_excerpt: 'Old excerpt',
                            language: Language.Fr,
                        },
                        {
                            ticket_id: 456,
                            translated_subject: 'Other subject',
                            translated_excerpt: 'Other excerpt',
                            language: Language.Fr,
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
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                ...existingData,
                data: {
                    ...existingData.data,
                    data: [
                        {
                            ticket_id: 456,
                            translated_subject: 'Other subject',
                            translated_excerpt: 'Other excerpt',
                            language: Language.Fr,
                        },
                        {
                            excerpt: null,
                            ticket_translation_id: null,
                            ticket_id: 123,
                            language: Language.Fr,
                            translated_subject: 'Old subject',
                            translated_excerpt: 'Old excerpt',
                            account_id: 1,
                            completed_datetime: '2023-01-01T00:00:00Z',
                            id: 'translation-123',
                            requested_datetime: '2023-01-01T00:00:00Z',
                            subject: 'Translated subject',
                        },
                    ],
                },
            })
        })

        it('should not update queries where ticket_id is not included', () => {
            const queryKey = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [456, 789], // Does not include ticket_id 123
                    },
                },
            ]

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
                            ticket_id: 456,
                            translated_subject: 'Existing subject',
                            translated_excerpt: 'Existing excerpt',
                            language: Language.Fr,
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
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual(existingData)
        })

        it('should handle queries with non-array ticket_ids', () => {
            const queryKey = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: 123, // Not an array
                    },
                },
            ]

            const existingData = {
                status: 200,
                statusText: 'OK',
                config: {},
                headers: {},
                data: {
                    uri: '',
                    object: 'list',
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                },
            }

            queryClient.setQueryData(queryKey, existingData)

            const { result } = renderHook(
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual(existingData)
        })

        it('should handle empty data array', () => {
            const queryKey = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

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
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData = queryClient.getQueryData(queryKey)
            expect(updatedData).toEqual({
                ...existingData,
                data: {
                    ...existingData.data,
                    data: [
                        {
                            excerpt: null,
                            ticket_translation_id: null,
                            ...mockEvent.data,
                        },
                    ],
                },
            })
        })

        it('should handle multiple queries with same ticket_id', () => {
            const queryKey1 = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 456],
                    },
                },
            ]

            const queryKey2 = [
                ...KeyPrefixes.ticketTranslations,
                {
                    queryParams: {
                        language: Language.Fr,
                        ticket_ids: [123, 789],
                    },
                },
            ]

            const existingData1 = {
                status: 200,
                statusText: 'OK',
                config: {},
                headers: {},
                data: {
                    uri: '',
                    object: 'list',
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: 0,
                    },
                },
            }

            const existingData2 = {
                ...existingData1,
                data: {
                    ...existingData1.data,
                    data: [
                        {
                            ticket_id: 789,
                            translated_subject: 'Other subject',
                            language: Language.Fr,
                        },
                    ],
                    meta: {
                        ...existingData1.data.meta,
                        total_resources: 1,
                    },
                },
            }

            queryClient.setQueryData(queryKey1, existingData1)
            queryClient.setQueryData(queryKey2, existingData2)

            const { result } = renderHook(
                () => useTicketTranslationCompleteEventHandler(),
                { wrapper },
            )

            act(() => {
                result.current.handleTicketTranslationCompleted(mockEvent)
            })

            const updatedData1 = queryClient.getQueryData(queryKey1)
            const updatedData2 = queryClient.getQueryData(queryKey2)

            expect(updatedData1).toEqual({
                ...existingData1,
                data: {
                    ...existingData1.data,
                    data: [
                        {
                            excerpt: null,
                            ticket_translation_id: null,
                            ...mockEvent.data,
                        },
                    ],
                },
            })

            expect(updatedData2).toEqual({
                ...existingData2,
                data: {
                    ...existingData2.data,
                    data: [
                        {
                            ticket_id: 789,
                            translated_subject: 'Other subject',
                            language: Language.Fr,
                        },
                        {
                            excerpt: null,
                            ticket_translation_id: null,
                            ...mockEvent.data,
                        },
                    ],
                },
            })
        })
    })
})
