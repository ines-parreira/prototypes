import moment from 'moment'

import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import {
    discountCodesOfferedDrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import {
    customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { tagsTicketCountDrillDownByReferenceQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters, TicketTimeReference } from 'models/stat/types'
import { CSAT_DRILL_DOWN_LABEL } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import { AiSalesAgentChart } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    getDrillDownMetricColumn,
    getDrillDownQuery,
} from 'pages/stats/common/drill-down/helpers'
import { MetricValueFormat } from 'pages/stats/common/utils'
import { campaignSalesDrillDownQueryFactory } from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {
    CSAT_SCORE,
    SatisfactionMetricConfig as SatisfactionTrendCardConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SLA_FORMAT, SLA_STATUS_COLUMN_LABEL } from 'pages/stats/sla/SlaConfig'
import { TableLabels } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels as autoQATableLabels,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { OverviewMetric } from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { ProductInsightsColumnWithDrillDownConfig } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { MEDIAN_RESOLUTION_TIME_LABEL } from 'services/reporting/constants'
import {
    AgentsMetrics,
    AiSalesAgentMetrics,
    ChannelsMetrics,
    ConvertMetrics,
    DrillDownMetric,
    SatisfactionAverageSurveyScoreMetrics,
    SatisfactionMetrics,
    SlaMetrics,
    TagsFieldsMetrics,
    TicketFieldsMetrics,
} from 'state/ui/stats/drillDownSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    ProductInsightsTableColumns,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('models/reporting/queryFactories/voice/voiceCall')
jest.mock(
    'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory',
)
jest.mock(
    'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount',
)
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')
jest.mock('models/reporting/queryFactories/ai-sales-agent/metrics')

jest.mock(
    'models/reporting/queryFactories/support-performance/customerSatisfaction',
)
const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory,
)
jest.mock('models/reporting/queryFactories/ticket-insights/tagsTicketCount')
const tagsTicketCountDrillDownByReferenceQueryFactoryMock = assumeMock(
    tagsTicketCountDrillDownByReferenceQueryFactory,
)
const connectedCallsListQueryFactoryMock = assumeMock(
    connectedCallsListQueryFactory,
)
const waitingTimeCallsListQueryFactoryMock = assumeMock(
    waitingTimeCallsListQueryFactory,
)
const voiceCallListQueryFactoryMock = assumeMock(voiceCallListQueryFactory)
const liveDashboardVoiceCallListQueryFactoryMock = assumeMock(
    liveDashBoardVoiceCallListQueryFactory,
)
const campaignSalesDrillDownQueryFactoryMock = assumeMock(
    campaignSalesDrillDownQueryFactory,
)
const customFieldsTicketCountPerTicketDrillDownQueryFactoryMock = assumeMock(
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
)
const customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactoryMock =
    assumeMock(
        customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory,
    )
const liveDashboardWaitingTimeCallsListQueryFactoryMock = assumeMock(
    liveDashboardWaitingTimeCallsListQueryFactory,
)
const liveDashboardConnectedCallsListQueryFactoryMock = assumeMock(
    liveDashboardConnectedCallsListQueryFactory,
)

const aiSalesAgentTotalSalesConvDrillDownQueryFactoryMock = assumeMock(
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
)
const totalNumberOfAutomatedSalesDrillDownQueryFactoryMock = assumeMock(
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
)
const discountCodesOfferedDrillDownQueryFactoryMock = assumeMock(
    discountCodesOfferedDrillDownQueryFactory,
)
const totalNumberOfOrderDrillDownQueryFactoryMock = assumeMock(
    totalNumberOfOrderDrillDownQueryFactory,
)
const totalNumberProductRecommendationsDrillDownQueryFactoryMock = assumeMock(
    totalNumberProductRecommendationsDrillDownQueryFactory,
)

