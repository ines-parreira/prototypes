import _partial from 'lodash/partial'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {StatsFilters} from 'models/stat/types'
import {TableColumn} from 'state/ui/stats/types'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {NOT_AVAILABLE_PLACEHOLDER, formatMetricValue} from './common/utils'
import {TableLabels} from './TableConfig'

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

export const shoutoutsConfig: ShoutoutConfig[] = [
    {
        useQuery: useCustomerSatisfactionMetricPerAgent,
        queryOrder: OrderDirection.Desc,
        metricName: TableLabels[TableColumn.CustomerSatisfaction],
        formatValue: formatDecimals,
        measure: TicketSatisfactionSurveyMeasure.AvgSurveyScore,
    },
    {
        useQuery: useMedianFirstResponseTimeMetricPerAgent,
        queryOrder: OrderDirection.Asc,
        metricName: TableLabels[TableColumn.MedianFirstResponseTime],
        formatValue: formatDuration,
        measure: TicketMessagesMeasure.MedianFirstResponseTime,
    },
    {
        useQuery: useMedianResolutionTimeMetricPerAgent,
        queryOrder: OrderDirection.Asc,
        metricName: TableLabels[TableColumn.MedianResolutionTime],
        formatValue: formatDuration,
        measure: TicketMessagesMeasure.MedianResolutionTime,
    },
    {
        useQuery: useClosedTicketsMetricPerAgent,
        queryOrder: OrderDirection.Desc,
        metricName: TableLabels[TableColumn.ClosedTickets],
        formatValue: formatDecimals,
        measure: TicketMeasure.TicketCount,
    },
]
