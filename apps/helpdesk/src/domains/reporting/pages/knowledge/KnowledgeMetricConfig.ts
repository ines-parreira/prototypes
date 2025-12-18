import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'

export const KnowledgeMetricConfig = {
    [KnowledgeMetric.Tickets]: {
        showMetric: false,
        domain: Domain.Knowledge,
    },
    [KnowledgeMetric.HandoverTickets]: {
        showMetric: false,
        domain: Domain.Knowledge,
    },
    [KnowledgeMetric.CSAT]: {
        showMetric: false,
        domain: Domain.Knowledge,
    },
}
