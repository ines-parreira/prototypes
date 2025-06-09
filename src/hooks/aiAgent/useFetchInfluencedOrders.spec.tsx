import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersFilterMember,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { postReporting } from 'models/reporting/resources'
import { ReportingFilterOperator } from 'models/reporting/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import { useCanUseAiSalesAgent } from './useCanUseAiSalesAgent'
import {
    InfluencedOrdersParams,
    useFetchInfluencedOrders,
} from './useFetchInfluencedOrders'

jest.mock('models/reporting/resources')
const mockPostReporting = jest.mocked(postReporting)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent', () => ({
    useCanUseAiSalesAgent: jest.fn(),
}))
const mockUseCanUseAiSalesAgent = jest.mocked(useCanUseAiSalesAgent)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)

const queryClient = mockQueryClient()
const renderUseFetchInfluencedOrders = (params: InfluencedOrdersParams) =>
    renderHook(() => useFetchInfluencedOrders(params), {
        wrapper: ({ children }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        ),
    })

describe('useFetchInfluencedOrders', () => {
    const mockInfluencedOrdersResponse = {
        data: [
            {
                [AiSalesAgentOrdersDimension.OrderId]: '123',
                [AiSalesAgentOrdersDimension.IntegrationId]: '2',
                [AiSalesAgentOrdersDimension.PeriodStart]:
                    '2025-05-16T00:00:00',
                [AiSalesAgentOrdersDimension.TicketId]: '3',
            },
        ],
    }

    let mockFeatureFlags = {
        [FeatureFlagKey.AiShoppingAssistantEnabled]: true,
    } as Record<FeatureFlagKey, boolean>

    beforeEach(() => {
        jest.resetAllMocks()
        mockPostReporting.mockResolvedValue({
            data: mockInfluencedOrdersResponse,
        } as any)
        mockUseCanUseAiSalesAgent.mockReturnValue(true)
        mockUseFlag.mockImplementation((flag) => mockFeatureFlags[flag])
    })

    it('should properly query influenced orders', () => {
        const params = {
            accountId: 1,
            integrationIds: [2],
            orderIds: [3],
            periodStart: '2025-06-06T12:00:00.000Z',
        }

        renderUseFetchInfluencedOrders(params)

        expect(mockPostReporting).toHaveBeenCalledWith([
            expect.objectContaining({
                measures: [],
                dimensions: [
                    AiSalesAgentOrdersDimension.OrderId,
                    AiSalesAgentOrdersDimension.PeriodStart,
                    AiSalesAgentOrdersDimension.IntegrationId,
                    AiSalesAgentOrdersDimension.TicketId,
                ],
                filters: [
                    {
                        member: AiSalesAgentOrdersFilterMember.AccountId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1'],
                    },
                    {
                        member: AiSalesAgentOrdersDimension.PeriodStart,
                        operator: ReportingFilterOperator.AfterOrOnDate,
                        values: ['2025-06-06T12:00:00.000'],
                    },
                    {
                        member: AiSalesAgentOrdersDimension.IntegrationId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['2'],
                    },
                    {
                        member: AiSalesAgentOrdersDimension.OrderId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['3'],
                    },
                    {
                        member: AiSalesAgentOrdersDimension.IsInfluenced,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1'],
                    },
                ],
                limit: 100,
            }),
        ])
    })

    it('should transform the data correctly', async () => {
        const params = {
            accountId: 1,
            integrationIds: [2],
            orderIds: [3],
            periodStart: '2025-06-06T12:00:00.000Z',
        }

        const { result } = renderUseFetchInfluencedOrders(params)

        await waitFor(() =>
            expect(result.current.data).toEqual([
                {
                    id: 123,
                    integrationId: 2,
                    createdDatetime: '2025-05-16T00:00:00.000Z',
                    ticketId: 3,
                },
            ]),
        )
    })

    it('should not query if sales agent is not enabled', () => {
        mockUseCanUseAiSalesAgent.mockReturnValue(false)

        renderUseFetchInfluencedOrders({
            accountId: 1,
            integrationIds: [2],
            orderIds: [3],
        })

        expect(mockPostReporting).not.toHaveBeenCalled()
    })

    it('should not query if shopping assistant is not enabled', () => {
        mockFeatureFlags[FeatureFlagKey.AiShoppingAssistantEnabled] = false

        renderUseFetchInfluencedOrders({
            accountId: 1,
            integrationIds: [2],
            orderIds: [3],
        })

        expect(mockPostReporting).not.toHaveBeenCalled()
    })
})
