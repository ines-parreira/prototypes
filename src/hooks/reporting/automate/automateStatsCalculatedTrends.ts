import {
    automationRate,
    decreaseInFirstResponseTime,
    decreaseInResolutionTime,
    automationRateUnfilteredDenominator,
} from './automateStatsFormulae'
import {TrendData} from './types'

export const getAutomationRateUnfilteredDenominatorTrend = ({
    isFetching,
    isError,
    filteredAutomatedInteractions,
    allAutomatedInteractions,
    allAutomatedInteractionsByAutoResponders,
    billableTicketsCount,
}: {
    isFetching: boolean
    isError: boolean
    filteredAutomatedInteractions: TrendData
    allAutomatedInteractions: TrendData
    allAutomatedInteractionsByAutoResponders: TrendData
    billableTicketsCount: TrendData
}) => {
    return {
        isFetching,
        isError,
        data: {
            value: automationRateUnfilteredDenominator({
                filteredAutomatedInteractions:
                    filteredAutomatedInteractions?.value,
                allAutomatedInteractions: allAutomatedInteractions?.value,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders?.value,
                billableTicketsCount: billableTicketsCount?.value,
            }),
            prevValue: automationRateUnfilteredDenominator({
                filteredAutomatedInteractions:
                    filteredAutomatedInteractions?.prevValue,
                allAutomatedInteractions: allAutomatedInteractions?.prevValue,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders?.prevValue,
                billableTicketsCount: billableTicketsCount?.prevValue,
            }),
        },
    }
}

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
    billableTicketsExcludingAIAgent: TrendData,
    totalFirstResponseTimeExcludingAIAgent: TrendData,
    totalFirstResponseTimeIncludingAIAgent: TrendData
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInFirstResponseTime(
                automatedInteractions?.value,
                billableTicketsExcludingAIAgent?.value,
                totalFirstResponseTimeExcludingAIAgent?.value,
                totalFirstResponseTimeIncludingAIAgent?.value
            ),
            prevValue: decreaseInFirstResponseTime(
                automatedInteractions?.prevValue,
                billableTicketsExcludingAIAgent?.prevValue,
                totalFirstResponseTimeExcludingAIAgent?.prevValue,
                totalFirstResponseTimeIncludingAIAgent?.prevValue
            ),
        },
    }
}

export const getDecreaseInResolutionTimeTrend = (
    isFetching: boolean,
    isError: boolean,
    automatedInteractions: TrendData,
    billableTicketsExcludingAIAgent: TrendData,
    totalResolutionTimeExcludingAIAgent: TrendData,
    totalResolutionTimeResolvedByAIAgent: TrendData
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInResolutionTime(
                automatedInteractions?.value,
                billableTicketsExcludingAIAgent?.value,
                totalResolutionTimeExcludingAIAgent?.value,
                totalResolutionTimeResolvedByAIAgent?.value
            ),
            prevValue: decreaseInResolutionTime(
                automatedInteractions?.prevValue,
                billableTicketsExcludingAIAgent?.prevValue,
                totalResolutionTimeExcludingAIAgent?.prevValue,
                totalResolutionTimeResolvedByAIAgent?.prevValue
            ),
        },
    }
}
