import {StatsFilters} from 'models/stat/types'
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
import {automationRate} from './automateStatsFormulae'
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
    getDecreaseInFirstResponseTimeTrend,
    getDecreaseInResolutionTimeTrend,
} from './automateStatsCalculatedTrends'
import {useAIAgentUserId} from './useAIAgentUserId'

export const useAutomateMetricsTimeseriesV2 = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): CalculatedTimeseries => {
    const aiAgentUserId = useAIAgentUserId()

    const automatedInteractionsData = useAutomationDatasetTimeSeries(
        filters,
        timezone,
        granularity
    )
    const automatedInteractionsDataByEventType =
        useAutomationDatasetByEventTypeTimeSeries(
            filters,
            timezone,
            granularity
        )

    const interactionsDataByEventTypeTimeSeries =
        automateInteractionsByEventTypeToTimeSeries(
            filters,
            granularity,
            automatedInteractionsDataByEventType.data
        )

    const billableTicketData = useBillableTicketDatasetTimeSeries(
        filters,
        timezone,
        granularity,
        aiAgentUserId
    )

    const automatedInteractions = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractions,
        automatedInteractionsData.data
    )
    const interactionsByAutoResponders = getAutomateStatsByMeasure(
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
        automatedInteractionsData.data
    )

    const billableTicketCounts = getAutomateStatsByMeasure(
        BillableTicketDatasetMeasure.BillableTicketCount,
        billableTicketData.data
    )

    const automationRates: TimeSeriesDataItem[] = []
    if (
        automatedInteractionsData.isFetched &&
        billableTicketData.isFetched &&
        automatedInteractions?.length &&
        billableTicketCounts?.length
    ) {
        automatedInteractions?.forEach((timeSeries, index) => {
            const automatedInteractions = timeSeries.value
            const automatedInteractionsByAutoResponders =
                interactionsByAutoResponders?.[index].value
            const billableTicketCount = billableTicketCounts?.[index].value

            automationRates.push({
                dateTime: timeSeries.dateTime,
                value: automationRate(
                    automatedInteractions,
                    billableTicketCount,
                    automatedInteractionsByAutoResponders
                ),
                label: AUTOMATION_RATE_LABEL,
            })
        })
    }

    const calculatedData: CalculatedTimeseries = {
        isFetching:
            automatedInteractionsData.isFetching ||
            billableTicketData.isFetching ||
            automatedInteractionsDataByEventType.isFetching,
        isError:
            automatedInteractionsData.isError ||
            billableTicketData.isError ||
            automatedInteractionsDataByEventType.isError,
        automationRateTimeSeries: [automationRates],
        automatedInteractionTimeSeries: [automatedInteractions],
        automatedInteractionByEventTypesTimeSeries:
            interactionsDataByEventTypeTimeSeries,
    }

    return calculatedData
}

export const useAutomateMetricsTrendV2 = (
    filters: StatsFilters,
    timezone: string
): Record<AutomateTrendMetrics, MetricTrend> => {
    const aiAgentUserId = useAIAgentUserId()

    const automatedInteractionsData = useMultipleMetricsTrends(
        automationDatasetQueryFactory(filters, timezone),
        automationDatasetQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
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

    const automatedInteractions =
        automatedInteractionsData.data?.[
            AutomationDatasetMeasure.AutomatedInteractions
        ]
    const automatedInteractionsByAutoResponders =
        automatedInteractionsData.data?.[
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
        automatedInteractionsData.isFetching ||
        ticketDatasetExcludingAIAgent.isFetching
    const isError =
        automatedInteractionsData.isError ||
        ticketDatasetExcludingAIAgent.isError
    return {
        automatedInteractionTrend: {
            isFetching,
            isError,
            data: automatedInteractions,
        },
        automationRateTrend: getAutomationRateTrend(
            isFetching,
            isError,
            automatedInteractions,
            billableTicketsExcludingAIAgent,
            automatedInteractionsByAutoResponders
        ),
        decreaseInFirstResponseTimeTrend: getDecreaseInFirstResponseTimeTrend(
            isFetching,
            isError,
            automatedInteractions,
            billableTicketsExcludingAIAgent,
            firstResponseTimeExcludingAIAgent,
            firstResponseTimeIncludingAIAgent
        ),
        decreaseInResolutionTimeTrend: getDecreaseInResolutionTimeTrend(
            isFetching,
            isError,
            automatedInteractions,
            billableTicketsExcludingAIAgent,
            resolutionTimeExcludingAIAgent,
            resolutionTimeResolvedByAIAgent
        ),
    }
}
