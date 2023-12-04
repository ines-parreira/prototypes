import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {TableLabels} from 'pages/stats/AgentsTableConfig'
import {OrderDirection} from 'models/api/types'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {User} from 'config/types/user'
import {overviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {RootState} from 'state/types'
import {OverviewMetric, TableColumn} from 'state/ui/stats/types'

type CommonMetrics = {
    title?: string
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
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
} & CommonMetrics

export type DrillDownMetric =
    | AgentsMetrics
    | PerformanceOverviewMetrics
    | TicketFieldsMetrics

export type DrillDownState = {
    isOpen: boolean
    metricData: DrillDownMetric | null
}

const hiddenMetrics: DrillDownMetric['metricName'][] = [
    OverviewMetric.OpenTickets,
    OverviewMetric.TicketsClosed,
    OverviewMetric.TicketsCreated,
    OverviewMetric.TicketsReplied,
    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
    TableColumn.ClosedTickets,
    TableColumn.PercentageOfClosedTickets,
    TableColumn.RepliedTickets,
]

export const initialState: DrillDownState = {
    isOpen: false,
    metricData: null,
}

export const drillDownSlice = createSlice({
    name: 'drillDown',
    initialState,
    reducers: {
        setMetricData(state, action: PayloadAction<DrillDownMetric | null>) {
            state.metricData = action.payload
            state.isOpen = true
        },
        toggleDrillDownModal(state) {
            state.isOpen = !state.isOpen
        },
    },
})

export const {toggleDrillDownModal, setMetricData} = drillDownSlice.actions

export const getDrillDownModalState = (state: RootState) =>
    state.ui[drillDownSlice.name].isOpen

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
        metricTitle = overviewMetricConfig[metricData.metricName].title
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
