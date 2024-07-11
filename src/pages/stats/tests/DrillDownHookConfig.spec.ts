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
import {getDrillDownHook} from 'pages/stats/DrillDownHookConfig'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import {assumeMock} from 'utils/testing'
import {
    formatConvertCampaignSalesDrillDownRowData,
    formatVoiceDrillDownRowData,
} from '../DrillDownFormatters'

jest.mock('hooks/reporting/useDrillDownData')

const useDrillDownDataMock = assumeMock(useDrillDownData)

describe('getDrillDownHook', () => {
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
            shopName: 'shopify:shopName',
        },
    ]

    const voiceMetrics = [
        {metricName: VoiceMetric.AverageWaitTime},
        {metricName: VoiceMetric.AverageTalkTime},
    ]

    it.each([
        ...supportedMetrics,
        ...agentsMetrics,
        ...channelMetrics,
        ...slaMetrics,
        ...convertMetrics,
        ...voiceMetrics,
    ])(
        'should return a hook for every DrillDown metric: $metricName',
        (metricName: DrillDownMetric) => {
            expect(getDrillDownHook(metricName)).toEqual(expect.any(Function))
        }
    )

    it.each(voiceMetrics)(
        `should return the correct hook for the metric: $metricName`,
        (metricData) => {
            const hook = getDrillDownHook(metricData)
            hook(metricData)
            expect(useDrillDownDataMock).toHaveBeenCalledWith(
                metricData,
                formatVoiceDrillDownRowData
            )
        }
    )

    it.each(convertMetrics)(
        `should return the correct hook for the metric: $metricName`,
        (metricData) => {
            const hook = getDrillDownHook(metricData)
            hook(metricData)
            expect(useDrillDownDataMock).toHaveBeenCalledWith(
                metricData,
                formatConvertCampaignSalesDrillDownRowData
            )
        }
    )
})
