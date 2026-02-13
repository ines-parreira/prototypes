import { renderHook, waitFor } from '@testing-library/react'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../../constants'
import { useInfiniteListTickets } from '../useInfiniteListTickets'
import { useTicketList } from '../useTicketList'

jest.mock('../useInfiniteListTickets')

const mockUseInfiniteListTickets =
    useInfiniteListTickets as jest.MockedFunction<typeof useInfiniteListTickets>

describe('useTicketList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return empty tickets when shopperId is undefined', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(undefined))

        expect(result.current.tickets).toEqual([])
        expect(result.current.totalTickets).toBe(0)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should return empty tickets when shopperId is not an integer', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(1.5))

        expect(result.current.tickets).toEqual([])
        expect(result.current.totalTickets).toBe(0)
    })

    it('should call useInfiniteListTickets with correct parameters', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 0,
                            },
                        },
                    },
                ],
                tickets: [],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        renderHook(() => useTicketList(123))

        expect(mockUseInfiniteListTickets).toHaveBeenCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: 123,
            },
            expect.objectContaining({
                enabled: true,
                staleTime: TICKET_FETCH_STALE_TIME,
                select: expect.any(Function),
            }),
        )
    })

    it('should flatten paginated tickets data', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [
                                { id: 1, subject: 'Ticket 1' },
                                { id: 2, subject: 'Ticket 2' },
                            ],
                            meta: {
                                next_cursor: 'cursor-1',
                                prev_cursor: null,
                                total_resources: 10,
                            },
                        },
                    },
                    {
                        data: {
                            data: [
                                { id: 3, subject: 'Ticket 3' },
                                { id: 4, subject: 'Ticket 4' },
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: 'cursor-1',
                                total_resources: 10,
                            },
                        },
                    },
                ],
                tickets: [
                    { id: 1, subject: 'Ticket 1' },
                    { id: 2, subject: 'Ticket 2' },
                    { id: 3, subject: 'Ticket 3' },
                    { id: 4, subject: 'Ticket 4' },
                ],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.tickets).toHaveLength(4)
        expect(result.current.tickets[0]).toEqual({
            id: 1,
            subject: 'Ticket 1',
        })
        expect(result.current.tickets[3]).toEqual({
            id: 4,
            subject: 'Ticket 4',
        })
    })

    it('should return totalTickets from first page meta', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [{ id: 1, subject: 'Ticket 1' }],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 42,
                            },
                        },
                    },
                ],
                tickets: [{ id: 1, subject: 'Ticket 1' }],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.totalTickets).toBe(42)
    })

    it('should return loading state', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.isLoading).toBe(true)
        expect(result.current.tickets).toEqual([])
    })

    it('should return error state', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.isError).toBe(true)
        expect(result.current.tickets).toEqual([])
    })

    it('should return pagination props', () => {
        const fetchNextPage = jest.fn()
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [{ id: 1, subject: 'Ticket 1' }],
                            meta: {
                                next_cursor: 'next-cursor',
                                prev_cursor: null,
                                total_resources: 10,
                            },
                        },
                    },
                ],
                tickets: [{ id: 1, subject: 'Ticket 1' }],
            },
            isLoading: false,
            isError: false,
            hasNextPage: true,
            fetchNextPage,
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.fetchNextPage).toBe(fetchNextPage)
        expect(result.current.isFetchingNextPage).toBe(false)
    })

    it('should return isFetchingNextPage state', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [{ id: 1, subject: 'Ticket 1' }],
                            meta: {
                                next_cursor: 'next-cursor',
                                prev_cursor: null,
                                total_resources: 10,
                            },
                        },
                    },
                ],
                tickets: [{ id: 1, subject: 'Ticket 1' }],
            },
            isLoading: false,
            isError: false,
            hasNextPage: true,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: true,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.isFetchingNextPage).toBe(true)
    })

    it('should handle empty pages array', () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [],
                tickets: [],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result } = renderHook(() => useTicketList(123))

        expect(result.current.tickets).toEqual([])
        expect(result.current.totalTickets).toBe(0)
    })

    it('should update when shopperId changes', async () => {
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [{ id: 1, subject: 'Ticket 1' }],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 1,
                            },
                        },
                    },
                ],
                tickets: [{ id: 1, subject: 'Ticket 1' }],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        const { result, rerender } = renderHook(
            ({ shopperId }) => useTicketList(shopperId),
            {
                initialProps: { shopperId: 123 },
            },
        )

        expect(result.current.tickets).toHaveLength(1)

        // Change shopperId
        mockUseInfiniteListTickets.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [
                                { id: 2, subject: 'Ticket 2' },
                                { id: 3, subject: 'Ticket 3' },
                            ],
                            meta: {
                                next_cursor: null,
                                prev_cursor: null,
                                total_resources: 2,
                            },
                        },
                    },
                ],
                tickets: [
                    { id: 2, subject: 'Ticket 2' },
                    { id: 3, subject: 'Ticket 3' },
                ],
            },
            isLoading: false,
            isError: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
            isFetchingNextPage: false,
        } as any)

        rerender({ shopperId: 456 })

        await waitFor(() => {
            expect(result.current.tickets).toHaveLength(2)
        })
    })
})
