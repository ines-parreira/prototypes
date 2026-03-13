import { assumeMock } from '@repo/testing'

import {
    defaultEnrichmentFields,
    useDrillDownDataV2,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    formatConvertCampaignSalesDrillDownRowData,
    formatTicketDrillDownRowData,
    formatVoiceDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { getDrillDownHook } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type {
    AgentsMetrics,
    ChannelsMetrics,
    DrillDownMetric,
    SlaMetrics,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    ChannelsTableColumns,
    ConvertMetric,
    SlaMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'

jest.mock('domains/reporting/hooks/useDrillDownData')

const useDrillDownDataV2Mock = assumeMock(useDrillDownDataV2)
const useEnrichedDrillDownDataMock = assumeMock(useEnrichedDrillDownData)

describe('getDrillDownHook', () => {
    const agentsMetrics: AgentsMetrics[] = [
        { metricName: AgentsTableColumn.CustomerSatisfaction, perAgentId: 123 },
        {
            metricName: AgentsTableColumn.MedianFirstResponseTime,
            perAgentId: 123,
        },
        { metricName: AgentsTableColumn.MedianResolutionTime, perAgentId: 123 },
        { metricName: AgentsTableColumn.MessagesSent, perAgentId: 123 },
        {
            metricName: AgentsTableColumn.PercentageOfClosedTickets,
            perAgentId: 123,
        },
        { metricName: AgentsTableColumn.ClosedTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.RepliedTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.OneTouchTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.TicketHandleTime, perAgentId: 123 },
    ]
    const channelMetrics: ChannelsMetrics[] = [
        {
            metricName: ChannelsTableColumns.CustomerSatisfaction,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.FirstResponseTime,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.MedianResponseTime,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.MedianResolutionTime,
            perChannel: 'email',
        },
        { metricName: ChannelsTableColumns.MessagesSent, perChannel: 'email' },
        {
            metricName: ChannelsTableColumns.MessagesReceived,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.CreatedTicketsPercentage,
            perChannel: 'email',
        },
        { metricName: ChannelsTableColumns.ClosedTickets, perChannel: 'email' },
        {
            metricName: ChannelsTableColumns.TicketsReplied,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.TicketHandleTime,
            perChannel: 'email',
        },
    ]
    const supportedMetrics: DrillDownMetric[] = [
        {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: ['some::customField'],
            ticketTimeReference: TicketTimeReference.TaggedAt,
        },
        { metricName: OverviewMetric.OpenTickets },
        { metricName: OverviewMetric.TicketsClosed },
        { metricName: OverviewMetric.TicketsCreated },
        { metricName: OverviewMetric.TicketsReplied },
        { metricName: OverviewMetric.MessagesSent },
        { metricName: OverviewMetric.MessagesReceived },
        { metricName: OverviewMetric.MessagesPerTicket },
        { metricName: OverviewMetric.MedianResolutionTime },
        { metricName: OverviewMetric.MedianResponseTime },
        {
            metricName: OverviewMetric.MedianFirstResponseTime,
        },
        { metricName: OverviewMetric.CustomerSatisfaction },
        { metricName: OverviewMetric.OneTouchTickets },
        { metricName: OverviewMetric.TicketHandleTime },
        { metricName: OverviewMetric.TicketHandleTime },
    ]
    const slaMetrics: SlaMetrics[] = [
        {
            metricName: SlaMetric.AchievementRate,
        },
        { metricName: SlaMetric.BreachedTicketsRate },
    ]
    const convertMetrics: DrillDownMetric[] = [
        {
            metricName: ConvertMetric.CampaignSalesCount,
            shopName: 'shopify:shopName',
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
            selectedCampaignIds: [],
            context: {
                channel_connection_external_ids: [],
            },
        },
    ]

    const voiceMetrics = [
        { metricName: VoiceMetric.AverageWaitTime },
        { metricName: VoiceMetric.AverageTalkTime },
        { metricName: VoiceMetric.QueueAverageWaitTime },
        { metricName: VoiceMetric.QueueAverageTalkTime },
        { metricName: VoiceMetric.QueueInboundCalls },
        { metricName: VoiceMetric.QueueInboundUnansweredCalls },
        { metricName: VoiceMetric.QueueInboundMissedCalls },
        { metricName: VoiceMetric.QueueInboundAbandonedCalls },
        { metricName: VoiceMetric.QueueOutboundCalls },
        { metricName: VoiceAgentsMetric.AgentTotalCalls, perAgentId: 123 },
        {
            metricName: VoiceAgentsMetric.AgentInboundMissedCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentInboundAnsweredCalls,
            perAgentId: 123,
        },
        { metricName: VoiceAgentsMetric.AgentOutboundCalls, perAgentId: 123 },
        { metricName: VoiceAgentsMetric.AgentAverageTalkTime, perAgentId: 123 },
    ]

    it.each([
        ...supportedMetrics,
        ...agentsMetrics,
        ...channelMetrics,
        ...slaMetrics,
    ])(
        'should return a default hook for DrillDown metric: $metricName',
        (metricData: DrillDownMetric) => {
            const hook = getDrillDownHook(metricData)
            hook(metricData)
            expect(useEnrichedDrillDownDataMock).toHaveBeenCalledWith(
                expect.any(Function),
                metricData,
                defaultEnrichmentFields,
                formatTicketDrillDownRowData,
                EnrichmentFields.TicketId,
            )
        },
    )

    it.each(voiceMetrics)(
        `should return the correct hook for the voice metric: $metricName`,
        (metricData) => {
            const hook = getDrillDownHook(metricData)
            hook(metricData)
            expect(useDrillDownDataV2Mock).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function),
                metricData,
                formatVoiceDrillDownRowData,
            )
        },
    )

    it.each(convertMetrics)(
        `should return the correct hook for the convert metric: $metricName`,
        (metricData) => {
            const hook = getDrillDownHook(metricData)

            hook(metricData)

            expect(useEnrichedDrillDownDataMock).toHaveBeenCalledWith(
                expect.any(Function),
                metricData,
                [EnrichmentFields.CustomerIntegrationDataByExternalId],
                formatConvertCampaignSalesDrillDownRowData,
                EnrichmentFields.OrderCustomerId,
            )
        },
    )
})
