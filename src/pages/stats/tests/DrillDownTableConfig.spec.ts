import moment from 'moment/moment'

import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {customerSatisfactionMetricDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {customFieldsTicketCountPerTicketDrillDownQueryFactory} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {tagsTicketCountDrillDownQueryFactory} from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {
    connectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {campaignSalesDrillDownQueryFactory} from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {AutoQAAgentsTableColumn} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {
    AgentsMetrics,
    ChannelsMetrics,
    ConvertMetrics,
    DrillDownMetric,
    SlaMetrics,
    TagsFieldsMetrics,
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
    TagsMetric,
    ChannelsTableColumns,
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'

jest.mock(
    'models/reporting/queryFactories/support-performance/customerSatisfaction'
)
jest.mock('models/reporting/queryFactories/voice/voiceCall')
jest.mock(
    'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
)
jest.mock(
    'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
)
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')

const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory
)
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')
const tagsTicketCountDrillDownQueryFactoryMock = assumeMock(
    tagsTicketCountDrillDownQueryFactory
)
const connectedCallsListQueryFactoryMock = assumeMock(
    connectedCallsListQueryFactory
)
const waitingTimeCallsListQueryFactoryMock = assumeMock(
    waitingTimeCallsListQueryFactory
)
const voiceCallListQueryFactoryMock = assumeMock(voiceCallListQueryFactory)
const liveDashboardVoiceCallListQueryFactoryMock = assumeMock(
    liveDashBoardVoiceCallListQueryFactory
)
const campaignSalesDrillDownQueryFactoryMock = assumeMock(
    campaignSalesDrillDownQueryFactory
)
const tagsTicketCountPerTicketDrillDownQueryFactoryMock = assumeMock(
    tagsTicketCountDrillDownQueryFactory
)
const customFieldsTicketCountPerTicketDrillDownQueryFactoryMock = assumeMock(
    customFieldsTicketCountPerTicketDrillDownQueryFactory
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
            metricName: AutoQAMetric.ResolutionCompleteness,
        },
        {
            metricName: AutoQAMetric.ReviewedClosedTickets,
        },
        {
            metricName: AutoQAMetric.CommunicationSkills,
        },
        {
            metricName: AutoQAMetric.LanguageProficiency,
        },
        {
            metricName: AutoQAAgentsTableColumn.ResolutionCompleteness,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.ReviewedClosedTickets,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.CommunicationSkills,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.LanguageProficiency,
            perAgentId: 123,
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
        {metricName: TagsMetric.TicketCount, tagId: 'TAG_ID'},
    ]
    const slaMetrics: SlaMetrics[] = [
        {
            metricName: SlaMetric.AchievementRate,
        },
        {metricName: SlaMetric.BreachedTicketsRate},
    ]
    const tagsMetrics: TagsFieldsMetrics[] = [
        {
            metricName: TagsMetric.TicketCount,
            tagId: '123',
        },
    ]
    const convertMetrics: DrillDownMetric[] = [
        {
            metricName: ConvertMetric.CampaignSalesCount,
            shopName: 'shopify:someShop',
            campaignsOperator: LogicalOperatorEnum.ONE_OF,
            selectedCampaignIds: ['someCampaignId'],
            abVariant: 'someAbVariant',
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
            metricName: VoiceMetric.QueueAverageWaitTime,
        },
        {
            metricName: VoiceMetric.QueueAverageTalkTime,
        },
        {
            metricName: VoiceMetric.QueueInboundCalls,
        },
        {
            metricName: VoiceMetric.QueueMissedInboundCalls,
        },
        {
            metricName: VoiceMetric.QueueOutboundCalls,
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
        ...tagsMetrics,
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
            expect.objectContaining({
                agents: withDefaultLogicalOperator([
                    drillDownMetric.perAgentId,
                ]),
            }),
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
            expect.objectContaining({
                channels: withDefaultLogicalOperator([
                    drillDownMetric.perChannel,
                ]),
            }),
            timezone,
            undefined
        )
    })

    it('should be populated with tagId and default dateRange', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: TagsMetric.TicketCount,
            tagId: '123',
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(tagsTicketCountDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            drillDownMetric.tagId,
            statsFilters.period,
            undefined
        )
    })

    it('should be populated with tagId and dateRange', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const dateRange = {
            end_datetime: periodStart.clone().add(1, 'days').toISOString(),
            start_datetime: periodStart.toISOString(),
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: TagsMetric.TicketCount,
            tagId: '123',
            dateRange: dateRange,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(tagsTicketCountDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            drillDownMetric.tagId,
            dateRange,
            undefined
        )
    })

    it('should be populated with channel filter using statsFiltersWithLogicalOperator', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFiltersWithLogicalOperator = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
            channels: withDefaultLogicalOperator(['email']),
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: ChannelsTableColumns.CustomerSatisfaction,
            perChannel: 'email',
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(customerSatisfactionQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                channels: withDefaultLogicalOperator([
                    drillDownMetric.perChannel,
                ]),
            }),
            timezone,
            undefined
        )
    })

    it('should be populated with agent filter using statsFiltersWithLogicalOperator', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFiltersWithLogicalOperator = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
            agents: withDefaultLogicalOperator([5, 15]),
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: AgentsTableColumn.CustomerSatisfaction,
            perAgentId: 123,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(customerSatisfactionQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                agents: withDefaultLogicalOperator([
                    drillDownMetric.perAgentId,
                ]),
            }),
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

    it.each([
        {
            metricName: VoiceMetric.QueueInboundCalls,
            segment: VoiceCallSegment.inboundCalls,
        },
        {
            metricName: VoiceMetric.QueueMissedInboundCalls,
            segment: VoiceCallSegment.missedCalls,
        },
        {
            metricName: VoiceMetric.QueueOutboundCalls,
            segment: VoiceCallSegment.outboundCalls,
        },
    ])(
        'should call liveDashboardVoiceCallListQueryFactory for (%d)',
        ({metricName, segment}) => {
            getDrillDownQuery({metricName})(statsFilters, segment)

            expect(
                liveDashboardVoiceCallListQueryFactoryMock
            ).toHaveBeenCalledWith(statsFilters, segment)
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
            LogicalOperatorEnum.ONE_OF,
            statsFilters,
            timezone,
            undefined,
            'someAbVariant'
        )
    })

    it('should be populated with TagId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const tagsMetric = {
            metricName: TagsMetric.TicketCount,
            tagId: 'TAG_ID',
        }
        getDrillDownQuery({
            metricName: TagsMetric.TicketCount,
            tagId: 'TAG_ID',
        })(statsFilters, timezone)

        expect(
            tagsTicketCountPerTicketDrillDownQueryFactoryMock
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            tagsMetric.tagId,
            statsFilters.period,
            undefined
        )
    })

    it('should be populated with customFieldId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: LegacyStatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const customFieldMetric = {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: ['customFieldValue'],
        }

        getDrillDownQuery(customFieldMetric)(statsFilters, timezone)

        expect(
            customFieldsTicketCountPerTicketDrillDownQueryFactoryMock
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            customFieldMetric.customFieldId.toString(),
            customFieldMetric.customFieldValue,
            statsFilters.period,
            undefined
        )
    })
})
