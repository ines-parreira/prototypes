import { CSAT_DRILL_DOWN_LABEL } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { AIInsightsMetric } from 'state/ui/stats/types'

export const AiInsightsMetricConfig: Record<
    AIInsightsMetric,
    {
        showMetric: boolean
        domain: Domain.Ticket
        title: string
        metricFormat: MetricValueFormat
    }
> = {
    [AIInsightsMetric.TicketCustomFieldsTicketCount]: {
        showMetric: false,
        domain: Domain.Ticket,
        title: '',
        metricFormat: 'decimal',
    },
    [AIInsightsMetric.TicketDrillDownPerCoverageRate]: {
        showMetric: false,
        domain: Domain.Ticket,
        title: '',
        metricFormat: 'decimal',
    },
    [AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction]: {
        showMetric: true,
        domain: Domain.Ticket,
        title: CSAT_DRILL_DOWN_LABEL,
        metricFormat: 'decimal',
    },
}
