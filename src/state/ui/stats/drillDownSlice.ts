import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {User} from 'config/types/user'
import {OrderDirection} from 'models/api/types'
import {createJob} from 'models/job/resources'
import {Job, JobType} from 'models/job/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {ReportingQuery} from 'models/reporting/types'
import {TableLabels} from 'pages/stats/AgentsTableConfig'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {OverviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'
import {OverviewMetric, TableColumn} from 'state/ui/stats/types'

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
} & CommonMetrics

export type AgentMetricColumn =
    | TableColumn.CustomerSatisfaction
    | TableColumn.MedianFirstResponseTime
    | TableColumn.MedianResolutionTime
    | TableColumn.MessagesSent
    | TableColumn.PercentageOfClosedTickets
    | TableColumn.ClosedTickets
    | TableColumn.RepliedTickets
    | TableColumn.OneTouchTickets

export type AgentsMetrics = {
    metricName: AgentMetricColumn
    perAgentId: number
} & CommonMetrics

export type TicketFieldsMetrics = {
    metricName: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    customFieldId: number | null
    customFieldValue: string[] | null
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
} & CommonMetrics

export type DrillDownMetric =
    | AgentsMetrics
    | PerformanceOverviewMetrics
    | TicketFieldsMetrics

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
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.RepliedTickets,
    TableColumn.MessagesSent,
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
    ReportingQuery<HelpdeskMessageCubeWithJoins>,
    {dispatch: StoreDispatch; state: RootState}
>(
    EXPORT_TICKET_DRILL_DOWN_JOB_ACTION,
    async (
        query: ReportingQuery<HelpdeskMessageCubeWithJoins>,
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

export const getDrillDownMetric = (state: RootState) => {
    const metricData = state.ui[drillDownSlice.name].metricData
    return {
        metricData,
        metricOrder:
            metricData?.metricName === OverviewMetric.CustomerSatisfaction ||
            metricData?.metricName === TableColumn.CustomerSatisfaction
                ? OrderDirection.Asc
                : OrderDirection.Desc,
    }
}

const getMetricValueFormat = (
    metricName: DrillDownMetric['metricName']
): MetricValueFormat => {
    if (
        metricName === TableColumn.MedianFirstResponseTime ||
        metricName === TableColumn.MedianResolutionTime ||
        metricName === OverviewMetric.MedianFirstResponseTime ||
        metricName === OverviewMetric.MedianResolutionTime
    ) {
        return 'duration'
    }

    if (metricName === TableColumn.OneTouchTickets) {
        return 'percent'
    }

    return 'decimal'
}

export const getDrillDownMetricColumn = (
    state: RootState
): {
    metricTitle: string
    showMetric: boolean
    metricValueFormat: MetricValueFormat
} => {
    const metricData = state.ui[drillDownSlice.name].metricData
    let metricTitle = ''

    if (!metricData) {
        return {
            metricTitle,
            showMetric: false,
            metricValueFormat: 'decimal',
        }
    }

    if ('perAgentId' in metricData) {
        metricTitle = TableLabels[metricData.metricName]
    } else if ('customFieldValue' in metricData) {
        metricTitle = ''
    } else {
        metricTitle = OverviewMetricConfig[metricData.metricName].title
    }

    return {
        metricTitle,
        metricValueFormat: getMetricValueFormat(metricData.metricName),
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
        message: `<strong>All tickets</strong> will be exported. You will receive the download link via email at <strong>${currentUserEmail}</strong> once the export is done.`,
        allowHTML: true,
        status: NotificationStatus.Success,
    })
