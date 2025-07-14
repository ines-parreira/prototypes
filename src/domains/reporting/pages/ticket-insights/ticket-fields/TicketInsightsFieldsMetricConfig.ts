import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { TooltipData } from 'domains/reporting/pages/types'
import { TicketFieldsMetric } from 'domains/reporting/state/ui/stats/types'

export enum TicketInsightsFieldsMetric {
    TicketDistribution = 'ticket-distribution',
    TicketInsightsFieldTrend = 'ticket-insights-field-trend',
    CustomFieldsTicketCountBreakdown = 'custom-fields-ticket-count-breakdown',
}

type MetricConfig = {
    title: string
    hint: TooltipData
}

export const TicketInsightsFieldsMetricConfig: Record<
    TicketInsightsFieldsMetric,
    MetricConfig
> = {
    [TicketInsightsFieldsMetric.TicketDistribution]: {
        title: 'Top used values',
        hint: {
            title: 'Top 10 used values, as well as the number of tickets that were labeled with one of these values within the selected timeframe for the selected Ticket Field. All other values are grouped in the “Outside of Top used”.',
        },
    },
    [TicketInsightsFieldsMetric.TicketInsightsFieldTrend]: {
        title: 'Trend',
        hint: {
            title: 'Evolution of the top 10 used values during the selected timeframe. Values are grouped by the date the value was added to a ticket.',
        },
    },
    [TicketInsightsFieldsMetric.CustomFieldsTicketCountBreakdown]: {
        title: 'All used values',
        hint: {
            title: 'Number of tickets labeled with each value within the selected timeframe for the selected Ticket Field. Only values that have been used at least once are shown.',
        },
    },
}

export const TicketFieldsMetricConfig: Record<
    TicketFieldsMetric,
    {
        showMetric: boolean
        domain: Domain.Ticket
        title: string
        metricFormat: MetricValueFormat
    }
> = {
    [TicketFieldsMetric.TicketCustomFieldsTicketCount]: {
        showMetric: false,
        domain: Domain.Ticket,
        title: '',
        metricFormat: 'decimal',
    },
}