describe('getDrillDownQuery', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
    }

    const agentsMetrics: AgentsMetrics[] = [
        { metricName: AgentsTableColumn.CustomerSatisfaction, perAgentId: 123 },
        {
            metricName: AgentsTableColumn.MedianFirstResponseTime,
            perAgentId: 123,
        },
        {
            metricName: AgentsTableColumn.MedianResponseTime,
            perAgentId: 123,
        },
        { metricName: AgentsTableColumn.MedianResolutionTime, perAgentId: 123 },
        { metricName: AgentsTableColumn.MessagesSent, perAgentId: 123 },
        { metricName: AgentsTableColumn.MessagesReceived, perAgentId: 123 },
        {
            metricName: AgentsTableColumn.PercentageOfClosedTickets,
            perAgentId: 123,
        },
        { metricName: AgentsTableColumn.ClosedTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.RepliedTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.OneTouchTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.ZeroTouchTickets, perAgentId: 123 },
        { metricName: AgentsTableColumn.TicketHandleTime, perAgentId: 123 },
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
            metricName: AutoQAMetric.Accuracy,
        },
        {
            metricName: AutoQAMetric.Efficiency,
        },
        {
            metricName: AutoQAMetric.InternalCompliance,
        },
        {
            metricName: AutoQAMetric.BrandVoice,
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
        {
            metricName: AutoQAAgentsTableColumn.Accuracy,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.Efficiency,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.InternalCompliance,
            perAgentId: 123,
        },
        {
            metricName: AutoQAAgentsTableColumn.BrandVoice,
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
            metricName: ChannelsTableColumns.MedianResponseTime,
            perChannel: 'email',
        },
        {
            metricName: ChannelsTableColumns.MedianResolutionTime,
            perChannel: 'email',
        },
        { metricName: ChannelsTableColumns.MessagesSent, perChannel: 'email' },
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
    const productInsightsMetrics: DrillDownMetric[] = [
        {
            metricName: ProductInsightsTableColumns.NegativeSentiment,
            productId: '123',
        },
        {
            metricName: ProductInsightsTableColumns.PositiveSentiment,
            productId: '123',
        },
        {
            metricName: ProductInsightsTableColumns.TicketsVolume,
            productId: '123',
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
        { metricName: OverviewMetric.MedianFirstResponseTime },
        { metricName: OverviewMetric.CustomerSatisfaction },
        { metricName: OverviewMetric.OneTouchTickets },
        { metricName: OverviewMetric.ZeroTouchTickets },
        { metricName: OverviewMetric.TicketHandleTime },
        { metricName: OverviewMetric.TicketHandleTime },
        {
            metricName: TagsMetric.TicketCount,
            tagId: 'TAG_ID',
            ticketTimeReference: TicketTimeReference.TaggedAt,
        },
    ]
    const slaMetrics: SlaMetrics[] = [
        {
            metricName: SlaMetric.AchievementRate,
        },
        { metricName: SlaMetric.BreachedTicketsRate },
    ]
    const satisfactionMetrics: SatisfactionMetrics[] = Object.values(
        SatisfactionMetric,
    ).map((metricName) => ({
        metricName,
    }))

    const satisfactionAverageSurveyScore: SatisfactionAverageSurveyScoreMetrics[] =
        Object.values(SatisfactionAverageSurveyScoreMetric).map(
            (metricName) => ({
                metricName,
            }),
        )

    const tagsMetrics: TagsFieldsMetrics[] = [
        {
            metricName: TagsMetric.TicketCount,
            ticketTimeReference: TicketTimeReference.TaggedAt,
            tagId: '123',
        },
    ]
    const convertMetrics: ConvertMetrics[] = [
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
        { metricName: VoiceMetric.QueueInboundUnansweredCalls },
        { metricName: VoiceMetric.QueueInboundMissedCalls },
        { metricName: VoiceMetric.QueueInboundAbandonedCalls },
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

    const aiInsightsMetrics: DrillDownMetric[] = [
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
            perAgentId: '1',
            customFieldId: 1,
            customFieldValue: null,
        },
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
            perAgentId: '1',
            customFieldId: 1,
            customFieldValue: ['value'],
        },
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCoverageRate,
            perAgentId: '1',
            customFieldId: 1,
            customFieldValue: null,
        },
        {
            metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 1,
            customFieldValue: ['value'],
        },
    ]

    it.each([
        ...supportedMetrics,
        ...agentsMetrics,
        ...autoQAMetrics,
        ...channelMetrics,
        ...slaMetrics,
        ...satisfactionMetrics,
        ...satisfactionAverageSurveyScore,
        ...convertMetrics,
        ...voiceMetrics,
        ...tagsMetrics,
        ...aiInsightsMetrics,
        ...productInsightsMetrics,
    ])(
        'should return a query for every DrillDown metric: $metricName',
        (metricName: DrillDownMetric) => {
            expect(getDrillDownQuery(metricName)).toEqual(expect.any(Function))
        },
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
            expect.objectContaining({
                agents: withDefaultLogicalOperator([
                    drillDownMetric.perAgentId,
                ]),
            }),
            timezone,
            undefined,
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
            expect.objectContaining({
                channels: withDefaultLogicalOperator([
                    drillDownMetric.perChannel,
                ]),
            }),
            timezone,
            undefined,
        )
    })

    it('should be populated with tagId and default dateRange', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: TagsMetric.TicketCount,
            tagId: '123',
            ticketTimeReference: TicketTimeReference.TaggedAt,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            tagsTicketCountDrillDownByReferenceQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            drillDownMetric.tagId,
            statsFilters.period,
            undefined,
            TicketTimeReference.TaggedAt,
        )
    })

    it('should be populated with tagId and dateRange', () => {
        const periodStart = moment()
        const periodEnd = periodStart.clone().add(7, 'days')
        const statsFilters: StatsFilters = {
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
            ticketTimeReference: TicketTimeReference.TaggedAt,
            tagId: '123',
            dateRange: dateRange,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            tagsTicketCountDrillDownByReferenceQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            drillDownMetric.tagId,
            dateRange,
            undefined,
            TicketTimeReference.TaggedAt,
        )
    })

    it('should be populated with channel filter using statsFiltersWithLogicalOperator', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
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
            undefined,
        )
    })

    it('should be populated with agent filter using statsFiltersWithLogicalOperator', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
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
            undefined,
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
            VoiceCallSegment.inboundCalls,
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
        },
    )

    it.each([
        {
            metricName: VoiceMetric.QueueInboundCalls,
            segment: VoiceCallSegment.inboundCalls,
        },
        {
            metricName: VoiceMetric.QueueOutboundCalls,
            segment: VoiceCallSegment.outboundCalls,
        },
        {
            metricName: VoiceMetric.QueueInboundUnansweredCalls,
            segment: VoiceCallSegment.inboundUnansweredCalls,
        },
        {
            metricName: VoiceMetric.QueueInboundMissedCalls,
            segment: VoiceCallSegment.inboundMissedCalls,
        },
        {
            metricName: VoiceMetric.QueueInboundAbandonedCalls,
            segment: VoiceCallSegment.inboundAbandonedCalls,
        },
    ])(
        'should call liveDashboardVoiceCallListQueryFactory for (%d)',
        ({ metricName, segment }) => {
            getDrillDownQuery({ metricName })(statsFilters, segment)

            expect(
                liveDashboardVoiceCallListQueryFactoryMock,
            ).toHaveBeenCalledWith(statsFilters, segment)
        },
    )

    it.each([
        {
            metricName: VoiceMetric.QueueAverageWaitTime,
            drillDownQuery: liveDashboardWaitingTimeCallsListQueryFactoryMock,
            segment: VoiceCallSegment.inboundCalls,
        },
    ])(
        'should call $drillDownQuery for (%s)',
        ({ metricName, drillDownQuery, segment }) => {
            getDrillDownQuery({ metricName })(statsFilters, segment)

            expect(drillDownQuery).toHaveBeenCalledWith(statsFilters, segment)
        },
    )

    it.each([
        {
            metricName: VoiceMetric.QueueAverageTalkTime,
            drillDownQuery: liveDashboardConnectedCallsListQueryFactoryMock,
            segment: undefined,
        },
    ])(
        'should call liveDashboardConnectedCallsListQueryFactoryMock',
        ({ metricName, drillDownQuery }) => {
            getDrillDownQuery({ metricName })(statsFilters, 'timezone')

            expect(drillDownQuery).toHaveBeenCalledWith(statsFilters)
        },
    )

    it('should be populated with shopName and selectedCampaignIds filter', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = convertMetrics[0]

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(campaignSalesDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            drillDownMetric.shopName,
            drillDownMetric.selectedCampaignIds,
            LogicalOperatorEnum.ONE_OF,
            statsFilters,
            timezone,
            undefined,
            'someAbVariant',
        )
    })

    it('should be populated with TagId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
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
            ticketTimeReference: TicketTimeReference.TaggedAt,
            tagId: 'TAG_ID',
        })(statsFilters, timezone)

        expect(
            tagsTicketCountDrillDownByReferenceQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            tagsMetric.tagId,
            statsFilters.period,
            undefined,
            TicketTimeReference.TaggedAt,
        )
    })

    it('should be populated with customFieldId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const customFieldMetric: TicketFieldsMetrics = {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: ['customFieldValue'],
            ticketTimeReference: TicketTimeReference.TaggedAt,
        }

        getDrillDownQuery(customFieldMetric)(statsFilters, timezone)

        expect(
            customFieldsTicketCountPerTicketDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            String(customFieldMetric?.customFieldId),
            customFieldMetric.customFieldValue,
            statsFilters.period,
            undefined,
        )
    })

    it('should be populated with ticketTimeReference', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const customFieldMetric: TicketFieldsMetrics = {
            metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
            customFieldId: 123,
            customFieldValue: ['customFieldValue'],
            ticketTimeReference: TicketTimeReference.CreatedAt,
        }

        getDrillDownQuery(customFieldMetric)(statsFilters, timezone)

        expect(
            customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            String(customFieldMetric?.customFieldId),
            customFieldMetric.customFieldValue,
            statsFilters.period,
            undefined,
        )
    })

    it('should be populated with AiSalesAgentTotalSalesConv', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiSalesAgentMetrics = {
            metricName: AiSalesAgentChart.AiSalesAgentTotalSalesConv,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiSalesAgentTotalSalesConvDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with AiSalesAgentSuccessRate', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiSalesAgentMetrics = {
            metricName: AiSalesAgentChart.AiSalesAgentSuccessRate,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            totalNumberOfAutomatedSalesDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with AiSalesDiscountOffered', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiSalesAgentMetrics = {
            metricName: AiSalesAgentChart.AiSalesDiscountOffered,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            discountCodesOfferedDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with AiSalesAgentTotalNumberOfOrders', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiSalesAgentMetrics = {
            metricName: AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            totalNumberOfOrderDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with AiSalesAgentTotalProductRecommendations', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiSalesAgentMetrics = {
            metricName:
                AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            totalNumberProductRecommendationsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })
})

