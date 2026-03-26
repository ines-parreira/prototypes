import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { IntentMetric } from 'domains/reporting/state/ui/stats/types'

export const IntentMetricConfig = {
    [IntentMetric.TicketVolume]: {
        showMetric: false,
        domain: Domain.Ticket,
    },
    [IntentMetric.Handover]: {
        showMetric: false,
        domain: Domain.Ticket,
    },
}
