import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useDebouncedValue } from '@gorgias/toolkit-react'

import {
    mockCustomerSearchResponse,
    mockSearchCustomersHandler,
    mockSearchCustomersResponse,
    mockSearchTicketsHandler,
    mockSearchTicketsResponse,
    mockSearchVoiceCallsResponse,
    mockVoiceCall,
} from '@gorgias/helpdesk-mocks'

import { useInfiniteVoiceCallSearch } from '../useInfiniteVoiceCallSearch'
import { useSearchSpotlightData } from '../useSearchSpotlightData'

vi.mock('@gorgias/toolkit-react', () => ({
    useDebouncedValue: vi.fn(),
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

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useSearchSpotlightData', () => {
    beforeEach(() => {
        vi.mocked(useDebouncedValue).mockImplementation((value) => value)
        server.use(
            mockSearchTicketsHandler(async () =>
                HttpResponse.json(
                    mockSearchTicketsResponse({
                        data: [],
                        meta: {
                            total_resources: 0,
                        } as any,
                    }),
                ),
            ).handler,
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                        meta: {
                            count: 0,
                        } as any,
                    }),
                ),
            ).handler,
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
        expect(vi.mocked(useDebouncedValue)).toHaveBeenCalledWith('', 1000)
        expect(vi.mocked(useInfiniteVoiceCallSearch)).toHaveBeenCalledWith({
            query: '',
            enabled: false,
            limit: 1,
        })
    })

    it('maps wrapped search results and totals in search mode', async () => {
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

        server.use(
            mockSearchTicketsHandler(async () =>
                HttpResponse.json(ticketResponse),
            ).handler,
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(customerResponse),
            ).handler,
        )
        vi.mocked(useDebouncedValue).mockReturnValue('refund')
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
        await waitFor(() => {
            expect(result.current.tickets).toHaveLength(1)
            expect(result.current.customers).toHaveLength(1)
        })
        expect(result.current.calls).toHaveLength(1)
        expect(result.current.totals).toEqual({
            tickets: 9,
            customers: 2,
            calls: 5,
        })
    })

    it('exposes pagination from the infinite queries', () => {
        const fetchNextCallPage = vi.fn()

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                hasNextPage: true,
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

        expect(result.current.pagination.calls.hasNextPage).toBe(true)

        result.current.pagination.calls.fetchNextPage()

        expect(fetchNextCallPage).toHaveBeenCalledTimes(1)
    })

    it('dedupes overlapping ticket ids across loaded pages', async () => {
        server.use(
            mockSearchTicketsHandler(async ({ request }) => {
                const cursor = new URL(request.url).searchParams.get('cursor')

                return HttpResponse.json({
                    ...(mockSearchTicketsResponse() as object),
                    data: cursor
                        ? [
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
                          ]
                        : [
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
                        next_cursor: cursor ? null : 'cursor-2',
                        total_resources: 2,
                    },
                } as any)
            }).handler,
        )
        vi.mocked(useDebouncedValue).mockReturnValue('refund')

        const { result } = renderHook(() =>
            useSearchSpotlightData({
                query: 'refund',
                isOpen: true,
                showCalls: true,
            }),
        )

        await waitFor(() => {
            expect(result.current.tickets.map((ticket) => ticket.id)).toEqual([
                202,
            ])
        })

        act(() => {
            result.current.pagination.tickets.fetchNextPage()
        })

        await waitFor(() => {
            expect(result.current.tickets.map((ticket) => ticket.id)).toEqual([
                202, 203,
            ])
        })
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
        expect(vi.mocked(useInfiniteVoiceCallSearch)).toHaveBeenCalledWith({
            query: 'refund',
            enabled: false,
            limit: 1,
        })
    })

    it('falls back to direct items and derived totals when metadata is missing', async () => {
        vi.mocked(useDebouncedValue).mockReturnValue('refund')
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json({
                    ...mockCustomerSearchResponse(),
                    data: [
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
                    meta: {} as any,
                }),
            ).handler,
        )
        vi.mocked(useInfiniteVoiceCallSearch).mockReturnValue(
            createInfiniteQueryResult({
                items: [
                    {
                        id: 303,
                        ticket_id: 202,
                        status: 'answered',
                        direction: 'inbound',
                        phone_number_source: '+3311111111',
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

        await waitFor(() => {
            expect(result.current.customers).toHaveLength(1)
        })
        expect(result.current.calls).toHaveLength(1)
        expect(result.current.totals.customers).toBe(1)
        expect(result.current.totals.calls).toBe(1)
    })

    it('does not count call loading when voice results are hidden', async () => {
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

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('guards fetchNextPage when pagination cannot advance', () => {
        const fetchNextCallPage = vi.fn()

        vi.mocked(useDebouncedValue).mockReturnValue('refund')
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

        result.current.pagination.calls.fetchNextPage()

        expect(fetchNextCallPage).not.toHaveBeenCalled()
    })
})