describe('getDrillDownMetric', () => {
    const voiceAgentsMetricsWithExpectedValues: {
        metricData: DrillDownMetric
        expectedValues: {
            metricTitle: string
            showMetric: boolean
            metricValueFormat: MetricValueFormat | typeof SLA_FORMAT
        }
    }[] = Object.values(VoiceAgentsMetric).map((name) => ({
        metricData: { metricName: name, perAgentId: 123 },
        expectedValues: {
            metricTitle: '',
            showMetric: false,
            metricValueFormat: 'decimal',
        },
    }))

    const testCases: {
        metricData: DrillDownMetric
        expectedValues: {
            metricTitle: string
            showMetric: boolean
            metricValueFormat: MetricValueFormat | typeof SLA_FORMAT
        }
    }[] = [
        {
            metricData: {
                metricName: ProductInsightsTableColumns.NegativeSentiment,
                productId: '123',
            },
            expectedValues: {
                metricTitle:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.NegativeSentiment
                    ].hint.title,
                showMetric: false,
                metricValueFormat:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.NegativeSentiment
                    ].format,
            },
        },
        {
            metricData: {
                metricName: ProductInsightsTableColumns.PositiveSentiment,
                productId: '123',
            },
            expectedValues: {
                metricTitle:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.PositiveSentiment
                    ].hint.title,
                showMetric: false,
                metricValueFormat:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.PositiveSentiment
                    ].format,
            },
        },
        {
            metricData: {
                metricName: ProductInsightsTableColumns.TicketsVolume,
                productId: '123',
            },
            expectedValues: {
                metricTitle:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.TicketsVolume
                    ].hint.title,
                showMetric: false,
                metricValueFormat:
                    ProductInsightsColumnWithDrillDownConfig[
                        ProductInsightsTableColumns.TicketsVolume
                    ].format,
            },
        },
        {
            metricData: {
                metricName: AgentsTableColumn.OneTouchTickets,
                perAgentId: 1,
            },
            expectedValues: {
                metricTitle: TableLabels[AgentsTableColumn.OneTouchTickets],
                showMetric: false,
                metricValueFormat: 'percent',
            },
        },
        {
            metricData: {
                metricName: AgentsTableColumn.ClosedTickets,
                perAgentId: 1,
            },
            expectedValues: {
                metricTitle: TableLabels[AgentsTableColumn.ClosedTickets],
                showMetric: false,
                metricValueFormat: 'integer',
            },
        },
        {
            metricData: {
                metricName: OverviewMetric.MedianResolutionTime,
            },
            expectedValues: {
                metricTitle: MEDIAN_RESOLUTION_TIME_LABEL,
                showMetric: true,
                metricValueFormat: 'duration',
            },
        },
        {
            metricData: {
                metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount,
                customFieldId: 123,
                customFieldValue: ['customFieldValue'],
                ticketTimeReference: TicketTimeReference.TaggedAt,
            },
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        },
        {
            metricData: {
                metricName: SlaMetric.AchievementRate,
            },
            expectedValues: {
                metricTitle: SLA_STATUS_COLUMN_LABEL,
                showMetric: true,
                metricValueFormat: SLA_FORMAT,
            },
        },
        {
            metricData: {
                metricName: ChannelsTableColumns.TicketHandleTime,
                perChannel: 'some-channel',
            },
            expectedValues: {
                metricTitle:
                    ChannelsTableLabels[ChannelsTableColumns.TicketHandleTime],
                showMetric: true,
                metricValueFormat:
                    ChannelColumnConfig[ChannelsTableColumns.TicketHandleTime]
                        .format,
            },
        },
        {
            metricData: {
                metricName: AutoQAAgentsTableColumn.ResolutionCompleteness,
                perAgentId: 456,
            },
            expectedValues: {
                metricTitle:
                    autoQATableLabels[
                        AutoQAAgentsTableColumn.ResolutionCompleteness
                    ],
                showMetric: false,
                metricValueFormat:
                    AutoQAAgentsColumnConfig[
                        AutoQAAgentsTableColumn.ResolutionCompleteness
                    ].format,
            },
        },
        {
            metricData: {
                metricName: AutoQAMetric.ResolutionCompleteness,
            },
            expectedValues: {
                metricTitle:
                    TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
                showMetric: false,
                metricValueFormat:
                    TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                        .metricFormat,
            },
        },
        {
            metricData: {
                metricName: AutoQAMetric.ReviewedClosedTickets,
            },
            expectedValues: {
                metricTitle:
                    TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
                showMetric: false,
                metricValueFormat:
                    TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                        .metricFormat,
            },
        },
        {
            metricData: {
                metricName: SatisfactionMetric.SatisfactionScore,
            },
            expectedValues: {
                metricTitle:
                    SatisfactionTrendCardConfig[
                        SatisfactionMetric.SatisfactionScore
                    ].title,
                showMetric: false,
                metricValueFormat:
                    SatisfactionTrendCardConfig[
                        SatisfactionMetric.SatisfactionScore
                    ].metricFormat,
            },
        },
        {
            metricData: {
                metricName: SatisfactionMetric.ResponseRate,
            },
            expectedValues: {
                metricTitle:
                    SatisfactionTrendCardConfig[SatisfactionMetric.ResponseRate]
                        .title,
                showMetric: false,
                metricValueFormat:
                    SatisfactionTrendCardConfig[SatisfactionMetric.ResponseRate]
                        .metricFormat,
            },
        },
        {
            metricData: {
                metricName: SatisfactionMetric.SurveysSent,
            },
            expectedValues: {
                metricTitle:
                    SatisfactionTrendCardConfig[SatisfactionMetric.SurveysSent]
                        .title,
                showMetric: false,
                metricValueFormat:
                    SatisfactionTrendCardConfig[SatisfactionMetric.SurveysSent]
                        .metricFormat,
            },
        },
        {
            metricData: {
                metricName: SatisfactionMetric.AverageSurveyScore,
            },
            expectedValues: {
                metricTitle: CSAT_SCORE,
                showMetric: true,
                metricValueFormat:
                    SatisfactionTrendCardConfig[
                        SatisfactionMetric.AverageSurveyScore
                    ].metricFormat,
            },
        },
        {
            metricData: {
                metricName:
                    AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
                customFieldId: 789,
                customFieldValue: null,
            },
            expectedValues: {
                metricTitle: CSAT_DRILL_DOWN_LABEL,
                showMetric: true,
                metricValueFormat: 'decimal',
            },
        },
        ...voiceAgentsMetricsWithExpectedValues,
        {
            metricData: {
                metricName: AiSalesAgentChart.AiSalesAgentTotalSalesConv,
            },
            expectedValues: {
                metricTitle: 'Conversations',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        },
    ]

    it.each(testCases)(
        'getDrillDownMetricColumn',
        ({ metricData, expectedValues }) => {
            expect(getDrillDownMetricColumn(metricData)).toEqual(expectedValues)
        },
    )
})
