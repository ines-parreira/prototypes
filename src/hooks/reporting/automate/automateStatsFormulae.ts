const infinityNanToZero = (value: number) => {
    return isNaN(value) || value === Infinity ? 0 : value
}

const nonNegative = (value: number) => (value < 0 ? 0 : value)

export const automationRate = (
    automatedInteractions: number | null,
    billableTicketCount: number | null,
    automatedInteractionsByAutoResponders: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketCount != null &&
        automatedInteractionsByAutoResponders != null
    ) {
        if (billableTicketCount === 0 && automatedInteractions > 0) return 1

        return infinityNanToZero(
            automatedInteractions /
                (automatedInteractions +
                    billableTicketCount -
                    automatedInteractionsByAutoResponders)
        )
    }

    return 0
}

const averageFirstResponseTimeWithoutAutomation = (
    billableTicketCount: number,
    totalFirstResponseTimeExcludingAIAgent: number
): number =>
    infinityNanToZero(
        totalFirstResponseTimeExcludingAIAgent / billableTicketCount
    )

const averageFirstResponseTimeWithAutomation = (
    billableTicketExcludingAIAgentCount: number,
    totalFirstResponseTimeIncludingAIAgent: number,
    automatedInteractions: number
): number =>
    infinityNanToZero(
        // AI Agent is not included in billable ticket count but is included in automatedInteractions
        totalFirstResponseTimeIncludingAIAgent /
            (billableTicketExcludingAIAgentCount + automatedInteractions)
    )

export const decreaseInFirstResponseTime = (
    automatedInteractions: number | null,
    billableTicketExcludingAIAgentCount: number | null,
    totalFirstResponseTimeExcludingAIAgent: number | null,
    totalFirstResponseTimeIncludingAIAgent: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketExcludingAIAgentCount != null &&
        totalFirstResponseTimeExcludingAIAgent != null &&
        totalFirstResponseTimeIncludingAIAgent != null
    ) {
        const averageFRTWithoutAutomation =
            averageFirstResponseTimeWithoutAutomation(
                billableTicketExcludingAIAgentCount,
                totalFirstResponseTimeExcludingAIAgent
            )

        const averageFRTWithAutomation = averageFirstResponseTimeWithAutomation(
            billableTicketExcludingAIAgentCount,
            totalFirstResponseTimeIncludingAIAgent,
            automatedInteractions
        )

        return nonNegative(
            averageFRTWithoutAutomation - averageFRTWithAutomation
        )
    }
    return 0
}

export const averageResolutionTimeWithAutomation = (
    totalResolutionTimeExcludingAIAgent: number,
    billableTicketCountExcludingAIAgent: number,
    automatedInteractions: number,
    totalResolutionTimeResolvedByAIAgent: number
): number =>
    infinityNanToZero(
        (totalResolutionTimeExcludingAIAgent +
            totalResolutionTimeResolvedByAIAgent) /
            (billableTicketCountExcludingAIAgent + automatedInteractions)
    )

export const decreaseInResolutionTime = (
    automatedInteractions: number | null,
    billableTicketCountExcludingAIAgent: number | null,
    totalResolutionTimeExcludingAIAgent: number | null,
    totalResolutionTimeResolvedByAIAgent: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketCountExcludingAIAgent != null &&
        totalResolutionTimeExcludingAIAgent != null
    ) {
        const averageRTWithoutAutomation = infinityNanToZero(
            totalResolutionTimeExcludingAIAgent /
                billableTicketCountExcludingAIAgent
        )

        const averageRTWithAutomation = averageResolutionTimeWithAutomation(
            totalResolutionTimeExcludingAIAgent,
            billableTicketCountExcludingAIAgent,
            automatedInteractions,
            totalResolutionTimeResolvedByAIAgent ?? 0
        )

        return nonNegative(averageRTWithoutAutomation - averageRTWithAutomation)
    }
    return 0
}
