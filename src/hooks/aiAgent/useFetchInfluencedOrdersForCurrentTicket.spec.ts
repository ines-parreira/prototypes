import { QueryObserverSuccessResult } from '@tanstack/react-query'

import { useGetTicketContext } from 'hooks/aiAgent/useGetTicketContext'
import { renderHook } from 'utils/testing/renderHook'

import {
    InfluencedOrderData,
    useFetchInfluencedOrders,
} from './useFetchInfluencedOrders'
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
        orders: [
            { id: 111, order_number: 1110 },
            { id: 222, order_number: 2220 },
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
            orderIds: [111, 222],
        })

        expect(result.current).toEqual({
            influencedOrders: mockInfluencedOrders,
            ticketContext: mockTicketContext,
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
