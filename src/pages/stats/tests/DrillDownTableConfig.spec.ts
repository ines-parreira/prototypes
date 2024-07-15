import moment from 'moment/moment'
import {customerSatisfactionMetricDrillDownQueryFactory} from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {StatsFilters} from 'models/stat/types'
import {getDrillDownQuery} from 'pages/stats/DrillDownTableConfig'
import {ChannelsTableColumns} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    AgentsMetrics,
    ChannelsMetrics,
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
} from 'state/ui/stats/types'
import {assumeMock} from 'utils/testing'
import {
    connectedCallsListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'

jest.mock(
    'models/reporting/queryFactories/support-performance/customerSatisfaction'
)
jest.mock('models/reporting/queryFactories/voice/voiceCall')
const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory
)
const connectedCallsListQueryFactoryMock = assumeMock(
    connectedCallsListQueryFactory
)
const waitingTimeCallsListQueryFactoryMock = assumeMock(
    waitingTimeCallsListQueryFactory
)

const periodStart = moment()
const periodEnd = periodStart.add(7, 'days')
const statsFilters: StatsFilters = {
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
        },
    ]
    const voiceMetrics: DrillDownMetric[] = [
        {
            metricName: VoiceMetric.AverageWaitTime,
        },
        {
            metricName: VoiceMetric.AverageTalkTime,
        },
    ]

    it.each([
        ...supportedMetrics,
        ...agentsMetrics,
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
        const statsFilters: StatsFilters = {
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
        const statsFilters: StatsFilters = {
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

    it('should call connectedCallsListQueryFactory for VoiceMetric.AverageTalkTime', () => {
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: VoiceMetric.AverageTalkTime,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(connectedCallsListQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone
        )
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
})
