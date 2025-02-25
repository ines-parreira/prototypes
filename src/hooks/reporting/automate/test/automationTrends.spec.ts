import { renderHook } from '@testing-library/react-hooks'

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
} from 'hooks/reporting/automate/automationTrends'
import {
    fetchMultipleMetricsTrends,
    MultipleMetricsData,
    useMultipleMetricsTrends,
} from 'hooks/reporting/useMultipleMetricsTrend'
import { Cubes } from 'models/reporting/cubes'
import { AutomationDatasetMeasure } from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import { BillableTicketDatasetMeasure } from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import { automationDatasetQueryFactory } from 'models/reporting/queryFactories/automate_v2/metrics'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/useMultipleMetricsTrend')
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
            it('should fetch query and return data for AutomatedInteractions', () => {
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

            it('should fetch query and return data for AutomatedInteractions with fetch', async () => {
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
                )
                expect(result).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders', () => {
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
                )
                expect(result.current).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders with fetch', async () => {
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
                )
                expect(result).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders', () => {
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

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders with fetch', async () => {
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
                )
                expect(result).toEqual({
                    data: filteredAutomatedInteractionsTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders', () => {
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
                )
                expect(result.current).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })

            it('should fetch query and return data for AutomatedInteractionsByAutoResponders with fetch', async () => {
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
                )
                expect(result).toEqual({
                    data: automatedInteractionsByAutoRespondersTrend,
                    isFetching: false,
                    isError: false,
                })
            })
        })

        describe('billableTickets', () => {
            const aiAgentUserId = '4000'
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
