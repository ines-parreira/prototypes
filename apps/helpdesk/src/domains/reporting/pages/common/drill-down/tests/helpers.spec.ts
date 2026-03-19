import { assumeMock } from '@repo/testing'
import moment from 'moment'

import {
    aiJourneyClickThroughRateDrillDownQueryFactory,
    aiJourneyOptOutAfterReplyDrillDownQueryFactory,
    aiJourneyOptOutRateDrillDownQueryFactory,
    aiJourneyOrdersDrillDownQueryFactory,
    aiJourneyResponseRateDrillDownQueryFactory,
    aiJourneyTotalConversationsDrillDownQueryFactory,
    aiJourneyTotalOptOutsDrillDownQueryFactory,
    aiJourneyTotalRepliesDrillDownQueryFactory,
} from 'AIJourney/queries/aiJourneyDrillDownQueries'
import type { AIJourneyMetrics } from 'AIJourney/types/AIJourneyTypes'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    discountCodesOfferedDrillDownQueryFactory,
    successRateV2DrillDownQueryFactory,
    totalNumberOfAutomatedSalesDrillDownQueryFactory,
    totalNumberOfOrderDrillDownQueryFactory,
    totalNumberOfSalesOpportunityConvFromAIAgentDrillDownQueryFactory,
    totalNumberProductRecommendationsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import {
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
    shoppingAssistantAutomatedInteractionsDrillDownQueryFactory,
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories'
import {
    knowledgeCSATDrillDownQueryFactory,
    knowledgeHandoverTicketsDrillDownQueryFactory,
    knowledgeTicketsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import {
    customFieldsTicketCountOnCreatedDatetimePerTicketDrillDownQueryFactory,
    customFieldsTicketCountPerTicketDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { tagsTicketCountDrillDownByReferenceQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { returnMentionsPerProductDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { sentimentsTicketCountPerProductDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import {
    ticketCountForIntentAndProductDrillDownQueryFactory,
    ticketCountForIntentDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import { ticketCountForProductDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import {
    connectedCallsListQueryFactory,
    liveDashboardConnectedCallsListQueryFactory,
    liveDashBoardVoiceCallListQueryFactory,
    liveDashboardWaitingTimeCallsListQueryFactory,
    voiceCallListQueryFactory,
    waitingTimeCallsListQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    declinedVoiceCallsPerAgentQueryFactory,
    transferredInboundVoiceCallsPerAgentQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceEventsByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    Sentiment,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { AiSalesAgentChart } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { MetricsConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import {
    getDrillDownMetricColumn,
    getDrillDownQuery,
} from 'domains/reporting/pages/common/drill-down/helpers'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { campaignSalesDrillDownQueryFactory } from 'domains/reporting/pages/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {
    CSAT_SCORE,
    SatisfactionMetricConfig as SatisfactionTrendCardConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import {
    SLA_FORMAT,
    SLA_STATUS_COLUMN_LABEL,
} from 'domains/reporting/pages/sla/SlaConfig'
import { TableLabels } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels as autoQATableLabels,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { ProductInsightsColumnWithDrillDownConfig } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import { MEDIAN_RESOLUTION_TIME_LABEL } from 'domains/reporting/services/constants'
import type {
    AgentsMetrics,
    AiAgentMetrics,
    AiSalesAgentMetrics,
    ChannelsMetrics,
    ConvertMetrics,
    DrillDownMetric,
    SatisfactionAverageSurveyScoreMetrics,
    SatisfactionMetrics,
    SentimentForProductMetrics,
    SlaMetrics,
    TagsFieldsMetrics,
    TicketFieldsMetrics,
    VoiceOfCustomerMetrics,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import {
    AgentsTableColumn,
    AIInsightsMetric,
    AutoQAMetric,
    ChannelsTableColumns,
    ConvertMetric,
    KnowledgeMetric,
    ProductInsightsTableColumns,
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'domains/reporting/state/ui/stats/types'
import { CSAT_DRILL_DOWN_LABEL } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'

jest.mock(
    'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts',
)
const ticketCountForProductDrillDownQueryFactoryMock = assumeMock(
    ticketCountForProductDrillDownQueryFactory,
)

jest.mock(
    'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct',
)
const sentimentsTicketCountPerProductDrillDownQueryFactoryMock = assumeMock(
    sentimentsTicketCountPerProductDrillDownQueryFactory,
)

jest.mock(
    'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent',
)
const ticketCountForIntentAndProductDrillDownQueryFactoryMock = assumeMock(
    ticketCountForIntentAndProductDrillDownQueryFactory,
)
const ticketCountForIntentDrillDownQueryFactoryMock = assumeMock(
    ticketCountForIntentDrillDownQueryFactory,
)

jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')
jest.mock('domains/reporting/models/queryFactories/voice/voiceEventsByAgent')
jest.mock(
    'domains/reporting/pages/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory',
)
jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount',
)
jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount',
)
jest.mock('domains/reporting/models/queryFactories/ai-sales-agent/metrics')
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
)
jest.mock('AIJourney/queries/aiJourneyDrillDownQueries')

jest.mock(
    'domains/reporting/models/queryFactories/support-performance/customerSatisfaction',
)
const customerSatisfactionQueryFactoryMock = assumeMock(
    customerSatisfactionMetricDrillDownQueryFactory,
)
jest.mock(
    'domains/reporting/models/queryFactories/ticket-insights/tagsTicketCount',
)
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
const voiceEventsByAgentVoiceCallListQueryFactoryMock = assumeMock(
    transferredInboundVoiceCallsPerAgentQueryFactory,
)
const declinedVoiceCallsPerAgentQueryFactoryMock = assumeMock(
    declinedVoiceCallsPerAgentQueryFactory,
)
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
const successRateV2DrillDownQueryFactoryMock = assumeMock(
    successRateV2DrillDownQueryFactory,
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
jest.mock(
    'domains/reporting/models/queryFactories/voice-of-customer/returnMentionsPerProduct',
)
const returnMentionsPerProductDrillDownQueryFactoryMock = assumeMock(
    returnMentionsPerProductDrillDownQueryFactory,
)

jest.mock(
    'domains/reporting/models/queryFactories/automate_v2/aiAgentDrillDownQueryFactories',
)
const allAgentsAutomatedInteractionsDrillDownQueryFactoryMock = assumeMock(
    allAgentsAutomatedInteractionsDrillDownQueryFactory,
)
const shoppingAssistantAutomatedInteractionsDrillDownQueryFactoryMock =
    assumeMock(shoppingAssistantAutomatedInteractionsDrillDownQueryFactory)
const supportAgentAutomatedInteractionsDrillDownQueryFactoryMock = assumeMock(
    supportAgentAutomatedInteractionsDrillDownQueryFactory,
)

jest.mock('AIJourney/queries/aiJourneyDrillDownQueries')

const aiJourneyOrdersDrillDownQueryFactoryMock = assumeMock(
    aiJourneyOrdersDrillDownQueryFactory,
)
const aiJourneyResponseRateDrillDownQueryFactoryMock = assumeMock(
    aiJourneyResponseRateDrillDownQueryFactory,
)
const aiJourneyOptOutRateDrillDownQueryFactoryMock = assumeMock(
    aiJourneyOptOutRateDrillDownQueryFactory,
)
const aiJourneyClickThroughRateDrillDownQueryFactoryMock = assumeMock(
    aiJourneyClickThroughRateDrillDownQueryFactory,
)
const aiJourneyTotalConversationsDrillDownQueryFactoryMock = assumeMock(
    aiJourneyTotalConversationsDrillDownQueryFactory,
)
const aiJourneyTotalOptOutsDrillDownQueryFactoryMock = assumeMock(
    aiJourneyTotalOptOutsDrillDownQueryFactory,
)
const aiJourneyTotalRepliesDrillDownQueryFactoryMock = assumeMock(
    aiJourneyTotalRepliesDrillDownQueryFactory,
)
const aiJourneyOptOutAfterReplyDrillDownQueryFactoryMock = assumeMock(
    aiJourneyOptOutAfterReplyDrillDownQueryFactory,
)

const knowledgeTicketsDrillDownQueryFactoryMock = assumeMock(
    knowledgeTicketsDrillDownQueryFactory,
)
const knowledgeHandoverTicketsDrillDownQueryFactoryMock = assumeMock(
    knowledgeHandoverTicketsDrillDownQueryFactory,
)
const knowledgeCSATDrillDownQueryFactoryMock = assumeMock(
    knowledgeCSATDrillDownQueryFactory,
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
            sentimentCustomFieldId: 456,
            sentiment: Sentiment.Negative,
        },
        {
            metricName: ProductInsightsTableColumns.PositiveSentiment,
            productId: '123',
            sentimentCustomFieldId: 456,
            sentiment: Sentiment.Positive,
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
        {
            metricName: OverviewMetric.MedianFirstResponseTime,
        },
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
            metricName: VoiceMetric.QueueCallsAchievementRate,
        },
        {
            metricName: VoiceMetric.VoiceCallsAchievementRate,
        },
        {
            metricName: VoiceMetric.VoiceCallsBreachedRate,
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
        {
            metricName: VoiceAgentsMetric.AgentInboundTransferredCalls,
            perAgentId: 123,
        },
        {
            metricName: VoiceAgentsMetric.AgentInboundDeclinedCalls,
            perAgentId: 123,
        },
    ]

    const aiInsightsMetrics: DrillDownMetric[] = [
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
            perAgentId: 1,
            intentFieldId: 1,
            outcomeFieldId: 2,
            intentFieldValues: undefined,
            integrationIds: ['chat::123'],
        },
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction,
            perAgentId: 1,
            intentFieldId: 1,
            outcomeFieldId: 2,
            intentFieldValues: ['value'],
            integrationIds: ['chat::123'],
        },
        {
            metricName: AIInsightsMetric.TicketDrillDownPerCoverageRate,
            outcomeFieldId: 2,
            intentFieldId: 1,
            integrationIds: ['chat::123'],
        },
        {
            metricName: AIInsightsMetric.TicketCustomFieldsTicketCount,
            outcomeFieldId: 2,
            intentFieldId: 1,
            intentFieldValues: ['value'],
            integrationIds: ['chat::123'],
        },
    ]

    const voiceOfCustomerMetrics: DrillDownMetric[] = [
        {
            metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
            intentCustomFieldId: 123,
            intentCustomFieldValueString: 'product::return',
            productId: '456',
        },
        {
            metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
            intentCustomFieldId: 123,
            intentCustomFieldValueString: 'product::return',
        },
        {
            metricName: ProductsPerTicketColumn.TicketVolume,
            productId: '456',
        },
    ]

    const aiJourneyMetrics: AIJourneyMetrics[] = [
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
            metricName: AIJourneyMetric.ResponseRate,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
            metricName: AIJourneyMetric.OptOutRate,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate]
                .title,
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalConversations]
                .title,
            metricName: AIJourneyMetric.TotalConversations,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOptOuts].title,
            metricName: AIJourneyMetric.TotalOptOuts,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalReplies].title,
            metricName: AIJourneyMetric.TotalReplies,
            integrationId: '123',
        },
        {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutAfterReply]
                .title,
            metricName: AIJourneyMetric.OptOutAfterReply,
            integrationId: '123',
        },
    ]

    const knowledgeMetrics: DrillDownMetric[] = [
        {
            metricName: KnowledgeMetric.Tickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2025-01-15T00:00:00.000',
                end_datetime: '2025-01-20T23:59:59.000',
            },
        },
        {
            metricName: KnowledgeMetric.HandoverTickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2025-01-15T00:00:00.000',
                end_datetime: '2025-01-20T23:59:59.000',
            },
            outcomeCustomFieldId: 777,
        },
        {
            metricName: KnowledgeMetric.CSAT,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange: {
                start_datetime: '2025-01-15T00:00:00.000',
                end_datetime: '2025-01-20T23:59:59.000',
            },
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
        ...voiceOfCustomerMetrics,
        ...aiJourneyMetrics,
        ...knowledgeMetrics,
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

    it('should always use ONE_OF logical operator for channel filter regardless of statsFilters operator', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
            channels: withDefaultLogicalOperator(
                ['email'],
                LogicalOperatorEnum.NOT_ONE_OF,
            ),
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

    it('should call voiceEventsByAgentVoiceCallListQueryFactory for AgentInboundTransferredCalls', () => {
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: VoiceAgentsMetric.AgentInboundTransferredCalls,
            perAgentId: 123,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            voiceEventsByAgentVoiceCallListQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                agents: withDefaultLogicalOperator([123]),
            }),
            timezone,
        )
    })

    it('should call declinedVoiceCallsPerAgentQueryFactory for AgentInboundDeclinedCalls', () => {
        const timezone = 'someTimeZone'
        const drillDownMetric: DrillDownMetric = {
            metricName: VoiceAgentsMetric.AgentInboundDeclinedCalls,
            perAgentId: 123,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(declinedVoiceCallsPerAgentQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                agents: withDefaultLogicalOperator([123]),
            }),
            timezone,
        )
    })

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
            customFieldMetric.customFieldId,
            customFieldMetric.customFieldValue,
            statsFilters.period,
            undefined,
        )
    })

    it('should be populated with sentimentCustomFieldId, sentiment, and productId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const metricData: SentimentForProductMetrics = {
            metricName: ProductInsightsTableColumns.PositiveSentiment,
            sentimentCustomFieldId: 123,
            sentiment: Sentiment.Positive,
            productId: '456',
        }

        const queryFactory = getDrillDownQuery(metricData)

        queryFactory(statsFilters, timezone)

        expect(
            sentimentsTicketCountPerProductDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            metricData.sentimentCustomFieldId,
            metricData.sentiment,
            metricData.productId,
            undefined,
        )
    })

    it('should be populated with sentimentCustomFieldId, sentiment, and productId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const metricData: SentimentForProductMetrics = {
            metricName: ProductInsightsTableColumns.NegativeSentiment,
            sentimentCustomFieldId: 123,
            sentiment: Sentiment.Negative,
            productId: '456',
        }

        const queryFactory = getDrillDownQuery(metricData)

        queryFactory(statsFilters, timezone)

        expect(
            sentimentsTicketCountPerProductDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            metricData.sentimentCustomFieldId,
            metricData.sentiment,
            metricData.productId,
            undefined,
        )
    })

    it.each([
        [ProductInsightsTableColumns.TicketsVolume],
        [ProductsPerTicketColumn.TicketVolume],
    ])('should be populated with productId', (metricName: any) => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const metricData: DrillDownMetric = {
            metricName,
            productId: '456',
        }

        const queryFactory = getDrillDownQuery(metricData)

        queryFactory(statsFilters, timezone)

        expect(
            ticketCountForProductDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            metricData.productId,
            undefined,
        )
    })

    it('should be populated with sentimentCustomFieldId, sentiment, and productId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const metricData: DrillDownMetric = {
            metricName: ProductInsightsTableColumns.ReturnMentions,
            productId: '456',
            intentCustomFieldId: 123,
        }

        const queryFactory = getDrillDownQuery(metricData)

        queryFactory(statsFilters, timezone)

        expect(
            returnMentionsPerProductDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            metricData.intentCustomFieldId,
            metricData.productId,
            undefined,
        )
    })

    it('should be populated with intentCustomFieldId, intentCustomFieldValueString and productId', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const customFieldMetric: VoiceOfCustomerMetrics = {
            metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
            intentCustomFieldId: 123,
            intentCustomFieldValueString: 'product::return',
            productId: '456',
        }

        getDrillDownQuery(customFieldMetric)(statsFilters, timezone)

        expect(
            ticketCountForIntentAndProductDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            customFieldMetric.intentCustomFieldId,
            customFieldMetric.intentCustomFieldValueString,
            customFieldMetric.productId,
            undefined,
        )
    })

    it('should be populated with intentCustomFieldId, intentCustomFieldValueString', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'

        const customFieldMetric: VoiceOfCustomerMetrics = {
            metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
            intentCustomFieldId: 123,
            intentCustomFieldValueString: 'product::return',
        }

        getDrillDownQuery(customFieldMetric)(statsFilters, timezone)

        expect(
            ticketCountForIntentDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            customFieldMetric.intentCustomFieldId,
            customFieldMetric.intentCustomFieldValueString,
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
            customFieldMetric.customFieldId,
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

    it('should be populated with ShoppingAssistantSuccessRateCard', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AiAgentMetrics = {
            metricName:
                AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(successRateV2DrillDownQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
        )
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
        ).toHaveBeenCalledWith(statsFilters, timezone, undefined, undefined)
    })

    it('should be populated with AiSalesAgentTotalProductRecommendations with productId', () => {
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
            productId: '456',
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            totalNumberProductRecommendationsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, undefined, '456')
    })

    it('should be populated with AIJourneyMetric.TotalOrders', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders].title,
            metricName: AIJourneyMetric.TotalOrders,
            integrationId: '123',
            journeyIds: ['test-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(aiJourneyOrdersDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            '123',
            undefined,
            ['test-journey-id'],
        )
    })

    it('should be populated with AIJourneyMetric.ResponseRate', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate].title,
            metricName: AIJourneyMetric.ResponseRate,
            integrationId: '456',
            journeyIds: ['test-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyResponseRateDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '456', undefined, [
            'test-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.OptOutRate', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate].title,
            metricName: AIJourneyMetric.OptOutRate,
            integrationId: '456',
            journeyIds: ['test-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyOptOutRateDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '456', undefined, [
            'test-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.ClickThroughRate', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate]
                .title,
            metricName: AIJourneyMetric.ClickThroughRate,
            integrationId: '789',
            journeyIds: ['click-through-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyClickThroughRateDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '789', undefined, [
            'click-through-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.TotalConversations', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalConversations]
                .title,
            metricName: AIJourneyMetric.TotalConversations,
            integrationId: '123',
            journeyIds: ['total-conversations-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyTotalConversationsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '123', undefined, [
            'total-conversations-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.TotalOptOuts', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalOptOuts].title,
            metricName: AIJourneyMetric.TotalOptOuts,
            integrationId: '456',
            journeyIds: ['total-opt-outs-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyTotalOptOutsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '456', undefined, [
            'total-opt-outs-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.TotalReplies', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.TotalReplies].title,
            metricName: AIJourneyMetric.TotalReplies,
            integrationId: '789',
            journeyIds: ['total-replies-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyTotalRepliesDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '789', undefined, [
            'total-replies-journey-id',
        ])
    })

    it('should be populated with AIJourneyMetric.OptOutAfterReply', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric: AIJourneyMetrics = {
            title: AIJourneyMetricsConfig[AIJourneyMetric.OptOutAfterReply]
                .title,
            metricName: AIJourneyMetric.OptOutAfterReply,
            integrationId: '321',
            journeyIds: ['opt-out-after-reply-journey-id'],
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            aiJourneyOptOutAfterReplyDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone, '321', undefined, [
            'opt-out-after-reply-journey-id',
        ])
    })

    it('should be populated with KnowledgeMetric.Tickets', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const dateRange = {
            start_datetime: '2025-01-15T00:00:00.000',
            end_datetime: '2025-01-20T23:59:59.000',
        }
        const drillDownMetric = {
            metricName: KnowledgeMetric.Tickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(knowledgeTicketsDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                period: dateRange,
                stores: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [789],
                },
            }),
            timezone,
            123,
            456,
        )
    })

    it('should be populated with KnowledgeMetric.HandoverTickets', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const dateRange = {
            start_datetime: '2025-01-15T00:00:00.000',
            end_datetime: '2025-01-20T23:59:59.000',
        }
        const outcomeCustomFieldId = 777
        const drillDownMetric = {
            metricName: KnowledgeMetric.HandoverTickets,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange,
            outcomeCustomFieldId,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            knowledgeHandoverTicketsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                period: dateRange,
                stores: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [789],
                },
            }),
            timezone,
            123,
            456,
        )
    })

    it('should be populated with KnowledgeMetric.CSAT', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const dateRange = {
            start_datetime: '2025-01-15T00:00:00.000',
            end_datetime: '2025-01-20T23:59:59.000',
        }
        const drillDownMetric = {
            metricName: KnowledgeMetric.CSAT,
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            shopIntegrationId: 789,
            dateRange,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(knowledgeCSATDrillDownQueryFactoryMock).toHaveBeenCalledWith(
            expect.objectContaining({
                period: dateRange,
                stores: {
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [789],
                },
            }),
            timezone,
            123,
            456,
        )
    })

    it('should be populated with automated_interactions_card', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = {
            metricName: AiAgentDrillDownMetricName.AutomatedInteractionsCard,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            allAgentsAutomatedInteractionsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with resolved_interactions_card', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = {
            metricName: AiAgentDrillDownMetricName.ResolvedInteractionsCard,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            shoppingAssistantAutomatedInteractionsDrillDownQueryFactoryMock,
        ).toHaveBeenCalledWith(statsFilters, timezone)
    })

    it('should be populated with support_interactions_card', () => {
        const periodStart = moment()
        const periodEnd = periodStart.add(7, 'days')
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: periodEnd.toISOString(),
                start_datetime: periodStart.toISOString(),
            },
        }
        const timezone = 'someTimeZone'
        const drillDownMetric = {
            metricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
        }

        getDrillDownQuery(drillDownMetric)(statsFilters, timezone)

        expect(
            supportAgentAutomatedInteractionsDrillDownQueryFactoryMock,
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
                sentimentCustomFieldId: 456,
                sentiment: Sentiment.Negative,
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
                sentimentCustomFieldId: 456,
                sentiment: Sentiment.Positive,
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
                metricName: ProductsPerTicketColumn.TicketVolume,
                productId: '456',
            },
            expectedValues: {
                metricTitle: '',
                metricValueFormat: 'integer',
                showMetric: false,
            },
        },
        {
            metricData: {
                metricName: ProductsPerTicketColumn.TicketVolume,
                productId: '456',
                title: 'some title',
            },
            expectedValues: {
                metricTitle: 'some title',
                metricValueFormat: 'integer',
                showMetric: false,
            },
        },
        {
            metricData: {
                metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
                intentCustomFieldId: 123,
                intentCustomFieldValueString: 'product::return',
                productId: '456',
            },
            expectedValues: {
                metricTitle: 'Intent per product',
                metricValueFormat: 'decimal',
                showMetric: false,
            },
        },
        {
            metricData: {
                metricName:
                    VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
                intentCustomFieldId: 123,
                intentCustomFieldValueString: 'product::return',
            },
            expectedValues: {
                metricTitle: 'Intent per products',
                metricValueFormat: 'decimal',
                showMetric: false,
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
                intentFieldId: 1,
                intentFieldValues: null,
                outcomeFieldId: 2,
                perAgentId: 1,
                integrationIds: ['chat::123'],
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
        {
            metricData: {
                metricName:
                    AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
                title: 'Success rate',
            } as AiAgentMetrics,
            expectedValues: {
                metricTitle: 'Success rate',
                showMetric: false,
                metricValueFormat: 'decimal-to-percent',
            },
        },
        {
            metricData: {
                metricName:
                    AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard,
            } as AiAgentMetrics,
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal-to-percent',
            },
        },
        {
            metricData: {
                metricName:
                    AiAgentDrillDownMetricName.AutomatedInteractionsCard,
            },
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        },
        {
            metricData: {
                metricName: AiAgentDrillDownMetricName.ResolvedInteractionsCard,
            },
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        },
        {
            metricData: {
                metricName: AiAgentDrillDownMetricName.SupportInteractionsCard,
            },
            expectedValues: {
                metricTitle: '',
                showMetric: false,
                metricValueFormat: 'decimal',
            },
        },
    ]

    it.each(testCases)(
        'getDrillDownMetricColumn',
        ({ metricData, expectedValues }) => {
            expect(
                getDrillDownMetricColumn(
                    metricData,
                    MetricsConfig[metricData.metricName].showMetric,
                ),
            ).toEqual(expectedValues)
        },
    )
})
