import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from 'state/types'
import {OrderDirection} from 'models/api/types'
import {TableColumn} from 'state/ui/stats/types'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {TableLabels} from 'pages/stats/TableConfig'
import {User} from 'config/types/user'
import {
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
} from 'services/reporting/constants'
import {MetricValueFormat} from 'pages/stats/common/utils'

type CommonMetrics = {
    title?: string
    dateRange?: {
        end_datetime: string
        start_datetime: string
    }
}

type PerformanceOverviewMetrics = {
    metricName:
        | TicketSatisfactionSurveyMeasure.AvgSurveyScore
        | TicketMessagesMeasure.MedianFirstResponseTime
        | TicketMessagesMeasure.MedianResolutionTime
        | TicketMessagesMeasure.MessagesAverage
        | TicketMeasure.TicketCount
        | HelpdeskMessageMeasure.TicketCount
        | HelpdeskMessageMeasure.MessageCount
} & CommonMetrics

export type AgentsMetrics = {
    metricName: TableColumn
    perAgentId: number
} & CommonMetrics

export type TicketFieldsMetrics = {
    metricName: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    customFieldValue: string | string[] | null
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
    TicketMeasure.TicketCount,
    HelpdeskMessageMeasure.TicketCount,
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
            metricData?.metricName ===
                TicketSatisfactionSurveyMeasure.AvgSurveyScore ||
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
        metricName === TicketMessagesMeasure.MedianFirstResponseTime ||
        metricName === TicketMessagesMeasure.MedianResolutionTime
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
        const performanceMetricsTitle = {
            [HelpdeskMessageMeasure.MessageCount]: MESSAGES_SENT_LABEL,
            [TicketMessagesMeasure.MedianFirstResponseTime]:
                MEDIAN_FIRST_RESPONSE_TIME_LABEL,
            [TicketMessagesMeasure.MedianResolutionTime]:
                MEDIAN_RESOLUTION_TIME_LABEL,
            [TicketMessagesMeasure.MessagesAverage]: MESSAGES_PER_TICKET_LABEL,
            [TicketSatisfactionSurveyMeasure.AvgSurveyScore]:
                CUSTOMER_SATISFACTION_LABEL,
            [HelpdeskMessageMeasure.TicketCount]: '',
            [TicketMeasure.TicketCount]: '',
        }

        metricTitle = performanceMetricsTitle[metricData.metricName]
    }

    return {
        metricTitle,
        metricValueFormat: getMetricValueFormat(metricData.metricName),
        showMetric: !hiddenMetrics.includes(metricData.metricName),
    }
}

export const buildAgentMetric = (column: TableColumn, agent: User) => ({
    title: `${TableLabels[column]} | ${agent.name}`,
    metricName: column,
    perAgentId: agent.id,
})
