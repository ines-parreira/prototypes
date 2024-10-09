import {queryKeys} from '@gorgias/api-queries'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {appQueryClient} from 'api/queryClient'
import {createJob} from 'models/job/resources'
import {
    ConvertJobContext,
    DrillDownReportingQuery,
    Job,
    JobContext,
    JobType,
} from 'models/job/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {SLA_STATUS_COLUMN_LABEL} from 'pages/stats/sla/SlaConfig'
import {
    AgentsColumnConfig,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    ChannelColumnConfig,
    ChannelsTableColumns,
    ChannelsTableLabels,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {OverviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'
import {
    AgentsTableColumn,
    AutoQAMetric,
    ConvertMetric,
    OverviewMetric,
    SlaMetric,
    TagsMetric,
    TicketFieldsMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

export const SLA_FORMAT = 'sla'

type CommonMetrics = {
    title?: string
}

type PerformanceOverviewMetrics = {
    metricName:
        | OverviewMetric.OpenTickets
        | OverviewMetric.TicketsClosed
        | OverviewMetric.TicketsCreated
        | OverviewMetric.TicketsReplied
        | OverviewMetric.MessagesSent
        | OverviewMetric.MessagesPerTicket
        | OverviewMetric.MedianResolutionTime
        | OverviewMetric.MedianFirstResponseTime
        | OverviewMetric.CustomerSatisfaction
        | OverviewMetric.OneTouchTickets
        | OverviewMetric.TicketHandleTime
} & CommonMetrics

export type AgentMetricColumn =
    | AgentsTableColumn.CustomerSatisfaction
    | AgentsTableColumn.MedianFirstResponseTime
    | AgentsTableColumn.MedianResolutionTime
    | AgentsTableColumn.MessagesSent
    | AgentsTableColumn.PercentageOfClosedTickets
    | AgentsTableColumn.ClosedTickets
    | AgentsTableColumn.RepliedTickets
    | AgentsTableColumn.OneTouchTickets
    | AgentsTableColumn.RepliedTicketsPerHour
    | AgentsTableColumn.ClosedTicketsPerHour
    | AgentsTableColumn.TicketHandleTime

export type AgentsMetrics = {
    metricName: AgentMetricColumn
    perAgentId: number
} & CommonMetrics

export type AutoQAMetrics = {
    metricName: AutoQAMetric
} & CommonMetrics

export type AutoQAAgentMetric =
    | AutoQAAgentsTableColumn.ResolutionCompleteness
    | AutoQAAgentsTableColumn.ReviewedClosedTickets
    | AutoQAAgentsTableColumn.CommunicationSkills

export type AutoQAAgentMetrics = {
    metricName: AutoQAAgentMetric
    perAgentId: number
} & CommonMetrics

export type ChannelMetricColumn =
    | ChannelsTableColumns.TicketsCreated
    | ChannelsTableColumns.CreatedTicketsPercentage
    | ChannelsTableColumns.ClosedTickets
    | ChannelsTableColumns.TicketHandleTime
    | ChannelsTableColumns.FirstResponseTime
    | ChannelsTableColumns.MedianResolutionTime
    | ChannelsTableColumns.TicketsReplied
    | ChannelsTableColumns.MessagesSent
    | ChannelsTableColumns.CustomerSatisfaction

export type ChannelsMetrics = {
    metricName: ChannelMetricColumn
    perChannel: string
} & CommonMetrics

export type TicketFieldsMetrics = {
    metricName: TicketFieldsMetric.TicketCustomFieldsTicketCount
    customFieldId: number | null
    customFieldValue: string[] | null
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
} & CommonMetrics

export type TagsFieldsMetrics = {
    metricName: TagsMetric.TicketCount
    tagId: string
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
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
    | ChannelsMetrics
    | PerformanceOverviewMetrics
    | TicketFieldsMetrics
    | SlaMetrics
    | ConvertMetrics
    | VoiceMetrics
    | VoiceAgentsMetrics
    | TagsFieldsMetrics

export type DrillDownState = {
    isOpen: boolean
    currentPage: number
    metricData: DrillDownMetric | null
    export: {
        isLoading: boolean
        isError: boolean
        isRequested: boolean
    }
    isNewFilter?: boolean
}

const hiddenMetrics: DrillDownMetric['metricName'][] = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    OverviewMetric.MessagesSent,
    OverviewMetric.OneTouchTickets,
    TicketFieldsMetric.TicketCustomFieldsTicketCount,
    TagsMetric.TicketCount,
    AgentsTableColumn.ClosedTickets,
    AgentsTableColumn.PercentageOfClosedTickets,
    AgentsTableColumn.RepliedTickets,
    AgentsTableColumn.MessagesSent,
    AgentsTableColumn.OneTouchTickets,
    AgentsTableColumn.RepliedTicketsPerHour,
    AgentsTableColumn.ClosedTicketsPerHour,
    AutoQAMetric.ReviewedClosedTickets,
    AutoQAMetric.ResolutionCompleteness,
    AutoQAAgentsTableColumn.ReviewedClosedTickets,
    AutoQAAgentsTableColumn.ResolutionCompleteness,
    ChannelsTableColumns.TicketsCreated,
    ChannelsTableColumns.CreatedTicketsPercentage,
    ChannelsTableColumns.ClosedTickets,
    ChannelsTableColumns.TicketsReplied,
    ConvertMetric.CampaignSalesCount,
    VoiceMetric.AverageWaitTime,
    VoiceMetric.AverageTalkTime,
    VoiceMetric.QueueAverageWaitTime,
    VoiceMetric.QueueAverageTalkTime,
    VoiceMetric.QueueInboundCalls,
    VoiceMetric.QueueMissedInboundCalls,
    VoiceMetric.QueueOutboundCalls,
    VoiceAgentsMetric.AgentTotalCalls,
    VoiceAgentsMetric.AgentInboundAnsweredCalls,
    VoiceAgentsMetric.AgentInboundMissedCalls,
    VoiceAgentsMetric.AgentOutboundCalls,
    VoiceAgentsMetric.AgentAverageTalkTime,
]

export const initialState: DrillDownState = {
    isOpen: false,
    currentPage: 1,
    metricData: null,
    export: {
        isLoading: false,
        isError: false,
        isRequested: false,
    },
    isNewFilter: false,
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
    {dispatch: StoreDispatch; state: RootState}
>(
    EXPORT_DRILL_DOWN_JOB_ACTION,
    async (
        {query, jobType, context},
        {dispatch, getState, rejectWithValue}
    ) => {
        const currentUser = getCurrentUser(getState())
        const currentUserEmail = String(currentUser.get('email'))

        try {
            const response = await createJob({
                type: jobType,
                params: {reporting_query: query, context: context},
            })
            void dispatch(notifyAboutExportSuccess(jobType, currentUserEmail))

            return response
        } catch (error) {
            return rejectWithValue(error)
        } finally {
            void appQueryClient.invalidateQueries({
                queryKey: queryKeys['jobs']['listJobs'](),
            })
        }
    }
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
        setShouldUseNewFilterData(state, action: PayloadAction<boolean>) {
            state.isNewFilter = action.payload
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

export const {
    closeDrillDownModal,
    setMetricData,
    setCurrentPage,
    setShouldUseNewFilterData,
} = drillDownSlice.actions

export const getDrillDownModalState = (state: RootState) =>
    state.ui[drillDownSlice.name].isOpen

export const getDrillDownCurrentPage = (state: RootState) =>
    state.ui[drillDownSlice.name].currentPage

export const getDrillDownExport = (state: RootState) =>
    state.ui[drillDownSlice.name].export

export const getDrillDownMetric = (state: RootState) =>
    state.ui[drillDownSlice.name].metricData

export const getIsNewFilter = (state: RootState) =>
    state.ui[drillDownSlice.name].isNewFilter

export const getDrillDownMetricColumn = (
    state: RootState
): {
    metricTitle: string
    showMetric: boolean
    metricValueFormat: MetricValueFormat | typeof SLA_FORMAT
} => {
    const metricData = state.ui[drillDownSlice.name].metricData
    let metricTitle = ''
    let metricValueFormat: MetricValueFormat | typeof SLA_FORMAT = 'decimal'

    if (!metricData) {
        return {
            metricTitle,
            showMetric: false,
            metricValueFormat: 'decimal',
        }
    }

    if (
        metricData.metricName === VoiceAgentsMetric.AgentTotalCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentInboundAnsweredCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentInboundMissedCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentOutboundCalls ||
        metricData.metricName === VoiceAgentsMetric.AgentAverageTalkTime ||
        metricData.metricName === VoiceMetric.QueueAverageTalkTime ||
        metricData.metricName === VoiceMetric.QueueAverageWaitTime ||
        metricData.metricName === VoiceMetric.QueueInboundCalls ||
        metricData.metricName === VoiceMetric.QueueMissedInboundCalls ||
        metricData.metricName === VoiceMetric.QueueOutboundCalls
    ) {
        metricTitle = ''
    } else if (
        metricData.metricName === SlaMetric.AchievementRate ||
        metricData.metricName === SlaMetric.BreachedTicketsRate
    ) {
        metricTitle = SLA_STATUS_COLUMN_LABEL
        metricValueFormat = SLA_FORMAT
    } else if (
        metricData.metricName === AutoQAMetric.ReviewedClosedTickets ||
        metricData.metricName === AutoQAMetric.CommunicationSkills ||
        metricData.metricName === AutoQAMetric.ResolutionCompleteness
    ) {
        metricTitle = TrendCardConfig[metricData.metricName].title
        metricValueFormat = TrendCardConfig[metricData.metricName].metricFormat
    } else if (
        metricData.metricName === AutoQAAgentsTableColumn.CommunicationSkills ||
        metricData.metricName ===
            AutoQAAgentsTableColumn.ResolutionCompleteness ||
        metricData.metricName === AutoQAAgentsTableColumn.ReviewedClosedTickets
    ) {
        metricTitle = AutoQAAgentsColumnConfig[metricData.metricName].title
        metricValueFormat =
            AutoQAAgentsColumnConfig[metricData.metricName].format
    } else if (
        metricData.metricName === ConvertMetric.CampaignSalesCount ||
        metricData.metricName === VoiceMetric.AverageWaitTime ||
        metricData.metricName === VoiceMetric.AverageTalkTime ||
        metricData.metricName === TagsMetric.TicketCount
    ) {
        metricTitle = ''
    } else if ('perAgentId' in metricData) {
        metricTitle = TableLabels[metricData.metricName]
        metricValueFormat = AgentsColumnConfig[metricData.metricName].format
    } else if ('customFieldValue' in metricData) {
        metricTitle = ''
        metricValueFormat = 'decimal'
    } else if ('perChannel' in metricData) {
        metricTitle = ChannelsTableLabels[metricData.metricName]
        metricValueFormat = ChannelColumnConfig[metricData.metricName].format
    } else {
        metricTitle = OverviewMetricConfig[metricData.metricName].title
        metricValueFormat =
            OverviewMetricConfig[metricData.metricName].metricFormat
    }

    return {
        metricTitle,
        metricValueFormat,
        showMetric: !hiddenMetrics.includes(metricData.metricName),
    }
}

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
    currentUserEmail: string
) => {
    const confirmationText = getConfirmationText(jobType)

    return notify({
        message: `${confirmationText} You will receive the download link via email at <strong>${currentUserEmail}</strong> once the export is done.`,
        allowHTML: true,
        status: NotificationStatus.Success,
    })
}
