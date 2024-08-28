import {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {ReportingGranularity} from 'models/reporting/types'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {getPreviousPeriod} from 'utils/reporting'
import {
    automationDatasetQueryFactory,
    billableTicketDatasetResolvedByAIAgentQueryFactory,
    billableTicketDatasetExcludingAIAgentQueryFactory,
    billableTicketDatasetQueryFactory,
} from 'models/reporting/queryFactories/automate_v2/metrics'
import {BillableTicketDatasetMeasure} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {AUTOMATION_RATE_LABEL} from 'pages/automate/automate-metrics/constants'

import {
    useAutomationDatasetByEventTypeTimeSeries,
    useAutomationDatasetTimeSeries,
    useBillableTicketDatasetTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useMultipleMetricsTrends} from 'hooks/reporting/useMultipleMetricsTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    automationRate,
    automationRateUnfilteredDenominator,
} from './automateStatsFormulae'
import {
    AutomateTimeseries as CalculatedTimeseries,
    AutomateTrendMetrics,
} from './types'
import {
    getAutomateStatsByMeasure,
    automateInteractionsByEventTypeToTimeSeries,
} from './utils'
import {
    getAutomationRateTrend,
    getAutomationRateUnfilteredDenominatorTrend,
    getDecreaseInFirstResponseTimeTrend,
    getDecreaseInResolutionTimeTrend,
} from './automateStatsCalculatedTrends'
import {useAIAgentUserId} from './useAIAgentUserId'

export const useAutomateMetricsTimeseriesV2 = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): CalculatedTimeseries => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]

    const aiAgentUserId = useAIAgentUserId()

    const onlyPeriodFilter = useMemo(
        () => ({[FilterKey.Period]: filters.period}),
        [filters.period]
    )

    const filteredAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity
    )
    const filteredAutomatedInteractionsDataByEventType =
        useAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity
        )

    const filteredInteractionsDataByEventTypeTimeSeries =
        automateInteractionsByEventTypeToTimeSeries(
            filters,
            granularity,
            filteredAutomatedInteractionsDataByEventType.data
        )

    const allAutomatedInteractionsData = useAutomationDatasetTimeSeries(
        onlyPeriodFilter,
        timezone,
        granularity
    )

    const billableTicketData = useBillableTicketDatasetTimeSeries(
        filters,
        timezone,
        granularity,
        aiAgentUserId
    )

    const filteredAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        filteredAutomatedInteractionsData.data
    )
    const filteredInteractionsByAutoRespondersSeries =
        getAutomateStatsByMeasure(
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            filteredAutomatedInteractionsData.data
        )

    const allAutomatedInteractionsSeries = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        allAutomatedInteractionsData.data
    )

    const allAutomatedInteractionsByAutoRespondersSeries =
        getAutomateStatsByMeasure(
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
            allAutomatedInteractionsData.data
        )

    const billableTicketCountsSeries = getAutomateStatsByMeasure(
        BillableTicketDatasetMeasure.BillableTicketCount,
        billableTicketData.data
    )

    const automationRates: TimeSeriesDataItem[] = []
    if (
        filteredAutomatedInteractionsData.isFetched &&
        billableTicketData.isFetched &&
        allAutomatedInteractionsData.isFetched &&
        filteredAutomatedInteractionsSeries?.length &&
        billableTicketCountsSeries?.length
    ) {
        filteredAutomatedInteractionsSeries?.forEach((timeSeries, index) => {
            const filteredAutomatedInteractions = timeSeries.value
            const filteredAutomatedInteractionsByAutoResponders =
                filteredInteractionsByAutoRespondersSeries?.[index].value
            const billableTicketCount =
                billableTicketCountsSeries?.[index].value
            const allAutomatedInteractions =
                allAutomatedInteractionsSeries?.[index].value
            const allAutomatedInteractionsByAutoResponders =
                allAutomatedInteractionsByAutoRespondersSeries?.[index].value

            automationRates.push({
                dateTime: timeSeries.dateTime,
                value: isAutomateNonFilteredDenominatorInAutomationRate
                    ? automationRateUnfilteredDenominator({
                          filteredAutomatedInteractions,
                          allAutomatedInteractions,
                          allAutomatedInteractionsByAutoResponders,
                          billableTicketsCount: billableTicketCount,
                      })
                    : automationRate(
                          filteredAutomatedInteractions,
                          billableTicketCount,
                          filteredAutomatedInteractionsByAutoResponders
                      ),
                label: AUTOMATION_RATE_LABEL,
            })
        })
    }

    const calculatedData: CalculatedTimeseries = {
        isFetching:
            filteredAutomatedInteractionsData.isFetching ||
            billableTicketData.isFetching ||
            filteredAutomatedInteractionsDataByEventType.isFetching,
        isError:
            filteredAutomatedInteractionsData.isError ||
            billableTicketData.isError ||
            filteredAutomatedInteractionsDataByEventType.isError,
        automationRateTimeSeries: [automationRates],
        automatedInteractionTimeSeries: [filteredAutomatedInteractionsSeries],
        automatedInteractionByEventTypesTimeSeries:
            filteredInteractionsDataByEventTypeTimeSeries,
    }

    return calculatedData
}

