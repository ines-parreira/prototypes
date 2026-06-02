import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { firstResponseTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesPerTicketBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { sentMessagesBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesSent'
import { resolutionTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { averageCsatBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { closedTicketsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsReplied'
import type { ChannelBreakdownFactory } from 'domains/reporting/pages/performance/utils/useMetricPerChannel'

export type PerformanceOverviewMetricKey =
    | 'averageCsat'
    | 'resolutionTime'
    | 'messagesPerTicket'
    | 'firstResponseTime'
    | 'humanResponseTimeAfterAiHandoff'
    | 'createdTickets'
    | 'closedTickets'
    | 'ticketsReplied'
    | 'messagesSent'

export const PERFORMANCE_OVERVIEW_METRIC_FACTORIES = {
    averageCsat: averageCsatBreakdownQueryFactoryV2.build,
    resolutionTime: resolutionTimeBreakdownQueryFactoryV2.build,
    messagesPerTicket: messagesPerTicketBreakdownQueryFactoryV2.build,
    firstResponseTime: firstResponseTimeBreakdownQueryFactoryV2.build,
    humanResponseTimeAfterAiHandoff:
        humanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2.build,
    createdTickets: createdTicketsBreakdownQueryFactoryV2.build,
    closedTickets: closedTicketsBreakdownQueryFactoryV2.build,
    ticketsReplied: ticketsRepliedBreakdownQueryFactoryV2.build,
    messagesSent: sentMessagesBreakdownQueryFactoryV2.build,
} satisfies Record<PerformanceOverviewMetricKey, ChannelBreakdownFactory>

export type PerformanceOverviewEntityMetrics = {
    entity: string
} & Record<PerformanceOverviewMetricKey, number | null>

export type PerformanceOverviewMetricsData = {
    data: PerformanceOverviewEntityMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: Record<PerformanceOverviewMetricKey, boolean>
}

export const buildPerformanceOverviewEntityRow =
    (
        entityData: Record<
            PerformanceOverviewMetricKey,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): PerformanceOverviewEntityMetrics => ({
        entity,
        averageCsat: entityData.averageCsat[entity] ?? null,
        resolutionTime: entityData.resolutionTime[entity] ?? null,
        messagesPerTicket: entityData.messagesPerTicket[entity] ?? null,
        firstResponseTime: entityData.firstResponseTime[entity] ?? null,
        humanResponseTimeAfterAiHandoff:
            entityData.humanResponseTimeAfterAiHandoff[entity] ?? null,
        createdTickets: entityData.createdTickets[entity] ?? null,
        closedTickets: entityData.closedTickets[entity] ?? null,
        ticketsReplied: entityData.ticketsReplied[entity] ?? null,
        messagesSent: entityData.messagesSent[entity] ?? null,
    })

export const hasAnyMetricValue = (
    row: PerformanceOverviewEntityMetrics,
): boolean =>
    Object.keys(PERFORMANCE_OVERVIEW_METRIC_FACTORIES).some(
        (key) => row[key as PerformanceOverviewMetricKey] !== null,
    )

export const PERFORMANCE_OVERVIEW_BREAKDOWN_METRIC_COLUMNS: MetricColumnConfig[] =
    [
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
