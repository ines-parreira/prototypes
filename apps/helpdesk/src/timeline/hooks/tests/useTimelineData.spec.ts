import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockListTicketsHandler,
    mockListTicketsResponse,
    mockTicketCompact,
} from '@gorgias/helpdesk-mocks'

import { useAppSelector } from 'hooks/useAppSelector'
import type { Customer } from 'models/customer/types'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicketCustomer } from 'state/ticket/selectors'
import * as timelineItem from 'timeline/helpers/timelineItem'
import { useTimelineData } from 'timeline/hooks/useTimelineData'

import { TICKET_FETCHED_LIMIT } from '../../constants'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const useAppSelectorMock = assumeMock(useAppSelector)

const server = setupServer()

function mockSelectedCustomers(
    ticketCustomer: Customer | Record<string, never> | null,
    activeCustomer: Customer | Record<string, never> | null,
) {
    useAppSelectorMock.mockImplementation((selector) => {
        if (selector === getTicketCustomer) {
            return {
                toJS: () => ticketCustomer,
            }
        }

        if (selector === getActiveCustomer) {
            return activeCustomer
        }

        return undefined
    })
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTimelineData', () => {
    const ticketList = [
        mockTicketCompact({
            id: 1,
        }),
        mockTicketCompact({
            id: 2,
        }),
    ]

    const mockTicketCustomer = {
        id: 1,
        name: 'Ticket Customer',
        note: 'Test ticket customer',
        channels: [],
        active: true,
        created_datetime: '2023-01-01T00:00:00Z',
        customer: null,
        data: null,
        email: 'ticket@example.com',
        external_id: null,
        firstname: 'Ticket',
        lastname: 'Customer',
        language: 'en',
        meta: {},
        timezone: 'UTC',
        updated_datetime: '2023-01-01T00:00:00Z',
        integrations: {
            shopify: {
                orders: [{ id: 1 }, { id: 2 }],
                __integration_type__: 'shopify',
                args: {},
                headers: {},
                origin: 'shopify',
                url: 'https://example.shopify.com',
            },
        },
    } as unknown as Customer

    const mockActiveCustomer = {
        id: 2,
        name: 'Active Customer',
        note: 'Test active customer',
        channels: [],
        active: true,
        created_datetime: '2023-01-01T00:00:00Z',
        customer: null,
        data: null,
        email: 'active@example.com',
        external_id: null,
        firstname: 'Active',
        lastname: 'Customer',
        language: 'en',
        meta: {},
        timezone: 'UTC',
        updated_datetime: '2023-01-01T00:00:00Z',
        integrations: {
            shopify: {
                orders: [{ id: 3 }, { id: 4 }],
                __integration_type__: 'shopify',
                args: {},
                headers: {},
                origin: 'shopify',
                url: 'https://example.shopify.com',
            },
        },
    } as unknown as Customer

    beforeEach(() => {
        jest.clearAllMocks()
        server.use(
            mockListTicketsHandler(async () =>
                HttpResponse.json(
                    mockListTicketsResponse({
                        data: ticketList,
                    }),
                ),
            ).handler,
        )
    })

    it('should call useListTicket with correct params', async () => {
        let requestCount = 0
        const listTicketsMock = mockListTicketsHandler(async () => {
            requestCount += 1
            return HttpResponse.json(
                mockListTicketsResponse({
                    data: ticketList,
                }),
            )
        })
        server.use(listTicketsMock.handler)
        const waitForListTicketsRequest = listTicketsMock.waitForRequest(server)

        mockSelectedCustomers({}, {})

        const { rerender } = renderHook((id?: number) => useTimelineData(id))

        expect(requestCount).toBe(0)

        rerender(123)

        await waitForListTicketsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('trashed')).toBe('false')
            expect(url.searchParams.get('limit')).toBe(
                String(TICKET_FETCHED_LIMIT),
            )
            expect(url.searchParams.get('customer_id')).toBe('123')
        })
    })

    it('should return mixed ticket and order list', async () => {
        mockSelectedCustomers(
            {
                integrations: {
                    shopify: {
                        orders: [{ id: 1 }, { id: 2 }],
                        __integration_type__: 'shopify',
                    },
                },
            } as unknown as Customer,
            mockActiveCustomer,
        )

        const { result } = renderHook(() => useTimelineData(123))
        await waitFor(() => {
            expect(
                result.current.items
                    .filter(timelineItem.isTicket)
                    .map(timelineItem.toTicket),
            ).toEqual(ticketList)
        })
        const items = result.current.items
        expect(
            items.filter(timelineItem.isTicket).map(timelineItem.toTicket),
        ).toEqual(ticketList)
        expect(
            items.filter(timelineItem.isOrder).map(timelineItem.toOrder),
        ).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return customer ticket list', async () => {
        mockSelectedCustomers({}, {})

        const { result } = renderHook(() => useTimelineData(123))

        await waitFor(() => {
            expect(result.current.items.map(timelineItem.toTicket)).toEqual(
                ticketList,
            )
        })
    })

    it('should return empty array if customer id is not provided', () => {
        mockSelectedCustomers({}, {})

        const { result } = renderHook(() => useTimelineData())

        expect(result.current.items.map(timelineItem.toTicket)).toEqual([])
    })

    it('should return loading state', () => {
        server.use(
            mockListTicketsHandler(async () => new Promise(() => undefined))
                .handler,
        )
        mockSelectedCustomers({}, {})

        const { result } = renderHook(() => useTimelineData(123))

        expect(result.current.isLoading).toBe(true)
    })

    it('should return error state', async () => {
        server.use(
            mockListTicketsHandler(async () =>
                HttpResponse.json({ error: { msg: 'Failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )
        mockSelectedCustomers({}, {})

        const { result } = renderHook(() => useTimelineData(123))
        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    describe('Customer selection logic', () => {
        it('should use ticket customer when available', async () => {
            mockSelectedCustomers(mockTicketCustomer, mockActiveCustomer)

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(
                    result.current.items
                        .filter(timelineItem.isTicket)
                        .map(timelineItem.toTicket),
                ).toEqual(ticketList)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 1 },
                { id: 2 },
            ])
        })

        it('should fallback to active customer when ticket customer is empty', async () => {
            mockSelectedCustomers({}, mockActiveCustomer)

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(result.current.items.length).toBeGreaterThan(0)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 3 },
                { id: 4 },
            ])
        })

        it('should fallback to active customer when ticket customer is null', async () => {
            mockSelectedCustomers(null, mockActiveCustomer)

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(result.current.items.length).toBeGreaterThan(0)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 3 },
                { id: 4 },
            ])
        })

        it('should not extract orders when activeCustomer is not available', async () => {
            mockSelectedCustomers(mockTicketCustomer, null)

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(result.current.items.length).toBeGreaterThan(0)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(0)
        })

        it('should extract orders from correct customer when both customers are available', async () => {
            mockSelectedCustomers(mockTicketCustomer, mockActiveCustomer)

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(result.current.items.length).toBeGreaterThan(0)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 1 },
                { id: 2 },
            ])
        })

        it('should handle empty activeCustomer gracefully', async () => {
            mockSelectedCustomers({}, {})

            const { result } = renderHook(() => useTimelineData(123))

            await waitFor(() => {
                expect(result.current.items.length).toBeGreaterThan(0)
            })
            const orderItems = result.current.items.filter(timelineItem.isOrder)

            expect(orderItems).toHaveLength(0)
        })
    })
})
