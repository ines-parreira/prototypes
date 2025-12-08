import { renderHook } from '@testing-library/react'

import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { usePostReportingV2 } from 'domains/reporting/models/queries'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyTableKpis } from './useAIJourneyTableKpis'

jest.mock('domains/reporting/models/queries')
jest.mock('hooks/useAppSelector')

describe('useAIJourneyTableKpis', () => {
    const mockUserTimezone = 'America/New_York'
    const mockIntegrationId = '123'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAppSelector as jest.Mock).mockReturnValue({
            userTimezone: mockUserTimezone,
        })
    })

    it('should calculate all metrics correctly for multiple journeys', () => {
        const mockConversationData = {
            data: {
                data: [
                    {
                        [AiSalesAgentConversationsDimension.JourneyId]:
                            'journey-1',
                        [AiSalesAgentConversationsMeasure.Count]: '100',
                        [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages]:
                            '500',
                        [AiSalesAgentConversationsMeasure.ClickThroughRate]:
                            '0.25',
                        [AiSalesAgentConversationsMeasure.ReplyRate]: '0.15',
                        [AiSalesAgentConversationsMeasure.OptOutRate]: '0.05',
                    },
                    {
                        [AiSalesAgentConversationsDimension.JourneyId]:
                            'journey-2',
                        [AiSalesAgentConversationsMeasure.Count]: '200',
                        [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages]:
                            '1000',
                        [AiSalesAgentConversationsMeasure.ClickThroughRate]:
                            '0.30',
                        [AiSalesAgentConversationsMeasure.ReplyRate]: '0.20',
                        [AiSalesAgentConversationsMeasure.OptOutRate]: '0.10',
                    },
                ],
            },
        }

        const mockOrderData = {
            data: {
                data: [
                    {
                        [AiSalesAgentOrdersDimension.JourneyId]: 'journey-1',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                        [AiSalesAgentOrdersMeasure.Count]: '20',
                        [AiSalesAgentOrdersMeasure.AverageOrderValue]: '250',
                    },
                    {
                        [AiSalesAgentOrdersDimension.JourneyId]: 'journey-2',
                        [AiSalesAgentOrdersMeasure.Gmv]: '10000',
                        [AiSalesAgentOrdersMeasure.Count]: '40',
                        [AiSalesAgentOrdersMeasure.AverageOrderValue]: '250',
                    },
                ],
            },
        }

        ;(usePostReportingV2 as jest.Mock).mockImplementation((queries) => {
            const metricName = queries[0].metricName
            if (metricName === 'ai-journey-conversation-measures-per-journey') {
                return {
                    data: mockConversationData,
                    isFetching: false,
                }
            }
            if (metricName === 'ai-journey-orders-measures-per-journey') {
                return {
                    data: mockOrderData,
                    isFetching: false,
                }
            }
            return { data: undefined, isFetching: false }
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics['journey-1']).toEqual({
            recipients: 100,
            messagesSent: 500,
            ctr: 0.25,
            replyRate: 0.15,
            optOutRate: 0.05,
            revenue: 5000,
            totalOrders: 20,
            averageOrderValue: 250,
            revenuePerRecipient: 50,
            conversionRate: 0.2,
        })
        expect(result.current.metrics['journey-2']).toEqual({
            recipients: 200,
            messagesSent: 1000,
            ctr: 0.3,
            replyRate: 0.2,
            optOutRate: 0.1,
            revenue: 10000,
            totalOrders: 40,
            averageOrderValue: 250,
            revenuePerRecipient: 50,
            conversionRate: 0.2,
        })
    })

    it('should handle loading state correctly', () => {
        ;(usePostReportingV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.metrics).toEqual({})
    })

    it('should handle missing conversation data', () => {
        const mockOrderData = {
            data: {
                data: [
                    {
                        [AiSalesAgentOrdersDimension.JourneyId]: 'journey-1',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                        [AiSalesAgentOrdersMeasure.Count]: '20',
                        [AiSalesAgentOrdersMeasure.AverageOrderValue]: '250',
                    },
                ],
            },
        }

        ;(usePostReportingV2 as jest.Mock).mockImplementation((queries) => {
            const metricName = queries[0].metricName
            if (metricName === 'ai-journey-conversation-measures-per-journey') {
                return {
                    data: { data: { data: [] } },
                    isFetching: false,
                }
            }
            if (metricName === 'ai-journey-orders-measures-per-journey') {
                return {
                    data: mockOrderData,
                    isFetching: false,
                }
            }
            return { data: undefined, isFetching: false }
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics['journey-1']).toEqual({
            recipients: 0,
            messagesSent: 0,
            ctr: 0,
            replyRate: 0,
            optOutRate: 0,
            revenue: 5000,
            totalOrders: 20,
            averageOrderValue: 250,
            revenuePerRecipient: 0,
            conversionRate: 0,
        })
    })

    it('should handle missing order data', () => {
        const mockConversationData = {
            data: {
                data: [
                    {
                        [AiSalesAgentConversationsDimension.JourneyId]:
                            'journey-1',
                        [AiSalesAgentConversationsMeasure.Count]: '100',
                        [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages]:
                            '500',
                        [AiSalesAgentConversationsMeasure.ClickThroughRate]:
                            '0.25',
                        [AiSalesAgentConversationsMeasure.ReplyRate]: '0.15',
                        [AiSalesAgentConversationsMeasure.OptOutRate]: '0.05',
                    },
                ],
            },
        }

        ;(usePostReportingV2 as jest.Mock).mockImplementation((queries) => {
            const metricName = queries[0].metricName
            if (metricName === 'ai-journey-conversation-measures-per-journey') {
                return {
                    data: mockConversationData,
                    isFetching: false,
                }
            }
            if (metricName === 'ai-journey-orders-measures-per-journey') {
                return {
                    data: { data: { data: [] } },
                    isFetching: false,
                }
            }
            return { data: undefined, isFetching: false }
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics['journey-1']).toEqual({
            recipients: 100,
            messagesSent: 500,
            ctr: 0.25,
            replyRate: 0.15,
            optOutRate: 0.05,
            revenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            revenuePerRecipient: 0,
            conversionRate: 0,
        })
    })

    it('should handle zero recipients correctly', () => {
        const mockConversationData = {
            data: {
                data: [
                    {
                        [AiSalesAgentConversationsDimension.JourneyId]:
                            'journey-1',
                        [AiSalesAgentConversationsMeasure.Count]: '0',
                        [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages]:
                            '0',
                        [AiSalesAgentConversationsMeasure.ClickThroughRate]:
                            '0',
                        [AiSalesAgentConversationsMeasure.ReplyRate]: '0',
                        [AiSalesAgentConversationsMeasure.OptOutRate]: '0',
                    },
                ],
            },
        }

        const mockOrderData = {
            data: {
                data: [
                    {
                        [AiSalesAgentOrdersDimension.JourneyId]: 'journey-1',
                        [AiSalesAgentOrdersMeasure.Gmv]: '5000',
                        [AiSalesAgentOrdersMeasure.Count]: '20',
                        [AiSalesAgentOrdersMeasure.AverageOrderValue]: '250',
                    },
                ],
            },
        }

        ;(usePostReportingV2 as jest.Mock).mockImplementation((queries) => {
            const metricName = queries[0].metricName
            if (metricName === 'ai-journey-conversation-measures-per-journey') {
                return {
                    data: mockConversationData,
                    isFetching: false,
                }
            }
            if (metricName === 'ai-journey-orders-measures-per-journey') {
                return {
                    data: mockOrderData,
                    isFetching: false,
                }
            }
            return { data: undefined, isFetching: false }
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics['journey-1']).toEqual({
            recipients: 0,
            messagesSent: 0,
            ctr: 0,
            replyRate: 0,
            optOutRate: 0,
            revenue: 5000,
            totalOrders: 20,
            averageOrderValue: 250,
            revenuePerRecipient: 0,
            conversionRate: 0,
        })
    })

    it('should handle undefined data gracefully', () => {
        ;(usePostReportingV2 as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: false,
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics).toEqual({})
    })

    it('should filter by journey IDs when provided', () => {
        const mockJourneyIds = ['journey-1']

        ;(usePostReportingV2 as jest.Mock).mockReturnValue({
            data: { data: { data: [] } },
            isFetching: false,
        })

        renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
                journeyIds: mockJourneyIds,
            }),
        )

        expect(usePostReportingV2).toHaveBeenCalledTimes(2)
        const conversationCall = (usePostReportingV2 as jest.Mock).mock
            .calls[0][0][0]
        const orderCall = (usePostReportingV2 as jest.Mock).mock.calls[1][0][0]

        expect(conversationCall.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    values: mockJourneyIds,
                }),
            ]),
        )
        expect(orderCall.filters).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    values: mockJourneyIds,
                }),
            ]),
        )
    })

    it('should handle null or missing measure values', () => {
        const mockConversationData = {
            data: {
                data: [
                    {
                        [AiSalesAgentConversationsDimension.JourneyId]:
                            'journey-1',
                        [AiSalesAgentConversationsMeasure.Count]: null,
                        [AiSalesAgentConversationsMeasure.AiJourneyTotalMessages]:
                            undefined,
                        [AiSalesAgentConversationsMeasure.ClickThroughRate]:
                            null,
                        [AiSalesAgentConversationsMeasure.ReplyRate]: undefined,
                        [AiSalesAgentConversationsMeasure.OptOutRate]: null,
                    },
                ],
            },
        }

        const mockOrderData = {
            data: {
                data: [
                    {
                        [AiSalesAgentOrdersDimension.JourneyId]: 'journey-1',
                        [AiSalesAgentOrdersMeasure.Gmv]: null,
                        [AiSalesAgentOrdersMeasure.Count]: undefined,
                        [AiSalesAgentOrdersMeasure.AverageOrderValue]: null,
                    },
                ],
            },
        }

        ;(usePostReportingV2 as jest.Mock).mockImplementation((queries) => {
            const metricName = queries[0].metricName
            if (metricName === 'ai-journey-conversation-measures-per-journey') {
                return {
                    data: mockConversationData,
                    isFetching: false,
                }
            }
            if (metricName === 'ai-journey-orders-measures-per-journey') {
                return {
                    data: mockOrderData,
                    isFetching: false,
                }
            }
            return { data: undefined, isFetching: false }
        })

        const { result } = renderHook(() =>
            useAIJourneyTableKpis({
                integrationId: mockIntegrationId,
                filters: mockFilters,
            }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.metrics['journey-1']).toEqual({
            recipients: 0,
            messagesSent: 0,
            ctr: 0,
            replyRate: 0,
            optOutRate: 0,
            revenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            revenuePerRecipient: 0,
            conversionRate: 0,
        })
    })
})
