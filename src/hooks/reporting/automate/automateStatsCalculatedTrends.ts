import {
    automationRate,
    decreaseInFirstResponseTime,
    decreaseInResolutionTime,
} from './automateStatsFormulae'
import {TrendData} from './types'

export const getAutomationRateTrend = (
    isFetching: boolean,
    isError: boolean,
    automatedInteractions: TrendData,
    billableTickets: TrendData,
    automatedInteractionsByAutoResponders: TrendData
) => {
    return {
        isFetching,
        isError,
        data: {
            value: automationRate(
                automatedInteractions?.value,
                billableTickets?.value,
                automatedInteractionsByAutoResponders?.value
            ),
            prevValue: automationRate(
                automatedInteractions?.prevValue,
                billableTickets?.prevValue,
                automatedInteractionsByAutoResponders?.prevValue
            ),
        },
    }
}
export const getDecreaseInFirstResponseTimeTrend = (
    isFetching: boolean,
    isError: boolean,
    automatedInteractions: TrendData,
    billableTickets: TrendData,
    firstResponseTime: TrendData
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInFirstResponseTime(
                automatedInteractions?.value,
                billableTickets?.value,
                firstResponseTime?.value
            ),
            prevValue: decreaseInFirstResponseTime(
                automatedInteractions?.prevValue,
                billableTickets?.prevValue,
                firstResponseTime?.prevValue
            ),
        },
    }
}

export const getDecreaseInResolutionTimeTrend = (
    isFetching: boolean,
    isError: boolean,
    automatedInteractions: TrendData,
    billableTickets: TrendData,
    totalResolutionTime: TrendData
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInResolutionTime(
                automatedInteractions?.value,
                billableTickets?.value,
                totalResolutionTime?.value
            ),
            prevValue: decreaseInResolutionTime(
                automatedInteractions?.prevValue,
                billableTickets?.prevValue,
                totalResolutionTime?.prevValue
            ),
        },
    }
}
