import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { AIInsightsMetric } from 'domains/reporting/state/ui/stats/types'
import { CSAT_DRILL_DOWN_LABEL } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'

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
