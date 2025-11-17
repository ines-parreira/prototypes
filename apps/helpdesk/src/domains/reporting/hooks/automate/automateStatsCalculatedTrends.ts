import {
    automationRate,
    automationRateUnfilteredDenominator,
    calculateRate,
    decreaseInFirstResponseTime,
    decreaseInResolutionTime,
} from 'domains/reporting/hooks/automate/automateStatsFormulae'
import type { TrendData } from 'domains/reporting/hooks/automate/types'

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
    automatedInteractionsByAutoResponders: TrendData,
) => {
    return {
        isFetching,
        isError,
        data: {
            value: automationRate(
                automatedInteractions?.value,
                billableTickets?.value,
                automatedInteractionsByAutoResponders?.value,
            ),
            prevValue: automationRate(
                automatedInteractions?.prevValue,
                billableTickets?.prevValue,
                automatedInteractionsByAutoResponders?.prevValue,
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
    totalFirstResponseTimeIncludingAIAgent: TrendData,
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInFirstResponseTime(
                automatedInteractions?.value,
                billableTicketsExcludingAIAgent?.value,
                totalFirstResponseTimeExcludingAIAgent?.value,
                totalFirstResponseTimeIncludingAIAgent?.value,
            ),
            prevValue: decreaseInFirstResponseTime(
                automatedInteractions?.prevValue,
                billableTicketsExcludingAIAgent?.prevValue,
                totalFirstResponseTimeExcludingAIAgent?.prevValue,
                totalFirstResponseTimeIncludingAIAgent?.prevValue,
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
    totalResolutionTimeResolvedByAIAgent: TrendData,
) => {
    return {
        isFetching,
        isError,
        data: {
            value: decreaseInResolutionTime(
                automatedInteractions?.value,
                billableTicketsExcludingAIAgent?.value,
                totalResolutionTimeExcludingAIAgent?.value,
                totalResolutionTimeResolvedByAIAgent?.value,
            ),
            prevValue: decreaseInResolutionTime(
                automatedInteractions?.prevValue,
                billableTicketsExcludingAIAgent?.prevValue,
                totalResolutionTimeExcludingAIAgent?.prevValue,
                totalResolutionTimeResolvedByAIAgent?.prevValue,
            ),
        },
    }
}

// SUCCESS RATE: #AI_AGENT_AUTOMATED_INTERACTIONS / #tickets with outcome field excluding tickets with Other::No reply intents
// Since it is possible to have data above 100%, we will limit the value to 100% until we fix the underlying data issue
export const getAiAgentSuccessRate = ({
    isFetching,
    isError,
    aiAgentAutomatedInteractions,
    aiAgentTickets,
}: {
    isFetching: boolean
    isError: boolean
    aiAgentAutomatedInteractions: TrendData
    aiAgentTickets: TrendData
}) => {
    return {
        isFetching,
        isError,
        data: {
            value: Math.min(
                calculateRate(
                    aiAgentAutomatedInteractions?.value,
                    aiAgentTickets?.value,
                ),
                1,
            ),
            prevValue: Math.min(
                calculateRate(
                    aiAgentAutomatedInteractions?.prevValue,
                    aiAgentTickets?.prevValue,
                ),
                1,
            ),
        },
    }
}

// AI AGENT AUTOMATION RATE: AI Agent automated interactions as a percentage using same denominator as overall automation rate
export const getAIAgentAutomationRateTrend = (
    isFetching: boolean,
    isError: boolean,
    aiAgentAutomatedInteractions: TrendData,
    billableTicketsExcludingAIAgent: TrendData,
) => {
    return {
        isFetching,
        isError,
        data: {
            value: automationRate(
                aiAgentAutomatedInteractions?.value,
                billableTicketsExcludingAIAgent?.value,
                // For AI Agent, we don't subtract auto responders from the AI Agent interactions
                // since AI Agent interactions don't overlap with auto responders
                0,
            ),
            prevValue: automationRate(
                aiAgentAutomatedInteractions?.prevValue,
                billableTicketsExcludingAIAgent?.prevValue,
                0,
            ),
        },
    }
}

// AI AGENT AUTOMATION RATE WITH UNFILTERED DENOMINATOR
export const getAIAgentAutomationRateUnfilteredDenominatorTrend = ({
    isFetching,
    isError,
    aiAgentAutomatedInteractions,
    allAutomatedInteractions,
    allAutomatedInteractionsByAutoResponders,
    billableTicketsCount,
}: {
    isFetching: boolean
    isError: boolean
    aiAgentAutomatedInteractions: TrendData
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
                    aiAgentAutomatedInteractions?.value,
                allAutomatedInteractions: allAutomatedInteractions?.value,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders?.value,
                billableTicketsCount: billableTicketsCount?.value,
            }),
            prevValue: automationRateUnfilteredDenominator({
                filteredAutomatedInteractions:
                    aiAgentAutomatedInteractions?.prevValue,
                allAutomatedInteractions: allAutomatedInteractions?.prevValue,
                allAutomatedInteractionsByAutoResponders:
                    allAutomatedInteractionsByAutoResponders?.prevValue,
                billableTicketsCount: billableTicketsCount?.prevValue,
            }),
        },
    }
}

// COVERAGE_RATE: #tickets with outcome field excluding tickets with Other::No reply intents  / # tickets from channels where AI agent can be enabled excluding Other::No reply intent
export const getAiAgentCoverageRate = ({
    isFetching,
    isError,
    aiAgentTickets,
    allTickets,
}: {
    isFetching: boolean
    isError: boolean
    aiAgentTickets: TrendData
    allTickets: TrendData
}) => {
    return {
        isFetching,
        isError,
        data: {
            value: calculateRate(aiAgentTickets?.value, allTickets?.value),
            prevValue: calculateRate(
                aiAgentTickets?.prevValue,
                allTickets?.prevValue,
            ),
        },
    }
}
