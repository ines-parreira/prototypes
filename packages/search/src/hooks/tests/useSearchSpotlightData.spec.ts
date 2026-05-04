import { useDebouncedValue } from '@repo/hooks'
import { renderHook } from '@repo/testing/vitest'

import {
    mockCustomerSearchResponse,
    mockSearchTicketsResponse,
    mockSearchVoiceCallsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'
import {
    useSearchAllCustomers,
    useSearchAllTickets,
} from '@gorgias/helpdesk-queries'

import { useInfiniteVoiceCallSearch } from '../useInfiniteVoiceCallSearch'
import { useSearchSpotlightData } from '../useSearchSpotlightData'

vi.mock('@repo/hooks', () => ({
    useDebouncedValue: vi.fn(),
}))

vi.mock('@gorgias/helpdesk-queries', () => ({
    useSearchAllCustomers: vi.fn(),
    useSearchAllTickets: vi.fn(),
}))

vi.mock('../useInfiniteVoiceCallSearch', () => ({
    useInfiniteVoiceCallSearch: vi.fn(),
}))

function createInfiniteQueryResult(overrides: Record<string, any> = {}) {
    return {
        data: undefined,
        items: [],
        isLoading: false,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: vi.fn(),
        ...overrides,
    } as never
}

describe('useSearchSpotlightData', () => {
    beforeEach(() => {
        vi.mocked(useDebouncedValue).mockImplementation((value) => value)
        vi.mocked(useSearchAllTickets).mockReturnValue(
            createInfiniteQueryResult(),
        )
        vi.mocked(useSearchAllCustomers).mockReturnValue(
            createInfiniteQueryResult(),
        )
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult(),
        )
    })

    it('stays out of search mode for an empty query without running search queries', () => {
        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: '   ',
                isOpen: true,
                showCalls: false,
            }),
        )

        expect(result.current.isSearchMode).toBe(false)
        expect(result.current.isLoading).toBe(false)
        expect(vi.mocked(useSearchAllTickets)).toHaveBeenCalledWith(
            { search: '', filters: '' },
            { limit: 1, with_highlights: true, track_total_hits: true },
            { exhaustPages: false, query: { enabled: false } },
        )
        expect(vi.mocked(useSearchAllCustomers)).toHaveBeenCalledWith(
            { search: '' },
            { limit: 1, with_highlights: true },
            { exhaustPages: false, query: { enabled: false } },
        )
        expect(vi.mocked(useInfiniteVoiceCallSearch)).toHaveBeenCalledWith({
            query: '',
            enabled: false,
            limit: 1,
        })
    })

    it('maps wrapped search results and totals in search mode', () => {
        const ticketResponse = {
            ...mockSearchTicketsResponse(),
            data: [
                {
                    entity: {
                        id: 202,
                        subject: 'Refund request',
                        status: 'open',
                        customer: { name: 'Ada Lovelace' },
                    },
                } as never,
                { entity: { subject: 'invalid row' } } as never,
            ],
            meta: {
                total_resources: 9,
            },
        } as any

        const customerResponse = {
            ...mockCustomerSearchResponse(),
            data: [
                {
                    id: 101,
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                } as never,
            ],
            meta: {
                count: 2,
            },
        } as any

        const callResponse = {
            ...mockSearchVoiceCallsResponse(),
            data: [
                {
                    entity: mockVoiceCall({
                        id: 303,
                        ticket_id: 202,
                        status: 'answered',
                        direction: 'inbound',
                        phone_number_source: '+3311111111',
                    }),
                } as never,
            ],
            meta: {
                totalResources: 5,
            },
        } as any

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useSearchAllTickets).mockReturnValue(
            createInfiniteQueryResult({
                data: { pages: [{ data: ticketResponse }] },
                items: ticketResponse.data,
                isLoading: true,
            }),
        )
        vi.mocked(useSearchAllCustomers).mockReturnValue(
            createInfiniteQueryResult({
                data: { pages: [{ data: customerResponse }] },
                items: customerResponse.data,
            }),
        )
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                data: { pages: [callResponse] },
                items: callResponse.data,
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        expect(result.current.isSearchMode).toBe(true)
        expect(result.current.isLoading).toBe(true)
        expect(result.current.tickets).toHaveLength(1)
        expect(result.current.customers).toHaveLength(1)
        expect(result.current.calls).toHaveLength(1)
        expect(result.current.totals).toEqual({
            tickets: 9,
            customers: 2,
            calls: 5,
        })
        expect(vi.mocked(useSearchAllCustomers)).toHaveBeenCalledWith(
            { search: 'refund' },
            { limit: 50, with_highlights: true },
            { exhaustPages: false, query: { enabled: true } },
        )
    })

    it('exposes pagination from the infinite queries', () => {
        const fetchNextTicketPage = vi.fn()

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useSearchAllTickets).mockReturnValue(
            createInfiniteQueryResult({
                data: {
                    pages: [
                        {
                            data: {
                                ...(mockSearchTicketsResponse() as object),
                                data: [
                                    {
                                        entity: {
                                            id: 202,
                                            subject: 'First ticket',
                                            status: 'open',
                                            customer: {
                                                name: 'Ada Lovelace',
                                            },
                                        },
                                    } as never,
                                ],
                                meta: {
                                    total_resources: 2,
                                },
                            },
                        },
                    ],
                },
                items: [
                    {
                        entity: {
                            id: 202,
                            subject: 'First ticket',
                            status: 'open',
                            customer: { name: 'Ada Lovelace' },
                        },
                    } as never,
                ],
                hasNextPage: true,
                fetchNextPage: fetchNextTicketPage,
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        expect(result.current.pagination.tickets.hasNextPage).toBe(true)

        result.current.pagination.tickets.fetchNextPage()

        expect(fetchNextTicketPage).toHaveBeenCalledTimes(1)
    })

    it('dedupes overlapping ticket ids across loaded pages', () => {
        const ticketResponse = {
            ...(mockSearchTicketsResponse() as object),
            data: [
                {
                    entity: {
                        id: 202,
                        subject: 'First ticket',
                        status: 'open',
                        customer: { name: 'Ada Lovelace' },
                    },
                } as never,
            ],
            meta: {
                total_resources: 2,
            },
        } as any

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useSearchAllTickets).mockReturnValue(
            createInfiniteQueryResult({
                data: { pages: [{ data: ticketResponse }] },
                items: [
                    {
                        entity: {
                            id: 202,
                            subject: 'First ticket',
                            status: 'open',
                            customer: { name: 'Ada Lovelace' },
                        },
                    } as never,
                    {
                        entity: {
                            id: 202,
                            subject: 'First ticket',
                            status: 'open',
                            customer: { name: 'Ada Lovelace' },
                        },
                    } as never,
                    {
                        entity: {
                            id: 203,
                            subject: 'Second ticket',
                            status: 'open',
                            customer: { name: 'Grace Hopper' },
                        },
                    } as never,
                ],
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        expect(result.current.tickets.map((ticket) => ticket.id)).toEqual([
            202, 203,
        ])
    })

    it('stays out of search mode when the spotlight is closed', () => {
        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: false,
                showCalls: true,
            }),
        )

        expect(result.current.isSearchMode).toBe(false)
        expect(vi.mocked(useSearchAllTickets)).toHaveBeenCalledWith(
            { search: 'refund', filters: '' },
            { limit: 1, with_highlights: true, track_total_hits: true },
            { exhaustPages: false, query: { enabled: false } },
        )
    })

    it('falls back to direct items and derived totals when metadata is missing', () => {
        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useSearchAllCustomers).mockReturnValue(
            createInfiniteQueryResult({
                items: [
                    {
                        id: 101,
                        name: 'Ada Lovelace',
                        email: 'ada@example.com',
                    } as never,
                    {
                        id: 101,
                        name: 'Ada Lovelace',
                        email: 'ada@example.com',
                    } as never,
                    'invalid-row' as never,
                ],
            }),
        )
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                items: [
                    mockVoiceCall({
                        id: 303,
                        ticket_id: 202,
                        status: 'answered',
                        direction: 'inbound',
                        phone_number_source: '+3311111111',
                    }) as never,
                ],
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        expect(result.current.customers).toHaveLength(1)
        expect(result.current.calls).toHaveLength(1)
        expect(result.current.totals.customers).toBe(1)
        expect(result.current.totals.calls).toBe(1)
    })

    it('does not count call loading when voice results are hidden', () => {
        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                isLoading: true,
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: false,
            }),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('guards fetchNextPage when pagination cannot advance', () => {
        const fetchNextCustomerPage = vi.fn()
        const fetchNextCallPage = vi.fn()

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useSearchAllCustomers).mockReturnValue(
            createInfiniteQueryResult({
                hasNextPage: false,
                isFetchingNextPage: false,
                fetchNextPage: fetchNextCustomerPage,
            }),
        )
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                hasNextPage: true,
                isFetchingNextPage: true,
                fetchNextPage: fetchNextCallPage,
            }),
        )

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        result.current.pagination.customers.fetchNextPage()
        result.current.pagination.calls.fetchNextPage()

        expect(fetchNextCustomerPage).not.toHaveBeenCalled()
        expect(fetchNextCallPage).not.toHaveBeenCalled()
    })
})
