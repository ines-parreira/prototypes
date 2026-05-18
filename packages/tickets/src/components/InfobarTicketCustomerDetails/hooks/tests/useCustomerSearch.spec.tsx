import { logEvent, SegmentEvent, useSearchRankScenario } from '@repo/logging'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCustomer,
    mockSearchCustomersHandler,
    mockSearchCustomersResponse,
} from '@gorgias/helpdesk-mocks'
import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../../tests/render.utils'
import { server } from '../../../../tests/server'
import { useCustomerSearch } from '../useCustomerSearch'

const mockRegisterResultsRequest = vi.fn()
const mockRegisterResultsResponse = vi.fn()
const mockRegisterResultSelection = vi.fn()
const mockEndScenario = vi.fn()

vi.mock('@repo/logging', async () => ({
    ...(await vi.importActual('@repo/logging')),
    logEvent: vi.fn(),
    useSearchRankScenario: vi.fn(),
}))

const mockLogEvent = vi.mocked(logEvent)
const mockUseSearchRankScenario = vi.mocked(useSearchRankScenario)

const mockSearchResults = [
    {
        entity: mockCustomer({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [],
        }),
        highlights: {
            name: ['<em>John</em> Doe'],
        },
    },
    {
        entity: mockCustomer({
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            channels: [],
        }),
        highlights: {
            name: ['<em>Jane</em> Smith'],
        },
    },
] as CustomerHighlightDataItem[]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.clearAllMocks()
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
        currentUser: {
            id: 123,
        },
    } as any
    mockUseSearchRankScenario.mockReturnValue({
        isRunning: false,
        registerResultsRequest: mockRegisterResultsRequest,
        registerResultsResponse: mockRegisterResultsResponse,
        registerResultSelection: mockRegisterResultSelection,
        endScenario: mockEndScenario,
    })
    server.use(
        mockSearchCustomersHandler(async () =>
            HttpResponse.json(
                mockSearchCustomersResponse({
                    data: mockSearchResults,
                }),
                {
                    headers: {
                        'x-gorgias-search-engine': 'ES',
                    },
                },
            ),
        ).handler,
    )
})

afterEach(async () => {
    server.resetHandlers()
    await vi.runOnlyPendingTimersAsync()
    vi.useRealTimers()
})

afterAll(() => {
    server.close()
})

describe('useCustomerSearch', () => {
    it('tracks a single request when the debounced query starts and records the response when results become available', async () => {
        const { result } = renderHook(() => useCustomerSearch())

        act(() => {
            result.current.setSearchTerm('Jo')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(200)
        })

        act(() => {
            result.current.setSearchTerm('John')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(299)
        })

        expect(mockRegisterResultsRequest).not.toHaveBeenCalled()

        await act(async () => {
            await vi.advanceTimersByTimeAsync(1)
        })

        await waitFor(() => {
            expect(mockRegisterResultsRequest).toHaveBeenCalledTimes(1)
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.InfobarSearchUsed,
            {
                account_domain: 'acme',
                user_id: 123,
                timestamp: expect.any(Number),
            },
        )
        expect(mockRegisterResultsRequest).toHaveBeenCalledWith({
            query: 'John',
            requestTime: expect.any(Number),
        })

        await waitFor(() => {
            expect(mockRegisterResultsResponse).toHaveBeenCalledWith({
                responseTime: expect.any(Number),
                numberOfResults: 2,
                searchEngine: 'ES',
            })
        })
    })

    it('tracks a zero-result response when the fetch fails', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                    }),
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useCustomerSearch())

        act(() => {
            result.current.setSearchTerm('John')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(mockRegisterResultsRequest).toHaveBeenCalledWith({
                query: 'John',
                requestTime: expect.any(Number),
            })
        })

        await waitFor(() => {
            expect(mockRegisterResultsResponse).toHaveBeenCalledWith({
                responseTime: expect.any(Number),
                numberOfResults: 0,
                searchEngine: undefined,
            })
        })
    })

    it('starts a new scenario when a previous debounced query resolves from warm cache after another search', async () => {
        const { result } = renderHook(() => useCustomerSearch())

        act(() => {
            result.current.setSearchTerm('John')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(mockRegisterResultsRequest).toHaveBeenCalledTimes(1)
            expect(mockRegisterResultsResponse).toHaveBeenCalledTimes(1)
        })

        act(() => {
            result.current.setSearchTerm('Jane')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(mockRegisterResultsRequest).toHaveBeenCalledTimes(2)
            expect(mockRegisterResultsResponse).toHaveBeenCalledTimes(2)
        })

        mockRegisterResultsRequest.mockClear()
        mockRegisterResultsResponse.mockClear()

        act(() => {
            result.current.setSearchTerm('John')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(result.current.searchResults).toHaveLength(2)
        })

        expect(mockRegisterResultsRequest).toHaveBeenCalledWith({
            query: 'John',
            requestTime: expect.any(Number),
        })
        expect(mockRegisterResultsResponse).toHaveBeenCalledWith({
            responseTime: expect.any(Number),
            numberOfResults: 2,
            searchEngine: 'ES',
        })
    })

    it('ends the scenario immediately and ignores late responses after the search is cleared', async () => {
        let resolveResponse: ((value: any) => void) | undefined

        server.use(
            mockSearchCustomersHandler(
                async () =>
                    await new Promise((resolve) => {
                        resolveResponse = resolve
                    }),
            ).handler,
        )

        const { result } = renderHook(() => useCustomerSearch())

        act(() => {
            result.current.setSearchTerm('John')
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(mockRegisterResultsRequest).toHaveBeenCalledTimes(1)
        })

        act(() => {
            result.current.clearSearch()
        })

        expect(mockEndScenario).toHaveBeenCalled()

        act(() => {
            resolveResponse?.(
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: mockSearchResults,
                    }),
                    {
                        headers: {
                            'x-gorgias-search-engine': 'ES',
                        },
                    },
                ),
            )
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(300)
        })

        await waitFor(() => {
            expect(result.current.searchTerm).toBe('')
        })

        expect(mockRegisterResultsResponse).not.toHaveBeenCalled()
    })

    it('registers customer result selection with the expected payload', () => {
        const { result } = renderHook(() => useCustomerSearch())

        act(() => {
            result.current.registerResultSelection(123, 2)
        })

        expect(mockRegisterResultSelection).toHaveBeenCalledWith({
            id: 123,
            index: 2,
            type: 'customer',
        })
    })
})
