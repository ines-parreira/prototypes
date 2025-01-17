import _partial from 'lodash/partial'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {StatsFilters} from 'models/stat/types'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricValue,
} from 'pages/stats/common/utils'
import {TableLabels} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {AgentsTableColumn} from 'state/ui/stats/types'

export interface ShoutoutConfig {
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string
    ) => MetricWithDecile
    queryOrder: OrderDirection
    metricName: string
    formatValue: typeof formatMetricValue
    measure: HelpdeskMessageCubeWithJoins['measures']
}

const formatDecimals = _partial(
    formatMetricValue,
    _partial.placeholder,
    'decimal',
    NOT_AVAILABLE_PLACEHOLDER
)
const formatDuration = _partial(
    formatMetricValue,
    _partial.placeholder,
    'duration',
    NOT_AVAILABLE_PLACEHOLDER
)

export enum TopPerformersChart {
    TopCSATPerformers = 'top_performers_csat_performers',
    TopFirstResponseTimePerformers = 'top_performers_first_response_time_performers',
    TopResponseTimePerformers = 'top_performers_response_time_performers',
    TopClosedTicketsPerformers = 'top_performers_closed_tickets_performers',
}

export const AgentsShoutOutsConfig: Record<TopPerformersChart, ShoutoutConfig> =
    {
        [TopPerformersChart.TopCSATPerformers]: {
            useQuery: useCustomerSatisfactionMetricPerAgent,
            queryOrder: OrderDirection.Desc,
            metricName: TableLabels[AgentsTableColumn.CustomerSatisfaction],
            formatValue: formatDecimals,
            measure: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
        },
        [TopPerformersChart.TopFirstResponseTimePerformers]: {
            useQuery: useMedianFirstResponseTimeMetricPerAgent,
            queryOrder: OrderDirection.Asc,
            metricName: TableLabels[AgentsTableColumn.MedianFirstResponseTime],
            formatValue: formatDuration,
            measure: TicketMessagesMeasure.MedianFirstResponseTime,
        },
        [TopPerformersChart.TopResponseTimePerformers]: {
            useQuery: useMedianResolutionTimeMetricPerAgent,
            queryOrder: OrderDirection.Asc,
            metricName: TableLabels[AgentsTableColumn.MedianResolutionTime],
            formatValue: formatDuration,
            measure: TicketMessagesMeasure.MedianResolutionTime,
        },
        [TopPerformersChart.TopClosedTicketsPerformers]: {
            useQuery: useClosedTicketsMetricPerAgent,
            queryOrder: OrderDirection.Desc,
            metricName: TableLabels[AgentsTableColumn.ClosedTickets],
            formatValue: formatDecimals,
            measure: TicketMeasure.TicketCount,
        },
    }
