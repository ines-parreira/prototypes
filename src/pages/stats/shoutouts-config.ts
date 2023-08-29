import _partial from 'lodash/partial'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useFirstResponseTimeMetricPerAgent,
    useResolutionTimeMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {OrderDirection} from 'models/api/types'
import {ReportingMeasure, TicketMeasure} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {TableColumn} from 'state/ui/stats/types'
import {
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
    formatMetricValue,
} from './common/utils'
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
    formatValue: (
        value: number | null | undefined,
        format?: MetricValueFormat,
        notAvailableText?: string
    ) => string
    measure: ReportingMeasure
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
        measure: TicketMeasure.SurveyScore,
    },
    {
        useQuery: useFirstResponseTimeMetricPerAgent,
        queryOrder: OrderDirection.Asc,
        metricName: TableLabels[TableColumn.FirstResponseTime],
        formatValue: formatDuration,
        measure: TicketMeasure.FirstResponseTime,
    },
    {
        useQuery: useResolutionTimeMetricPerAgent,
        queryOrder: OrderDirection.Asc,
        metricName: TableLabels[TableColumn.ResolutionTime],
        formatValue: formatDuration,
        measure: TicketMeasure.ResolutionTime,
    },
    {
        useQuery: useClosedTicketsMetricPerAgent,
        queryOrder: OrderDirection.Desc,
        metricName: TableLabels[TableColumn.ClosedTickets],
        formatValue: formatDecimals,
        measure: TicketMeasure.TicketCount,
    },
]
