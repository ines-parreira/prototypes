import { renderHook } from '@repo/testing'
import type { QueryObserverSuccessResult } from '@tanstack/react-query'

import { useGetTicketContext } from 'hooks/aiAgent/useGetTicketContext'

import type { InfluencedOrderData } from './useFetchInfluencedOrders'
import { useFetchInfluencedOrders } from './useFetchInfluencedOrders'
import { useFetchInfluencedOrdersForCurrentTicket } from './useFetchInfluencedOrdersForCurrentTicket'

jest.mock('hooks/aiAgent/useGetTicketContext')
jest.mock('./useFetchInfluencedOrders')

const mockUseGetTicketContext = jest.mocked(useGetTicketContext)
const mockUseFetchInfluencedOrders = jest.mocked(useFetchInfluencedOrders)

describe('useFetchInfluencedOrdersForCurrentTicket', () => {
    const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
        accountId: 123,
        customers: [
            { id: 456, created_at: '2021-01-01T00:00:00.000Z' },
            { id: 789, created_at: '2021-01-02T00:00:00.000Z' },
            { id: 789 },
        ],
        ticketId: 999,
        createdAt: '2021-01-01T00:00:00.000Z',
        orders: [
            {
                id: 111,
                order_number: 1110,
                created_at: '2020-01-02T10:00:00.000Z',
                updated_at: '2020-01-02T01:00:00.000Z',
            },
            {
                id: 222,
                order_number: 2220,
                created_at: '2021-01-03T05:00:00.000Z',
                updated_at: '2021-01-04T01:00:00.000Z',
            },
        ],
        shopifyIntegrations: [],
    }

    const mockInfluencedOrders = {
        data: [{ id: 1, integrationId: 2, orderId: 'order1' }],
    } as unknown as QueryObserverSuccessResult<InfluencedOrderData[]>

    beforeEach(() => {
        mockUseGetTicketContext.mockReturnValue(mockTicketContext)
        mockUseFetchInfluencedOrders.mockReturnValue(mockInfluencedOrders)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should fetch influenced orders with ticket context data', () => {
        const { result } = renderHook(() =>
            useFetchInfluencedOrdersForCurrentTicket(),
        )

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: '2021-01-01T00:00:00.000Z',
            periodEnd: '2021-01-03T23:59:59.999Z',
            orderIds: [111, 222],
        })

        expect(result.current).toEqual({
            influencedOrders: mockInfluencedOrders,
            ticketContext: mockTicketContext,
        })
    })

    it('ticket was created after the first order were created but before the last one', () => {
        const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
            accountId: 123,
            customers: [
                { id: 456, created_at: '2019-01-01T00:00:00.000Z' },
                { id: 789, created_at: '2019-01-02T00:00:00.000Z' },
                { id: 789 },
            ],
            ticketId: 999,
            createdAt: '2021-01-03T00:00:00.000Z',
            orders: [
                {
                    id: 111,
                    order_number: 1110,
                    created_at: '2020-01-02T10:00:00.000Z',
                    updated_at: '2020-01-02T11:00:00.000Z',
                },
                {
                    id: 222,
                    order_number: 2220,
                    created_at: '2021-01-04T01:00:00.000Z',
                    updated_at: '2021-01-04T05:00:00.000Z',
                },
            ],
            shopifyIntegrations: [],
        }

        mockUseGetTicketContext.mockReturnValue(mockTicketContext)

        renderHook(() => useFetchInfluencedOrdersForCurrentTicket())

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: '2021-01-03T00:00:00.000Z',
            periodEnd: '2021-01-04T23:59:59.999Z',
            orderIds: [111, 222],
        })
    })

    it('ticket is missing created_at, so it should return undefined for periodStart and periodEnd', () => {
        const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
            accountId: 123,
            customers: [{ id: 789 }],
            ticketId: 999,
            createdAt: undefined,
            orders: [
                {
                    id: 111,
                    order_number: 1110,
                    updated_at: '2021-01-01T01:00:00.000Z',
                },
                {
                    id: 222,
                    order_number: 2220,
                    created_at: '2021-01-01T00:00:00.000Z',
                },
            ],
            shopifyIntegrations: [],
        }
        mockUseGetTicketContext.mockReturnValue(mockTicketContext)

        renderHook(() => useFetchInfluencedOrdersForCurrentTicket())

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: undefined,
            periodEnd: undefined,
            orderIds: [111, 222],
        })
    })

    it('customer does not have any orders', () => {
        const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
            accountId: 123,
            customers: [{ id: 789 }],
            ticketId: 999,
            createdAt: '2021-01-01T01:00:00.000Z',
            orders: [],
            shopifyIntegrations: [],
        }
        mockUseGetTicketContext.mockReturnValue(mockTicketContext)

        renderHook(() => useFetchInfluencedOrdersForCurrentTicket())

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: undefined,
            periodEnd: undefined,
            orderIds: [],
        })
    })

    it('ticket was created after order', () => {
        const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
            accountId: 123,
            customers: [
                { id: 456, created_at: '2019-01-01T00:00:00.000Z' },
                { id: 789, created_at: '2019-01-02T00:00:00.000Z' },
                { id: 789 },
            ],
            ticketId: 999,
            createdAt: '2021-01-03T00:00:00.000Z',
            orders: [
                {
                    id: 111,
                    order_number: 1110,
                    created_at: '2020-06-02T10:00:00.000Z',
                    updated_at: '2020-06-02T11:00:00.000Z',
                },
            ],
            shopifyIntegrations: [],
        }

        mockUseGetTicketContext.mockReturnValue(mockTicketContext)

        renderHook(() => useFetchInfluencedOrdersForCurrentTicket())

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: undefined,
            periodEnd: undefined,
            orderIds: [111],
        })
    })

    it('should not raise an error if order does not have created_at or updated_at', () => {
        const mockTicketContext: ReturnType<typeof useGetTicketContext> = {
            accountId: 123,
            customers: [{ id: 789 }],
            ticketId: 999,
            createdAt: '2021-01-01T00:00:00.000Z',
            orders: [
                {
                    id: 111,
                    order_number: 1110,
                    updated_at: '2021-01-01T01:00:00.000Z',
                },
                {
                    id: 222,
                    order_number: 2220,
                    created_at: '2021-01-01T00:00:00.000Z',
                },
            ],
            shopifyIntegrations: [],
        }
        mockUseGetTicketContext.mockReturnValue(mockTicketContext)

        renderHook(() => useFetchInfluencedOrdersForCurrentTicket())

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            integrationIds: [],
            periodStart: '2021-01-01T00:00:00.000Z',
            periodEnd: '2021-01-01T23:59:59.999Z',
            orderIds: [111, 222],
        })
    })

    it('should not fail if no customers have a created_at', () => {
        mockTicketContext.customers = [{ id: 1 }]

        const { result } = renderHook(() =>
            useFetchInfluencedOrdersForCurrentTicket(),
        )

        expect(result.current).toEqual({
            influencedOrders: mockInfluencedOrders,
            ticketContext: mockTicketContext,
        })
    })
})
