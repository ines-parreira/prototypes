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
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should fetch influenced orders with ticket context data', () => {
        const mockTicketContext = {
            accountId: 123,
            customerIds: [456, 789],
            ticketId: 999,
            orders: [],
            shopifyIntegrations: [],
        }

        const mockInfluencedOrders = {
            data: [{ id: 1, integrationId: 2, orderId: 'order1' }],
        } as unknown as QueryObserverSuccessResult<InfluencedOrderData[]>

        mockUseGetTicketContext.mockReturnValue(mockTicketContext)
        mockUseFetchInfluencedOrders.mockReturnValue(mockInfluencedOrders)

        const { result } = renderHook(() =>
            useFetchInfluencedOrdersForCurrentTicket(),
        )

        expect(mockUseFetchInfluencedOrders).toHaveBeenCalledWith({
            accountId: mockTicketContext.accountId,
            customerIds: mockTicketContext.customerIds,
        })

        expect(result.current).toEqual({
            influencedOrders: mockInfluencedOrders,
            ticketContext: mockTicketContext,
        })
    })
})
