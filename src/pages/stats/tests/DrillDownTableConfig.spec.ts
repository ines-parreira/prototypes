import moment from 'moment/moment'
import {customerSatisfactionMetricDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {LegacyStatsFilters} from 'models/stat/types'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    AgentsMetrics,
    ChannelsMetrics,
    ConvertMetrics,
    DrillDownMetric,
    SlaMetrics,
} from 'state/ui/stats/drillDownSlice'
import {
    OverviewMetric,
    AgentsTableColumn,
    TicketFieldsMetric,
    SlaMetric,
    ConvertMetric,
    VoiceMetric,
    AutoQAMetric,
    VoiceAgentsMetric,
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {
    connectedCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {campaignSalesDrillDownQueryFactory} from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'

jest.mock(
    'models/reporting/queryFactories/support-performance/customerSatisfaction'
)
jest.mock('models/reporting/queryFactories/voice/voiceCall')
jest.mock(
    'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
)
const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory
)
const connectedCallsListQueryFactoryMock = assumeMock(
    connectedCallsListQueryFactory
)
const waitingTimeCallsListQueryFactoryMock = assumeMock(
    waitingTimeCallsListQueryFactory
)
const voiceCallListQueryFactoryMock = assumeMock(voiceCallListQueryFactory)
const campaignSalesDrillDownQueryFactoryMock = assumeMock(
    campaignSalesDrillDownQueryFactory
)

const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters = {
    period: {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    },
}

describe('getDrillDownQuery', () => {
    const agentsMetrics: AgentsMetrics[] = [
        {metricName: AgentsTableColumn.CustomerSatisfaction, perAgentId: 123},
        {
            metricName: AgentsTableColumn.MedianFirstResponseTime,
            perAgentId: 123,
        },
        {metricName: AgentsTableColumn.MedianResolutionTime, perAgentId: 123},
        {metricName: AgentsTableColumn.MessagesSent, perAgentId: 123},
        {
            metricName: AgentsTableColumn.PercentageOfClosedTickets,
            perAgentId: 123,
        },
        {metricName: AgentsTableColumn.ClosedTickets, perAgentId: 123},
        {metricName: AgentsTableColumn.RepliedTickets, perAgentId: 123},
        {metricName: AgentsTableColumn.OneTouchTickets, perAgentId: 123},
        {metricName: AgentsTableColumn.TicketHandleTime, perAgentId: 123},
    ]
    const autoQAMetrics: DrillDownMetric[] = [
        {
            metricName: AutoQAMetric.ResolvedTickets,
        },
        {
            metricName: AutoQAMetric.ReviewedClosedTickets,
        },
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
            metricName: ChannelsTableColumns.MedianResolutionTime,
            perChannel: 'email',
        },
        {metricName: ChannelsTableColumns.MessagesSent, perChannel: 'email'},
        {
            metricName: ChannelsTableColumns.CreatedTicketsPercentage,
            perChannel: 'email',
        },
        {metricName: ChannelsTableColumns.ClosedTickets, perChannel: 'email'},
        {metricName: ChannelsTableColumns.TicketsReplied, perChannel: 'email'},
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
        },
        {metricName: OverviewMetric.OpenTickets},
        {metricName: OverviewMetric.TicketsClosed},
        {metricName: OverviewMetric.TicketsCreated},
        {metricName: OverviewMetric.TicketsReplied},
        {metricName: OverviewMetric.MessagesSent},
        {metricName: OverviewMetric.MessagesPerTicket},
        {metricName: OverviewMetric.MedianResolutionTime},
        {metricName: OverviewMetric.MedianFirstResponseTime},
        {metricName: OverviewMetric.CustomerSatisfaction},
        {metricName: OverviewMetric.OneTouchTickets},
        {metricName: OverviewMetric.TicketHandleTime},
        {metricName: OverviewMetric.TicketHandleTime},
    ]
    const slaMetrics: SlaMetrics[] = [
        {
            metricName: SlaMetric.AchievementRate,
        },
        {metricName: SlaMetric.BreachedTicketsRate},
    ]
    const convertMetrics: DrillDownMetric[] = [
        {
            metricName: ConvertMetric.CampaignSalesCount,
            shopName: 'shopify:someShop',
            selectedCampaignIds: ['someCampaignId'],
            context: {
                channel_connection_external_ids: [],
            },
        },
    ]
    const voiceMetrics: DrillDownMetric[] = [
        {
            metricName: VoiceMetric.AverageWaitTime,
        },
        {
            metricName: VoiceMetric.AverageTalkTime,
        },
        {
            metricName: VoiceAgentsMetric.AgentTotalCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentInboundAnsweredCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentInboundMissedCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentOutboundCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentAverageTalkTime,
            perAgentId: 123,
        },
    ]

    it.each([
        ...supportedMetrics,
        ...agentsMetrics,
        ...autoQAMetrics,
        ...channelMetrics,
        ...slaMetrics,
        ...convertMetrics,
        ...voiceMetrics,
    ])(
        'should return a query for every DrillDown metric: $metricName',
        (metricName: DrillDownMetric) => {
            expect(getDrillDownQuery(metricName)).toEqual(expect.any(Function))
        }
    )

    it('should be populated with agentId filter', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: AgentsTableColumn.CustomerSatisfaction,
            perAgentId: 123,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(customerSatisfactionQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({agents: [drillDownMetric.perAgentId]}),
            timezone,
            undefined
        )
    })

    it('should be populated with channel filter', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: ChannelsTableColumns.CustomerSatisfaction,
            perChannel: 'email',
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(customerSatisfactionQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({channels: [drillDownMetric.perChannel]}),
            timezone,
            undefined
        )
    })

    it.each([
        {
            metricName: VoiceMetric.AverageTalkTime,
        },
        {
            metricName: VoiceAgentsMetric.AgentAverageTalkTime,
            perAgentId: 123,
        },
    ])('should call connectedCallsListQueryFactory for metric &s', (metric) => {
        const timezone = 'someTimeZone'

        getDrillDownQuery(metric)(statsFilters, timezone)

        expect(connectedCallsListQueryFactoryMock).toHaveBeenCalled()
    })

    it('should call waitingTimeCallsListQueryFactory for VoiceMetric.AverageWaitTime', () => {
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: VoiceMetric.AverageWaitTime,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(waitingTimeCallsListQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            VoiceCallSegment.inboundCalls
        )
    })

    it.each([
        VoiceAgentsMetric.AgentTotalCalls,
        VoiceAgentsMetric.AgentInboundAnsweredCalls,
        VoiceAgentsMetric.AgentInboundMissedCalls,
        VoiceAgentsMetric.AgentOutboundCalls,
    ])(
        'should call voiceCallListQueryFactory for $metricName',
        (metricName: VoiceAgentsMetric) => {
            const timezone = 'someTimeZone'
            const drillDownMetric: DrillDownMetric = {
                metricName,
                perAgentId: 123,
            }

            getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

            expect(voiceCallListQueryFactoryMock).toHaveBeenCalled()
        }
    )

    it('should be populated with shopName and selectedCampaignIds filter', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = convertMetrics[0] as ConvertMetrics

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(campaignSalesDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            drillDownMetric.shopName,
            drillDownMetric.selectedCampaignIds,
            statsFilters,
            timezone,
            undefined
        )
    })
})
