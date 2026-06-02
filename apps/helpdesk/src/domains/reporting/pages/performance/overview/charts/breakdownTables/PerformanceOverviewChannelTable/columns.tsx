import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { humanizeChannel } from 'state/ticket/utils'

export const PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS: NameColumnConfig[] = [
    { accessor: 'entity', label: 'Channel', formatName: humanizeChannel },
]

export const PERFORMANCE_OVERVIEW_CHANNEL_TABLE = {
    title: 'Performance by channel',
    description:
        'Performance metrics per channel: resolution time, first response time, messages per ticket, average CSAT, ticket volume, and message volume.',
}

export const PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'resolutionTime',
        label: METRIC_TOOLTIPS.resolutionTime.title,
        tooltipConfig: METRIC_TOOLTIPS.resolutionTime,
        metricFormat: 'duration',
        loadingStateKeys: ['resolutionTime'],
    },
    {
        accessorKey: 'firstResponseTime',
        label: METRIC_TOOLTIPS.firstResponseTime.title,
        tooltipConfig: METRIC_TOOLTIPS.firstResponseTime,
        metricFormat: 'duration',
        loadingStateKeys: ['firstResponseTime'],
    },
    {
        accessorKey: 'messagesPerTicket',
        label: METRIC_TOOLTIPS.messagesPerTicket.title,
        tooltipConfig: METRIC_TOOLTIPS.messagesPerTicket,
        metricFormat: 'decimal',
        loadingStateKeys: ['messagesPerTicket'],
    },
    {
        accessorKey: 'averageCsat',
        label: METRIC_TOOLTIPS.averageCSAT.title,
        tooltipConfig: METRIC_TOOLTIPS.averageCSAT,
        metricFormat: 'decimal',
        loadingStateKeys: ['averageCsat'],
    },
    {
        accessorKey: 'humanResponseTimeAfterAiHandoff',
        label: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff.title,
        tooltipConfig: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff,
        metricFormat: 'duration',
        loadingStateKeys: ['humanResponseTimeAfterAiHandoff'],
    },
    {
        accessorKey: 'createdTickets',
        label: METRIC_TOOLTIPS.createdTickets.title,
        tooltipConfig: METRIC_TOOLTIPS.createdTickets,
        metricFormat: 'decimal',
        loadingStateKeys: ['createdTickets'],
    },
    {
        accessorKey: 'closedTickets',
        label: METRIC_TOOLTIPS.performanceClosedTickets.title,
        tooltipConfig: METRIC_TOOLTIPS.performanceClosedTickets,
        metricFormat: 'decimal',
        loadingStateKeys: ['closedTickets'],
    },
    {
        accessorKey: 'ticketsReplied',
        label: METRIC_TOOLTIPS.ticketsReplied.title,
        tooltipConfig: METRIC_TOOLTIPS.ticketsReplied,
        metricFormat: 'decimal',
        loadingStateKeys: ['ticketsReplied'],
    },
    {
        accessorKey: 'messagesSent',
        label: METRIC_TOOLTIPS.messagesSent.title,
        tooltipConfig: METRIC_TOOLTIPS.messagesSent,
        metricFormat: 'decimal',
        loadingStateKeys: ['messagesSent'],
    },
]
