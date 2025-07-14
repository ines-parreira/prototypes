import _partial from 'lodash/partial'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { TicketSatisfactionSurveyMeasure } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { TableLabels } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AgentsTableColumn } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'

export interface ShoutoutConfig {
    useQuery: (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string,
    ) => MetricWithDecile
    queryOrder: OrderDirection
    metricName: string
    formatValue: typeof formatMetricValue
    measure: HelpdeskMessageCubeWithJoins['measures']
    title: string
    hint: {
        title: string
    }
}

const formatDecimals = _partial(
    formatMetricValue,
    _partial.placeholder,
    'decimal',
    NOT_AVAILABLE_PLACEHOLDER,
)
const formatDuration = _partial(
    formatMetricValue,
    _partial.placeholder,
    'duration',
    NOT_AVAILABLE_PLACEHOLDER,
)

export enum TopPerformersChart {
    TopCSATPerformers = 'top_performers_csat_performers',
    TopFirstResponseTimePerformers = 'top_performers_first_response_time_performers',
    TopResponseTimePerformers = 'top_performers_response_time_performers',
    TopClosedTicketsPerformers = 'top_performers_closed_tickets_performers',
}

export const AGENTS_SHOUT_OUTS_TITLE = 'Top performers'
export const SHOUTOUT_DESCRIPTION =
    'Shoutout for the agent(s) that is doing the best for'

export const AgentsShoutOutsConfig: Record<TopPerformersChart, ShoutoutConfig> =
    {
        [TopPerformersChart.TopCSATPerformers]: {
            useQuery: useCustomerSatisfactionMetricPerAgent,
            queryOrder: OrderDirection.Desc,
            metricName: TableLabels[AgentsTableColumn.CustomerSatisfaction],
            formatValue: formatDecimals,
            measure: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
            title: `${AGENTS_SHOUT_OUTS_TITLE} - ${TableLabels[AgentsTableColumn.CustomerSatisfaction]}`,
            hint: {
                title: `${SHOUTOUT_DESCRIPTION} ${TableLabels[AgentsTableColumn.CustomerSatisfaction]}`,
            },
        },
        [TopPerformersChart.TopFirstResponseTimePerformers]: {
            useQuery: useMedianFirstResponseTimeMetricPerAgent,
            queryOrder: OrderDirection.Asc,
            metricName: TableLabels[AgentsTableColumn.MedianFirstResponseTime],
            formatValue: formatDuration,
            measure: TicketMessagesMeasure.MedianFirstResponseTime,
            title: `${AGENTS_SHOUT_OUTS_TITLE} - ${TableLabels[AgentsTableColumn.MedianFirstResponseTime]}`,
            hint: {
                title: `${SHOUTOUT_DESCRIPTION} ${TableLabels[AgentsTableColumn.MedianFirstResponseTime]}`,
            },
        },
        [TopPerformersChart.TopResponseTimePerformers]: {
            useQuery: useMedianResolutionTimeMetricPerAgent,
            queryOrder: OrderDirection.Asc,
            metricName: TableLabels[AgentsTableColumn.MedianResolutionTime],
            formatValue: formatDuration,
            measure: TicketMessagesMeasure.MedianResolutionTime,
            title: `${AGENTS_SHOUT_OUTS_TITLE} - ${TableLabels[AgentsTableColumn.MedianResolutionTime]}`,
            hint: {
                title: `${SHOUTOUT_DESCRIPTION} ${TableLabels[AgentsTableColumn.MedianResolutionTime]}`,
            },
        },
        [TopPerformersChart.TopClosedTicketsPerformers]: {
            useQuery: useClosedTicketsMetricPerAgent,
            queryOrder: OrderDirection.Desc,
            metricName: TableLabels[AgentsTableColumn.ClosedTickets],
            formatValue: formatDecimals,
            measure: TicketMeasure.TicketCount,
            title: `${AGENTS_SHOUT_OUTS_TITLE} - ${TableLabels[AgentsTableColumn.ClosedTickets]}`,
            hint: {
                title: `${SHOUTOUT_DESCRIPTION} ${TableLabels[AgentsTableColumn.ClosedTickets]}`,
            },
        },
    }
