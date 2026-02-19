import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
    fetchFilteredAutomatedInteractionsByAutoResponders,
    fetchFirstResponseTimeExcludingAIAgent,
    fetchFirstResponseTimeIncludingAIAgent,
    fetchResolutionTimeExcludingAIAgent,
    fetchResolutionTimeResolvedByAIAgent,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useFilteredAutomatedInteractions,
    useFilteredAutomatedInteractionsByAutoResponders,
    useFirstResponseTimeExcludingAIAgent,
    useFirstResponseTimeIncludingAIAgent,
    useResolutionTimeExcludingAIAgent,
    useResolutionTimeResolvedByAIAgent,
} from 'domains/reporting/hooks/automate/automationTrends'
import type { MultipleMetricsData } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'domains/reporting/hooks/useMultipleMetricsTrend'
import type { Cubes } from 'domains/reporting/models/cubes'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import { automationDatasetQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { automatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMultipleMetricsTrend')
const useMultipleMetricsTrendsMock = assumeMock(useMultipleMetricsTrends)
const fetchMultipleMetricsTrendsMock = assumeMock(fetchMultipleMetricsTrends)

describe('automationTrends', () => {
    describe('AutomatedInteractions', () => {
        const periodStart = '2021-05-29T00:00:00.000'
        const periodEnd = '2021-06-04T23:59:59.000'
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
            channels: withDefaultLogicalOperator(['email']),
        }
        const timezone = 'UTC'
        const filteredAutomatedInteractionsTrend = {
            value: 123,
            prevValue: 456,
        }

        const automatedInteractionsByAutoRespondersTrend = {
            value: 789,
            prevValue: 987,
        }

        describe('automatedInteractions', () => {
            it('should fetch query and return data for FilteredAutomatedInteractions', () => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const { result } = renderHook(() =>
                    useFilteredAutomatedInteractions(statsFilters, timezone),
                )

                expect(result.current).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should hook with V2 data for FilteredAutomatedInteractions', () => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        automatedInteractions:
                            filteredAutomatedInteractionsTrend,
                        automatedInteractionsByAutoResponders:
                            automatedInteractionsByAutoRespondersTrend,
                    } as unknown as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const { result } = renderHook(() =>
                    useFilteredAutomatedInteractions(statsFilters, timezone),
                )

                expect(result.current).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FilteredAutomatedInteractions with fetch', async () => {
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const result = await fetchFilteredAutomatedInteractions(
                    statsFilters,
                    timezone,
                )

                expect(fetchMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(statsFilters, timezone),
                    automationDatasetQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch with V2 data for FilteredAutomatedInteractions', async () => {
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        automatedInteractions:
                            filteredAutomatedInteractionsTrend,
                        automatedInteractionsByAutoResponders:
                            automatedInteractionsByAutoRespondersTrend,
                    } as unknown as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const result = await fetchFilteredAutomatedInteractions(
                    statsFilters,
                    timezone,
                )

                expect(fetchMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(statsFilters, timezone),
                    automationDatasetQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FilteredAutomatedInteractionsByAutoResponders', () => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const { result } = renderHook(() =>
                    useFilteredAutomatedInteractionsByAutoResponders(
                        statsFilters,
                        timezone,
                    ),
                )

                expect(useMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(statsFilters, timezone),
                    automationDatasetQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result.current).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FilteredAutomatedInteractionsByAutoResponders with fetch', async () => {
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const result =
                    await fetchFilteredAutomatedInteractionsByAutoResponders(
                        statsFilters,
                        timezone,
                    )

                expect(fetchMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(statsFilters, timezone),
                    automationDatasetQueryFactory(
                        {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: statsFilters,
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            ...statsFilters,
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AllAutomatedInteractions', () => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const { result } = renderHook(() =>
                    useAllAutomatedInteractions(statsFilters, timezone),
                )

                expect(result.current).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AllAutomatedInteractions with fetch', async () => {
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const result = await fetchAllAutomatedInteractions(
                    statsFilters,
                    timezone,
                )

                expect(fetchMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(
                        { period: statsFilters.period },
                        timezone,
                    ),
                    automationDatasetQueryFactory(
                        { period: getPreviousPeriod(statsFilters.period) },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: { period: statsFilters.period },
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AllAutomatedInteractionsByAutoResponders', () => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const { result } = renderHook(() =>
                    useAllAutomatedInteractionsByAutoResponders(
                        statsFilters,
                        timezone,
                    ),
                )

                expect(useMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(
                        { period: statsFilters.period },
                        timezone,
                    ),
                    automationDatasetQueryFactory(
                        { period: getPreviousPeriod(statsFilters.period) },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: { period: statsFilters.period },
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result.current).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AllAutomatedInteractionsByAutoResponders with fetch', async () => {
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        [AutomationDatasetMeasure.AutomatedInteractions]:
                            filteredAutomatedInteractionsTrend,
                        [AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders]:
                            automatedInteractionsByAutoRespondersTrend,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })

                const result =
                    await fetchAllAutomatedInteractionsByAutoResponders(
                        statsFilters,
                        timezone,
                    )

                expect(fetchMultipleMetricsTrendsMock).toHaveBeenCalledWith(
                    automationDatasetQueryFactory(
                        { period: statsFilters.period },
                        timezone,
                    ),
                    automationDatasetQueryFactory(
                        { period: getPreviousPeriod(statsFilters.period) },
                        timezone,
                    ),
                    automatedInteractionsQueryV2Factory({
                        filters: { period: statsFilters.period },
                        timezone,
                    }),
                    automatedInteractionsQueryV2Factory({
                        filters: {
                            period: getPreviousPeriod(statsFilters.period),
                        },
                        timezone,
                    }),
                )
                expect(result).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })
        })

        describe('billableTickets', () => {
            const aiAgentUserId = 4000
            const billableTicketCount = { value: 123, prevValue: 456 }
            const totalFirstResponseTime = { value: 789, prevValue: 654 }
            const totalResolutionTime = { value: 543, prevValue: 987 }

            beforeEach(() => {
                useMultipleMetricsTrendsMock.mockReturnValue({
                    data: {
                        [BillableTicketDatasetMeasure.BillableTicketCount]:
                            billableTicketCount,
                        [BillableTicketDatasetMeasure.TotalFirstResponseTime]:
                            totalFirstResponseTime,
                        [BillableTicketDatasetMeasure.TotalResolutionTime]:
                            totalResolutionTime,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })
                fetchMultipleMetricsTrendsMock.mockResolvedValue({
                    data: {
                        [BillableTicketDatasetMeasure.BillableTicketCount]:
                            billableTicketCount,
                        [BillableTicketDatasetMeasure.TotalFirstResponseTime]:
                            totalFirstResponseTime,
                        [BillableTicketDatasetMeasure.TotalResolutionTime]:
                            totalResolutionTime,
                    } as MultipleMetricsData<Cubes>,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for billableTicketsExcludingAIAgent with a hook', () => {
                const { result } = renderHook(() =>
                    useBillableTicketsExcludingAIAgent(
                        statsFilters,
                        timezone,
                        aiAgentUserId,
                    ),
                )

                expect(result.current).toEqual({
                    data: billableTicketCount,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for billableTicketsExcludingAIAgent with a fetch method', async () => {
                const result = await fetchBillableTicketsExcludingAIAgent(
                    statsFilters,
                    timezone,
                    aiAgentUserId,
                )

                expect(result).toEqual({
                    data: billableTicketCount,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FirstResponseTimeExcludingAIAgent with a hook', () => {
                const { result } = renderHook(() =>
                    useFirstResponseTimeExcludingAIAgent(
                        statsFilters,
                        timezone,
                        aiAgentUserId,
                    ),
                )

                expect(result.current).toEqual({
                    data: totalFirstResponseTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FirstResponseTimeExcludingAIAgent with a fetch method', async () => {
                const result = await fetchFirstResponseTimeExcludingAIAgent(
                    statsFilters,
                    timezone,
                    aiAgentUserId,
                )

                expect(result).toEqual({
                    data: totalFirstResponseTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for useFirstResponseTimeIncludingAIAgent with a hook', () => {
                const { result } = renderHook(() =>
                    useFirstResponseTimeIncludingAIAgent(
                        statsFilters,
                        timezone,
                    ),
                )

                expect(result.current).toEqual({
                    data: totalFirstResponseTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for fetchFirstResponseTimeIncludingAIAgent with a fetch method', async () => {
                const result = await fetchFirstResponseTimeIncludingAIAgent(
                    statsFilters,
                    timezone,
                )

                expect(result).toEqual({
                    data: totalFirstResponseTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FirstResponseTimeExcludingAIAgent with a hook', () => {
                const { result } = renderHook(() =>
                    useResolutionTimeExcludingAIAgent(
                        statsFilters,
                        timezone,
                        aiAgentUserId,
                    ),
                )

                expect(result.current).toEqual({
                    data: totalResolutionTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for FirstResponseTimeExcludingAIAgent with a fetch method', async () => {
                const result = await fetchResolutionTimeExcludingAIAgent(
                    statsFilters,
                    timezone,
                    aiAgentUserId,
                )

                expect(result).toEqual({
                    data: totalResolutionTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for useResolutionTimeResolvedByAIAgent with a hook', () => {
                const { result } = renderHook(() =>
                    useResolutionTimeResolvedByAIAgent(statsFilters, timezone),
                )

                expect(result.current).toEqual({
                    data: totalResolutionTime,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for fetchResolutionTimeResolvedByAIAgent with a fetch method', async () => {
                const result = await fetchResolutionTimeResolvedByAIAgent(
                    statsFilters,
                    timezone,
                )

                expect(result).toEqual({
                    data: totalResolutionTime,
                    isFetching: false,
                    isError: false,
                })
            })
        })
    })
})
