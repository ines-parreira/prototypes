import { ticketCountForProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { TICKET_VOLUME_COLUMN_LABEL } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import {
    TICKET_VOLUME_CHART_LABEL,
    TICKET_VOLUME_CHART_TOOLTIP,
} from 'pages/stats/voice-of-customer/constants'
import { ProductsPerTicketColumn } from 'state/ui/stats/productsPerTicketSlice'

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
