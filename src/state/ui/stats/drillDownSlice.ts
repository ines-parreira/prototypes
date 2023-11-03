import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from 'state/types'
import {OrderDirection} from 'models/api/types'
import {TableColumn} from 'state/ui/stats/types'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'

type CommonMetrics = {
    title?: string
    dateRange: {
        end_datetime: string
        start_datetime: string
    }
}

type PerformanceOverviewMetrics = {
    metricName:
        | TicketSatisfactionSurveyMeasure.SurveyScore
        | TicketMessagesMeasure.FirstResponseTime
        | TicketMessagesMeasure.ResolutionTime
        | TicketMessagesMeasure.MessagesAverage
        | TicketMeasure.TicketCount
        | HelpdeskMessageMeasure.TicketCount
        | HelpdeskMessageMeasure.MessageCount
} & CommonMetrics

type AgentsMetrics = {
    metricName: TableColumn
    perAgentId: number
} & CommonMetrics

export type TicketFieldsMetrics = {
    metricName: TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
    customField: {
        id: number
        label: string
    }
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
        setMetricData(state, action: PayloadAction<DrillDownMetric>) {
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

export const getDrillDownMetric = (state: RootState) =>
    state.ui[drillDownSlice.name].metricData

export const getDrillDownMetricShow = (state: RootState) => {
    const metricName = state.ui[drillDownSlice.name].metricData?.metricName

    return metricName && hiddenMetrics.includes(metricName) ? false : true
}

export const getDrillDownMetricOrder = (state: RootState) => {
    const metricName = state.ui[drillDownSlice.name].metricData?.metricName

    return metricName === TicketSatisfactionSurveyMeasure.SurveyScore ||
        metricName === TableColumn.CustomerSatisfaction
        ? OrderDirection.Asc
        : OrderDirection.Desc
}
