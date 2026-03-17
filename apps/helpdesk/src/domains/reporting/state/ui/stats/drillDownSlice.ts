import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { AIJourneyMetrics } from 'AIJourney/types/AIJourneyTypes'
import { appQueryClient } from 'api/queryClient'
import { reportQueryErrorToSentry } from 'domains/reporting/models/resources'
import type {
    Sentiment,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import type { AiAgentDrillDownMetrics } from 'domains/reporting/pages/automate/aiAgent/AiAgentDrillDownConfig'
import type { AiSalesAgentDrillDownMetrics } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { AutoQAAgentsTableColumn } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import type { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { VoiceOfCustomerMetricWithDrillDown } from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'
import type { ProductsPerTicketColumn } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import type {
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
import { createJob } from 'models/job/resources'
import type {
    ConvertJobContext,
    DrillDownReportingQuery,
    Job,
    JobContext,
} from 'models/job/types'
import { JobType } from 'models/job/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'

type CommonMetrics = {
    title?: string
}

type PerformanceOverviewMetrics = (
    | {
          metricName:
              | OverviewMetric.OpenTickets
              | OverviewMetric.TicketsClosed
              | OverviewMetric.TicketsCreated
              | OverviewMetric.TicketsReplied
              | OverviewMetric.MessagesSent
              | OverviewMetric.MessagesReceived
              | OverviewMetric.MessagesPerTicket
              | OverviewMetric.MedianResolutionTime
              | OverviewMetric.MedianResponseTime
              | OverviewMetric.HumanResponseTimeAfterAiHandoff
              | OverviewMetric.CustomerSatisfaction
              | OverviewMetric.OneTouchTickets
              | OverviewMetric.ZeroTouchTickets
              | OverviewMetric.TicketHandleTime
      }
    | {
          metricName: OverviewMetric.MedianFirstResponseTime
      }
) &
    CommonMetrics

export type AgentMetricColumn =
    | AgentsTableColumn.CustomerSatisfaction
    | AgentsTableColumn.MedianFirstResponseTime
    | AgentsTableColumn.HumanResponseTimeAfterAiHandoff
    | AgentsTableColumn.MedianResolutionTime
    | AgentsTableColumn.MedianResponseTime
    | AgentsTableColumn.MessagesSent
    | AgentsTableColumn.MessagesReceived
    | AgentsTableColumn.PercentageOfClosedTickets
    | AgentsTableColumn.ClosedTickets
    | AgentsTableColumn.RepliedTickets
    | AgentsTableColumn.OneTouchTickets
    | AgentsTableColumn.ZeroTouchTickets
    | AgentsTableColumn.RepliedTicketsPerHour
    | AgentsTableColumn.ClosedTicketsPerHour
    | AgentsTableColumn.TicketHandleTime

export type AgentsMetrics = (
    | {
          metricName: Exclude<
              AgentMetricColumn,
              AgentsTableColumn.MedianFirstResponseTime
          >
          perAgentId: number
      }
    | {
          metricName: AgentsTableColumn.MedianFirstResponseTime
          perAgentId: number
      }
) &
    CommonMetrics

export type ProductMetricColumn =
    | ProductInsightsTableColumns.NegativeSentiment
    | ProductInsightsTableColumns.PositiveSentiment
    | ProductInsightsTableColumns.TicketsVolume

export type SentimentForProductMetrics = {
    metricName:
        | ProductInsightsTableColumns.NegativeSentiment
        | ProductInsightsTableColumns.PositiveSentiment
    productId: string
    sentimentCustomFieldId: number
    sentiment: Sentiment
}

export type ReturnMentionsMetric = {
    metricName: ProductInsightsTableColumns.ReturnMentions
    productId: string
    intentCustomFieldId: number
}

export type TicketVolumeMetrics = {
    metricName:
        | ProductInsightsTableColumns.TicketsVolume
        | ProductsPerTicketColumn.TicketVolume
    productId: string
}

export type ProductMetrics = (
    | TicketVolumeMetrics
    | SentimentForProductMetrics
    | ReturnMentionsMetric
) &
    CommonMetrics

export type TicketsPerIntentMetrics = {
    metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProducts
    intentCustomFieldId: number
    intentCustomFieldValueString: string
} & CommonMetrics

export type TicketsPerProductPerIntentMetrics = {
    metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct
    intentCustomFieldId: number
    intentCustomFieldValueString: string
    productId: string
} & CommonMetrics

export type KnowledgeMetrics = {
    metricName: KnowledgeMetric
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
} & CommonMetrics

export type VoiceOfCustomerMetrics = (
    | TicketsPerProductPerIntentMetrics
    | TicketsPerIntentMetrics
) &
    CommonMetrics

export type AiSalesAgentMetrics = {
    metricName: AiSalesAgentDrillDownMetrics
    productId?: string
} & CommonMetrics

export type AiAgentMetrics = {
    metricName: AiAgentDrillDownMetrics
} & CommonMetrics

export type AutoQAMetrics = {
    metricName: AutoQAMetric
} & CommonMetrics

export type AutoQAAgentMetric =
    | AutoQAAgentsTableColumn.ResolutionCompleteness
    | AutoQAAgentsTableColumn.ReviewedClosedTickets
    | AutoQAAgentsTableColumn.CommunicationSkills
    | AutoQAAgentsTableColumn.LanguageProficiency
    | AutoQAAgentsTableColumn.Accuracy
    | AutoQAAgentsTableColumn.Efficiency
    | AutoQAAgentsTableColumn.InternalCompliance
    | AutoQAAgentsTableColumn.BrandVoice

export type AutoQAAgentMetrics = {
    metricName: AutoQAAgentMetric
    perAgentId: number
} & CommonMetrics

type ChannelMetricColumn =
    | ChannelsTableColumns.TicketsCreated
    | ChannelsTableColumns.CreatedTicketsPercentage
    | ChannelsTableColumns.ClosedTickets
    | ChannelsTableColumns.TicketHandleTime
    | ChannelsTableColumns.FirstResponseTime
    | ChannelsTableColumns.MedianResponseTime
    | ChannelsTableColumns.HumanResponseTimeAfterAiHandoff
    | ChannelsTableColumns.MedianResolutionTime
    | ChannelsTableColumns.TicketsReplied
    | ChannelsTableColumns.MessagesSent
    | ChannelsTableColumns.MessagesReceived
    | ChannelsTableColumns.CustomerSatisfaction

export type ChannelsMetrics = (
    | {
          metricName: Exclude<
              ChannelMetricColumn,
              ChannelsTableColumns.FirstResponseTime
          >
          perChannel: string
      }
    | {
          metricName: ChannelsTableColumns.FirstResponseTime
          perChannel: string
      }
) &
    CommonMetrics

export type TicketFieldsMetrics = {
    metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount
    ticketTimeReference: TicketTimeReference
    customFieldId: number
    customFieldValue: string[] | null
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
} & CommonMetrics

export type AIInsightsMetrics =
    | AIInsightsCoverageRateMetrics
    | AIInsightsCustomFieldsTicketCountMetrics
    | AIInsightsCustomerSatisfactionDrillDownMetric

export type AIInsightsCustomFieldsTicketCountMetrics = {
    metricName: AIInsightsMetric.TicketCustomFieldsTicketCount
    outcomeFieldId: number
    intentFieldValues: string[]
    intentFieldId: number
    integrationIds: string[]
} & CommonMetrics

export type AIInsightsCoverageRateMetrics = {
    metricName: AIInsightsMetric.TicketDrillDownPerCoverageRate
    outcomeFieldId: number
    intentFieldId: number
    integrationIds: string[]
} & CommonMetrics

export type AIInsightsCustomerSatisfactionDrillDownMetric = {
    metricName: AIInsightsMetric.TicketDrillDownPerCustomerSatisfaction
    perAgentId: number
    outcomeFieldId: number
    intentFieldId: number
    intentFieldValues?: string[] | null
    integrationIds: string[]
} & CommonMetrics

export type TagsFieldsMetrics = {
    metricName: TagsMetric.TicketCount
    ticketTimeReference: TicketTimeReference
    tagId: string
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
} & CommonMetrics

export type SatisfactionMetrics = {
    metricName: SatisfactionMetric
} & CommonMetrics

export type SatisfactionAverageSurveyScoreMetrics = {
    metricName: SatisfactionAverageSurveyScoreMetric
} & CommonMetrics

export type SlaMetrics = {
    metricName: SlaMetric
} & CommonMetrics

export type ConvertMetrics = {
    metricName: ConvertMetric
    shopName: string
    selectedCampaignIds: string[]
    abVariant?: string
    context: ConvertJobContext
    campaignsOperator: LogicalOperatorEnum
} & CommonMetrics

export type VoiceMetrics = {
    metricName: VoiceMetric
} & CommonMetrics

export type VoiceAgentsMetrics = {
    metricName: VoiceAgentsMetric
    perAgentId: number
} & CommonMetrics

export type DrillDownMetric =
    | AgentsMetrics
    | AutoQAMetrics
    | AutoQAAgentMetrics
    | AIInsightsMetrics
    | ChannelsMetrics
    | PerformanceOverviewMetrics
    | TicketFieldsMetrics
    | SatisfactionMetrics
    | SatisfactionAverageSurveyScoreMetrics
    | SlaMetrics
    | ConvertMetrics
    | VoiceMetrics
    | VoiceAgentsMetrics
    | TagsFieldsMetrics
    | AiSalesAgentMetrics
    | AiAgentMetrics
    | ProductMetrics
    | VoiceOfCustomerMetrics
    | AIJourneyMetrics
    | KnowledgeMetrics

export type DrillDownState = {
    isOpen: boolean
    currentPage: number
    metricData: DrillDownMetric | null
    export: {
        isLoading: boolean
        isError: boolean
        isRequested: boolean
    }
}

export const initialState: DrillDownState = {
    isOpen: false,
    currentPage: 1,
    metricData: null,
    export: {
        isLoading: false,
        isError: false,
        isRequested: false,
    },
}

export const EXPORT_DRILL_DOWN_JOB_ACTION = 'exportDrillDownJob'

export type CreateExportDrillDownJobParams = {
    query: DrillDownReportingQuery
    jobType: JobType
    context?: JobContext
}

export const createExportDrillDownJob = createAsyncThunk<
    Job,
    CreateExportDrillDownJobParams,
    { dispatch: StoreDispatch; state: RootState }
>(
    EXPORT_DRILL_DOWN_JOB_ACTION,
    async (
        { query, jobType, context },
        { dispatch, getState, rejectWithValue },
    ) => {
        const currentUser = getCurrentUser(getState())
        const currentUserEmail = String(currentUser.get('email'))
        const { metricName, ...restQuery } = query
        const drillDownMetricName = `${metricName}_drill_down_export`
        try {
            const response = await createJob({
                type: jobType,
                params: {
                    reporting_query: restQuery,
                    metric_name: drillDownMetricName,
                    context: context,
                },
            })

            void dispatch(notifyAboutExportSuccess(jobType, currentUserEmail))

            return response
        } catch (error) {
            reportQueryErrorToSentry(error, {
                query: JSON.stringify(query),
                metricName: drillDownMetricName,
            })
            return rejectWithValue(error)
        } finally {
            void appQueryClient.invalidateQueries({
                queryKey: queryKeys['jobs']['listJobs'](),
            })
        }
    },
)

export const drillDownSlice = createSlice({
    name: 'drillDown',
    initialState,
    reducers: {
        setMetricData(state, action: PayloadAction<DrillDownMetric | null>) {
            state.metricData = action.payload
            state.isOpen = true
        },
        setCurrentPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload
        },
        closeDrillDownModal(state) {
            state.isOpen = false
            state.export = initialState.export
            state.currentPage = initialState.currentPage
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createExportDrillDownJob.pending, (state) => {
            state.export.isLoading = true
            state.export.isRequested = true
        })
        builder.addCase(createExportDrillDownJob.fulfilled, (state) => {
            state.export.isLoading = false
            state.export.isError = false
        })
        builder.addCase(createExportDrillDownJob.rejected, (state) => {
            state.export.isLoading = false
            state.export.isError = true
        })
    },
})

export const { closeDrillDownModal, setMetricData, setCurrentPage } =
    drillDownSlice.actions

export const getDrillDownModalState = (state: RootState) =>
    state.ui.stats[drillDownSlice.name].isOpen

export const getDrillDownCurrentPage = (state: RootState) =>
    state.ui.stats[drillDownSlice.name].currentPage

export const getDrillDownExport = (state: RootState) =>
    state.ui.stats[drillDownSlice.name].export

export const getDrillDownMetric = (state: RootState) =>
    state.ui.stats[drillDownSlice.name].metricData

const getConfirmationText = (jobType: JobType) => {
    switch (jobType) {
        case JobType.ExportConvertCampaignSalesDrilldown:
            return 'All orders will be exported.'
        default:
            return 'All tickets will be exported.'
    }
}

export const notifyAboutExportSuccess = (
    jobType: JobType,
    currentUserEmail: string,
) => {
    const confirmationText = getConfirmationText(jobType)

    return notify({
        message: `${confirmationText} You will receive the download link via email at <strong>${currentUserEmail}</strong> once the export is done.`,
        allowHTML: true,
        status: NotificationStatus.Success,
    })
}
