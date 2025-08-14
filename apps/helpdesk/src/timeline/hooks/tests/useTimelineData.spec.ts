import { assumeMock, renderHook } from '@repo/testing'

import { useListTickets } from '@gorgias/helpdesk-queries'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { Customer } from 'models/customer/types'
import * as timelineItem from 'timeline/helpers/timelineItem'
import { useTimelineData } from 'timeline/hooks/useTimelineData'

import { TICKET_FETCH_STALE_TIME, TICKET_FETCHED_LIMIT } from '../../constants'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListTickets: jest.fn(),
}))

jest.mock('hooks/useAppSelector')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useListTicketsMock = assumeMock(useListTickets)
const useAppSelectorMock = assumeMock(useAppSelector)
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('useTimelineData', () => {
    const ticketList = [
        {
            id: 1,
        },
        {
            id: 2,
        },
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

        useListTicketsMock.mockReturnValue({
            data: {
                data: { data: ticketList },
            },
            isLoading: true as boolean,
            isError: false,
        } as ReturnType<typeof useListTickets>)

        mockUseFlag.mockReturnValue(false)
    })

    it('should call useListTicket with correct params', () => {
        // Mock useAppSelector for this test - first call returns ticket customer, second returns active customer
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}), // Empty ticket customer
            })
            .mockReturnValueOnce({}) // Empty active customer

        const { rerender } = renderHook((id?: number) => useTimelineData(id))

        expect(useListTicketsMock).toHaveBeenCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: undefined,
            },
            {
                query: {
                    enabled: false,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )

        // Mock again for the rerender
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}),
            })
            .mockReturnValueOnce({})

        rerender(123)

        expect(useListTicketsMock).toHaveBeenLastCalledWith(
            {
                trashed: false,
                limit: TICKET_FETCHED_LIMIT,
                customer_id: 123,
            },
            {
                query: {
                    enabled: true,
                    staleTime: TICKET_FETCH_STALE_TIME,
                },
            },
        )
    })

    it('should return mixed ticket and order list', () => {
        mockUseFlag.mockReturnValue(true)
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({
                    integrations: {
                        shopify: {
                            orders: [{ id: 1 }, { id: 2 }],
                            __integration_type__: 'shopify',
                        },
                    },
                }),
            })
            .mockReturnValueOnce(mockActiveCustomer) // activeCustomer for condition check

        const { result } = renderHook(() => useTimelineData(123))
        const items = result.current.items
        expect(
            items.filter(timelineItem.isTicket).map(timelineItem.toTicket),
        ).toEqual(ticketList)
        expect(
            items.filter(timelineItem.isOrder).map(timelineItem.toOrder),
        ).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('should return customer ticket list', () => {
        // Mock useAppSelector for this test
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}),
            })
            .mockReturnValueOnce({})

        const { result } = renderHook(() => useTimelineData(123))

        expect(result.current.items.map(timelineItem.toTicket)).toEqual(
            ticketList,
        )
    })

    it('should return empty array if customer id is not provided', () => {
        // Mock useAppSelector for this test
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}),
            })
            .mockReturnValueOnce({})

        const { result } = renderHook(() => useTimelineData())

        expect(result.current.items.map(timelineItem.toTicket)).toEqual([])
    })

    it('should return loading state', () => {
        // Mock useAppSelector for this test
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}),
            })
            .mockReturnValueOnce({})

        const { result } = renderHook(() => useTimelineData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return error state', () => {
        // Mock useAppSelector for this test
        useAppSelectorMock
            .mockReturnValueOnce({
                toJS: () => ({}),
            })
            .mockReturnValueOnce({})

        const { result } = renderHook(() => useTimelineData())
        expect(result.current.isError).toBe(false)
    })

    describe('Customer selection logic', () => {
        it('should use ticket customer when available', () => {
            // Mock useAppSelector to return different values for each call
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => mockTicketCustomer,
                })
                .mockReturnValueOnce(mockActiveCustomer)

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should extract orders from ticket customer (customer variable)
            // but only when activeCustomer is available (condition check)
            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 1 },
                { id: 2 },
            ])
        })

        it('should fallback to active customer when ticket customer is empty', () => {
            // Mock useAppSelector to return empty ticket customer and active customer
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => ({}), // Empty ticket customer
                })
                .mockReturnValueOnce(mockActiveCustomer)

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should extract orders from active customer (fallback customer)
            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 3 },
                { id: 4 },
            ])
        })

        it('should fallback to active customer when ticket customer is null', () => {
            // Mock useAppSelector to return null ticket customer and active customer
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => null, // Null ticket customer
                })
                .mockReturnValueOnce(mockActiveCustomer)

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should extract orders from active customer (fallback customer)
            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 3 },
                { id: 4 },
            ])
        })

        it('should not extract orders when activeCustomer is not available', () => {
            // Mock useAppSelector to return ticket customer but no active customer
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => mockTicketCustomer,
                })
                .mockReturnValueOnce(null) // No active customer

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should not extract orders because activeCustomer check fails
            expect(orderItems).toHaveLength(0)
        })

        it('should not extract orders when orders feature flag is disabled', () => {
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => mockTicketCustomer,
                })
                .mockReturnValueOnce(mockActiveCustomer)

            mockUseFlag.mockReturnValue(false) // Feature flag disabled

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should not extract orders because feature flag is disabled
            expect(orderItems).toHaveLength(0)
        })

        it('should extract orders from correct customer when both customers are available', () => {
            // Both customers available, should use ticket customer for extraction but check activeCustomer for condition
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => mockTicketCustomer,
                })
                .mockReturnValueOnce(mockActiveCustomer)

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should extract orders from ticket customer (the selected customer)
            // but condition is checked against activeCustomer
            expect(orderItems).toHaveLength(2)
            expect(orderItems.map(timelineItem.toOrder)).toEqual([
                { id: 1 },
                { id: 2 },
            ])
        })

        it('should handle empty activeCustomer gracefully', () => {
            useAppSelectorMock
                .mockReturnValueOnce({
                    toJS: () => ({}), // Empty ticket customer
                })
                .mockReturnValueOnce({}) // Empty active customer (Record<string, never>)

            mockUseFlag.mockReturnValue(true)

            const { result } = renderHook(() => useTimelineData(123))

            const items = result.current.items
            const orderItems = items.filter(timelineItem.isOrder)

            // Should not extract orders because activeCustomer is empty object
            expect(orderItems).toHaveLength(0)
        })
    })
})
