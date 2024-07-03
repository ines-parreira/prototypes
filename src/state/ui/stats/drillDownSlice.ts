import {queryKeys} from '@gorgias/api-queries'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {appQueryClient} from 'api/queryClient'
import {User} from 'config/types/user'
import {createJob} from 'models/job/resources'
import {Job, JobType} from 'models/job/types'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLACubeWithJoins} from 'models/reporting/cubes/sla/TicketSLACube'
import {ReportingQuery} from 'models/reporting/types'
import {AgentsColumnConfig, TableLabels} from 'pages/stats/AgentsTableConfig'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {SLA_STATUS_COLUMN_LABEL} from 'pages/stats/sla/SlaConfig'
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
    OverviewMetric,
    SlaMetric,
    TicketFieldsMetric,
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

export type SlaMetrics = {
    metricName: SlaMetric
} & CommonMetrics

export type DrillDownMetric =
    | AgentsMetrics
    | ChannelsMetrics
    | PerformanceOverviewMetrics
    | TicketFieldsMetrics
    | SlaMetrics

export type DrillDownState = {
    isOpen: boolean
    metricData: DrillDownMetric | null
    export: {
        isLoading: boolean
        isError: boolean
        isRequested: boolean
    }
}

const hiddenMetrics: DrillDownMetric['metricName'][] = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    OverviewMetric.MessagesSent,
    OverviewMetric.OneTouchTickets,
    TicketFieldsMetric.TicketCustomFieldsTicketCount,
    AgentsTableColumn.ClosedTickets,
    AgentsTableColumn.PercentageOfClosedTickets,
    AgentsTableColumn.RepliedTickets,
    AgentsTableColumn.MessagesSent,
    AgentsTableColumn.OneTouchTickets,
    AgentsTableColumn.RepliedTicketsPerHour,
    AgentsTableColumn.ClosedTicketsPerHour,
    ChannelsTableColumns.TicketsCreated,
    ChannelsTableColumns.CreatedTicketsPercentage,
    ChannelsTableColumns.ClosedTickets,
    ChannelsTableColumns.TicketsReplied,
]

export const initialState: DrillDownState = {
    isOpen: false,
    metricData: null,
    export: {
        isLoading: false,
        isError: false,
        isRequested: false,
    },
}

export const EXPORT_TICKET_DRILL_DOWN_JOB_ACTION = 'exportTicketDrillDownJob'

export const createExportTicketDrillDownJob = createAsyncThunk<
    Job,
    ReportingQuery<
        | HelpdeskMessageCubeWithJoins
        | HandleTimeCubeWithJoins
        | TicketSLACubeWithJoins
    >,
    {dispatch: StoreDispatch; state: RootState}
>(
    EXPORT_TICKET_DRILL_DOWN_JOB_ACTION,
    async (
        query: ReportingQuery<
            | HelpdeskMessageCubeWithJoins
            | HandleTimeCubeWithJoins
            | TicketSLACubeWithJoins
        >,
        {dispatch, getState, rejectWithValue}
    ) => {
        const currentUser = getCurrentUser(getState())
        const currentUserEmail = String(currentUser.get('email'))

        try {
            const response = await createJob({
                type: JobType.ExportTicketDrilldown,
                params: {reporting_query: query},
            })
            void dispatch(notifyAboutExportSuccess(currentUserEmail))

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
        closeDrillDownModal(state) {
            state.isOpen = false
            state.export = initialState.export
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createExportTicketDrillDownJob.pending, (state) => {
            state.export.isLoading = true
            state.export.isRequested = true
        })
        builder.addCase(createExportTicketDrillDownJob.fulfilled, (state) => {
            state.export.isLoading = false
            state.export.isError = false
        })
        builder.addCase(createExportTicketDrillDownJob.rejected, (state) => {
            state.export.isLoading = false
            state.export.isError = true
        })
    },
})

export const {closeDrillDownModal, setMetricData} = drillDownSlice.actions

export const getDrillDownModalState = (state: RootState) =>
    state.ui[drillDownSlice.name].isOpen

export const getDrillDownExport = (state: RootState) =>
    state.ui[drillDownSlice.name].export

export const getDrillDownMetric = (state: RootState) =>
    state.ui[drillDownSlice.name].metricData

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

    if ('perAgentId' in metricData) {
        metricTitle = TableLabels[metricData.metricName]
        metricValueFormat = AgentsColumnConfig[metricData.metricName].format
    } else if ('customFieldValue' in metricData) {
        metricTitle = ''
        metricValueFormat = 'decimal'
    } else if ('perChannel' in metricData) {
        metricTitle = ChannelsTableLabels[metricData.metricName]
        metricValueFormat = ChannelColumnConfig[metricData.metricName].format
    } else if (
        metricData.metricName === SlaMetric.AchievementRate ||
        metricData.metricName === SlaMetric.BreachedTicketsRate
    ) {
        metricTitle = SLA_STATUS_COLUMN_LABEL
        metricValueFormat = SLA_FORMAT
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

export const buildAgentMetric = (column: AgentMetricColumn, agent: User) => ({
    title: `${TableLabels[column]} | ${agent.name}`,
    metricName: column,
    perAgentId: agent.id,
})

export const notifyAboutExportSuccess = (currentUserEmail: string) =>
    notify({
        message: `All tickets will be exported. You will receive the download link via email at <strong>${currentUserEmail}</strong> once the export is done.`,
        allowHTML: true,
        status: NotificationStatus.Success,
    })