export const useAutomateMetricsTrendV2 = (
    filters: StatsFilters,
    timezone: string
): Record<AutomateTrendMetrics, MetricTrend> => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]

    const onlyPeriodFilter = useMemo(
        () => ({[FilterKey.Period]: filters.period}),
        [filters.period]
    )

    const aiAgentUserId = useAIAgentUserId()

    const filteredAutomatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(filters, timezone),
        automationDatasetQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const allAutomatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(onlyPeriodFilter, timezone),
        automationDatasetQueryFactory(
            {period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const ticketDatasetExcludingAIAgent = useMultipleMetricsTrends(
        billableTicketDatasetExcludingAIAgentQueryFactory(
            filters,
            timezone,
            aiAgentUserId
        ),
        billableTicketDatasetExcludingAIAgentQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            aiAgentUserId
        )
    )

    const ticketDatasetIncludingAIAgent = useMultipleMetricsTrends(
        billableTicketDatasetQueryFactory(filters, timezone),
        billableTicketDatasetQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const ticketDatasetResolvedByAIAgent = useMultipleMetricsTrends(
        billableTicketDatasetResolvedByAIAgentQueryFactory(
            filters,
            timezone,
            aiAgentUserId
        ),
        billableTicketDatasetResolvedByAIAgentQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            aiAgentUserId
        )
    )

    const filteredAutomatedInteractions =
        filteredAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]
    const allAutomatedInteractions =
        allAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]

    const filteredAutomatedInteractionsByAutoResponders =
        filteredAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders
        ]
    const allAutomatedInteractionsByAutoResponders =
        allAutomatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders
        ]

    const billableTicketsExcludingAIAgent =
        ticketDatasetExcludingAIAgent.data?.[
            BillableTicketDatasetMeasure.BillableTicketCount
        ]
    const firstResponseTimeExcludingAIAgent =
        ticketDatasetExcludingAIAgent.data?.[
            BillableTicketDatasetMeasure.TotalFirstResponseTime
        ]
    const firstResponseTimeIncludingAIAgent =
        ticketDatasetIncludingAIAgent.data?.[
            BillableTicketDatasetMeasure.TotalFirstResponseTime
        ]
    const resolutionTimeExcludingAIAgent =
        ticketDatasetExcludingAIAgent.data?.[
            BillableTicketDatasetMeasure.TotalResolutionTime
        ]
    const resolutionTimeResolvedByAIAgent =
        ticketDatasetResolvedByAIAgent.data?.[
            BillableTicketDatasetMeasure.TotalResolutionTime
        ]

    const isFetching =
        filteredAutomatedInteractionsData.isFetching ||
        allAutomatedInteractionsData.isFetching ||
        ticketDatasetExcludingAIAgent.isFetching ||
        ticketDatasetIncludingAIAgent.isFetching ||
        ticketDatasetResolvedByAIAgent.isFetching

    const isError =
        filteredAutomatedInteractionsData.isError ||
        allAutomatedInteractionsData.isError ||
        ticketDatasetExcludingAIAgent.isError ||
        ticketDatasetIncludingAIAgent.isError ||
        ticketDatasetResolvedByAIAgent.isError

    return {
        automatedInteractionTrend: {
            isFetching,
            isError,
            data: filteredAutomatedInteractions,
        },
        automationRateTrend: isAutomateNonFilteredDenominatorInAutomationRate
            ? getAutomationRateUnfilteredDenominatorTrend({
                  isFetching,
                  isError,
                  filteredAutomatedInteractions,
                  allAutomatedInteractions,
                  allAutomatedInteractionsByAutoResponders,
                  billableTicketsCount: billableTicketsExcludingAIAgent,
              })
            : getAutomationRateTrend(
                  isFetching,
                  isError,
                  filteredAutomatedInteractions,
                  billableTicketsExcludingAIAgent,
                  filteredAutomatedInteractionsByAutoResponders
              ),
        decreaseInFirstResponseTimeTrend: getDecreaseInFirstResponseTimeTrend(
            isFetching,
            isError,
            filteredAutomatedInteractions,
            billableTicketsExcludingAIAgent,
            firstResponseTimeExcludingAIAgent,
            firstResponseTimeIncludingAIAgent
        ),
        decreaseInResolutionTimeTrend: getDecreaseInResolutionTimeTrend(
            isFetching,
            isError,
            filteredAutomatedInteractions,
            billableTicketsExcludingAIAgent,
            resolutionTimeExcludingAIAgent,
            resolutionTimeResolvedByAIAgent
        ),
    }
}
