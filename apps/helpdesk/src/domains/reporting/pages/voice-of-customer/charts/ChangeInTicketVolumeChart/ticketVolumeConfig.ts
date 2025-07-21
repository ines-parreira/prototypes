import { ticketCountForProductDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { TICKET_VOLUME_COLUMN_LABEL } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import {
    TICKET_VOLUME_CHART_LABEL,
    TICKET_VOLUME_CHART_TOOLTIP,
} from 'domains/reporting/pages/voice-of-customer/constants'
import { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'

const integer: MetricValueFormat = 'integer'

export const ChangeInTicketVolumeChartConfig = {
    [ProductsPerTicketColumn.TicketVolume]: {
        title: TICKET_VOLUME_CHART_LABEL,
        hint: {
            title: TICKET_VOLUME_CHART_TOOLTIP,
        },
    },
}

export const TicketVolumeConfig = {
    [ProductsPerTicketColumn.TicketVolume]: {
        title: TICKET_VOLUME_COLUMN_LABEL,
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketCountForProductDrillDownQueryFactory,
    },
}
