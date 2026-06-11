import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { channelsEmailFirstResponseTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { channelsEmailHumanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { channelsEmailMessagesPerTicketBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { channelsEmailMessagesSentBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesSent'
import { channelsEmailResolutionTimeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { channelsEmailAverageCsatBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { channelsEmailClosedTicketsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsClosed'
import { channelsEmailCreatedTicketsBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { channelsEmailTicketsRepliedBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsReplied'
import type { ChannelBreakdownFactory } from 'domains/reporting/pages/performance/utils/useMetricPerChannel'

export type ChannelsEmailMetricKey =
    | 'averageCsat'
    | 'resolutionTime'
    | 'messagesPerTicket'
    | 'firstResponseTime'
    | 'humanResponseTimeAfterAiHandoff'
    | 'createdTickets'
    | 'closedTickets'
    | 'ticketsReplied'
    | 'messagesSent'

export const CHANNELS_EMAIL_METRIC_FACTORIES = {
    averageCsat: channelsEmailAverageCsatBreakdownQueryFactoryV2,
    resolutionTime: channelsEmailResolutionTimeBreakdownQueryFactoryV2,
    messagesPerTicket: channelsEmailMessagesPerTicketBreakdownQueryFactoryV2,
    firstResponseTime: channelsEmailFirstResponseTimeBreakdownQueryFactoryV2,
    humanResponseTimeAfterAiHandoff:
        channelsEmailHumanResponseTimeAfterAiHandoffBreakdownQueryFactoryV2,
    createdTickets: channelsEmailCreatedTicketsBreakdownQueryFactoryV2,
    closedTickets: channelsEmailClosedTicketsBreakdownQueryFactoryV2,
    ticketsReplied: channelsEmailTicketsRepliedBreakdownQueryFactoryV2,
    messagesSent: channelsEmailMessagesSentBreakdownQueryFactoryV2,
} satisfies Record<ChannelsEmailMetricKey, ChannelBreakdownFactory>

export type ChannelsEmailEntityMetrics = {
    entity: string
} & Record<ChannelsEmailMetricKey, number | null>

export type ChannelsEmailMetricsData = {
    data: ChannelsEmailEntityMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: Record<ChannelsEmailMetricKey, boolean>
}

export const buildChannelsEmailEntityRow =
    (
        entityData: Record<
            ChannelsEmailMetricKey,
            Partial<Record<string, number | null | undefined>>
        >,
    ) =>
    (entity: string): ChannelsEmailEntityMetrics => ({
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

export const hasAnyMetricValue = (row: ChannelsEmailEntityMetrics): boolean =>
    Object.keys(CHANNELS_EMAIL_METRIC_FACTORIES).some(
        (key) => row[key as ChannelsEmailMetricKey] !== null,
    )

export const CHANNELS_EMAIL_BREAKDOWN_METRIC_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'createdTickets',
        label: 'Email tickets created',
        tooltipConfig: METRIC_TOOLTIPS.createdTickets,
        metricFormat: 'decimal',
        loadingStateKeys: ['createdTickets'],
    },
    {
        accessorKey: 'averageCsat',
        label: METRIC_TOOLTIPS.averageCSAT.title,
        tooltipConfig: METRIC_TOOLTIPS.averageCSAT,
        metricFormat: 'decimal',
        loadingStateKeys: ['averageCsat'],
    },
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
        accessorKey: 'humanResponseTimeAfterAiHandoff',
        label: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff.title,
        tooltipConfig: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff,
        metricFormat: 'duration',
        loadingStateKeys: ['humanResponseTimeAfterAiHandoff'],
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
