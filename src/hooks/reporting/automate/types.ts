import {Moment} from 'moment'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'

export enum AutomateTrendMetrics {
    AutomationRate = 'automationRateTrend',
    Interactions = 'automatedInteractionTrend',
    DecreaseInResolutionTime = 'decreaseInResolutionTimeTrend',
    DecreaseInFirstResponseTime = 'decreaseInFirstResponseTimeTrend',
}

export type TrendData = {
    value: number | null
    prevValue: number | null
}

export type AutomateTimeseries = {
    isFetching: boolean
    isError: boolean
    automationRateTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
}

export type GreyArea = {
    from: Moment
    to: Moment
}
