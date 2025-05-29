import { tagsTicketCountDrillDownByReferenceQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricConfig } from 'pages/stats/types'
import { TagsMetric } from 'state/ui/stats/types'

export enum TicketInsightsTagsMetric {
    AllUsedTagsTableChart = 'all-used-tags-table-chart',
    TagsTrendChart = 'tags-trend-chart',
    TopUsedTagsChart = 'top-used-tags-chart',
}

export const TicketInsightsTagsMetricConfig: Record<
    TicketInsightsTagsMetric,
    MetricConfig
> = {
    [TicketInsightsTagsMetric.AllUsedTagsTableChart]: {
        title: 'All used tags',
        hint: {
            title: 'Number of tickets labeled with each tag within the selected timeframe. Only tags that have been used at least once are shown.',
        },
    },
    [TicketInsightsTagsMetric.TagsTrendChart]: {
        title: 'Trend',
        hint: {
            title: 'Evolution of the top 10 used tags during the selected timeframe. Values are grouped by the date the tag was added to a ticket.',
        },
    },
    [TicketInsightsTagsMetric.TopUsedTagsChart]: {
        title: 'Top used tags',
        hint: {
            title: 'Top 10 used tags: number of tickets labeled with one of the tags within the selected timeframe, and the delta compared to the previous period.',
        },
    },
}

export const TagsMetricConfig: Record<
    TagsMetric,
    {
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: typeof tagsTicketCountDrillDownByReferenceQueryFactory
    }
> = {
    [TagsMetric.TicketCount]: {
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: tagsTicketCountDrillDownByReferenceQueryFactory, // TODO
    },
}
