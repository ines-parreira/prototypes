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

export const workflowAutomatedInteractions = (
    workflowPromptStarted: number | null,
    workflowEndedWithoutAction: number | null
): number => {
    if (workflowPromptStarted == null || workflowEndedWithoutAction == null)
        return 0

    return workflowPromptStarted + workflowEndedWithoutAction
}

export const workflowDropoff = (
    workflowStarted: number | null,
    workflowPromptStarted: number | null,
    workflowEndedWithoutAction: number | null,
    workflowWithTicketHandover: number | null
): number => {
    if (
        workflowStarted == null ||
        workflowPromptStarted == null ||
        workflowEndedWithoutAction == null ||
        workflowWithTicketHandover == null
    )
        return 0

    return nonNegative(
        workflowStarted -
            workflowPromptStarted -
            workflowEndedWithoutAction -
            workflowWithTicketHandover
    )
}

export const workflowTicketCreated = (
    workflowWithTicketHandover: number | null,
    workflowTicketsCreated: number | null
): number => {
    if (workflowWithTicketHandover == null || workflowTicketsCreated == null)
        return 0

    return nonNegative(workflowWithTicketHandover - workflowTicketsCreated)
}

export const workflowAutomationRate = (
    workflowAutomatedInteractions: number | null,
    workflowDropoff: number | null,
    workflowTicketCreated: number | null
): number => {
    if (
        workflowAutomatedInteractions == null ||
        workflowDropoff == null ||
        workflowTicketCreated == null
    )
        return 0

    return infinityNanToZero(
        workflowAutomatedInteractions /
            (workflowAutomatedInteractions +
                workflowDropoff +
                workflowTicketCreated)
    )
}

export const workflowStepViewRate = (
    workflowStarted: number | null,
    workflowStepStarted: number | null
): number => {
    if (workflowStarted == null || workflowStepStarted == null) return 0

    return infinityNanToZero(workflowStepStarted / workflowStarted)
}

export const workflowStepDropoffRate = (
    workflowStepStarted: number | null,
    workflowStepDropoff: number | null
): number => {
    if (workflowStepStarted == null || workflowStepDropoff == null) return 0

    return infinityNanToZero(workflowStepDropoff / workflowStepStarted)
}

export const workflowEndStepDropoff = (
    workflowStepPromptNotHelpful: number | null,
    workflowStepTicketsCreated: number | null
): number => {
    if (
        workflowStepPromptNotHelpful == null ||
        workflowStepTicketsCreated == null
    )
        return 0

    return nonNegative(
        workflowStepPromptNotHelpful - workflowStepTicketsCreated
    )
}

export const workflowEndStepDropoffRate = (
    workflowStepAutomatedInteractions: number | null,
    workflowStepDropoff: number | null,
    workflowStepTicketCreated: number | null
): number => {
    if (
        workflowStepAutomatedInteractions == null ||
        workflowStepDropoff == null ||
        workflowStepTicketCreated == null
    )
        return 0

    return infinityNanToZero(
        workflowStepDropoff /
            (workflowStepAutomatedInteractions +
                workflowStepDropoff +
                workflowStepTicketCreated)
    )
}

export const workflowEndStepAutomatedInteractions = (
    workflowEndStepStarted: number | null,
    workflowEndStepDropoff: number | null,
    workflowStepTicketsCreated: number | null
): number => {
    if (
        workflowEndStepStarted == null ||
        workflowEndStepDropoff == null ||
        workflowStepTicketsCreated == null
    )
        return 0

    return nonNegative(
        workflowEndStepStarted -
            workflowEndStepDropoff -
            workflowStepTicketsCreated
    )
}

export const workflowEndSteTicketsCreatedRate = (
    workflowStepAutomatedInteractions: number | null,
    workflowStepDropoff: number | null,
    workflowStepTicketCreated: number | null
): number => {
    if (
        workflowStepAutomatedInteractions == null ||
        workflowStepDropoff == null ||
        workflowStepTicketCreated == null
    )
        return 0

    return infinityNanToZero(
        workflowStepTicketCreated /
            (workflowStepAutomatedInteractions +
                workflowStepDropoff +
                workflowStepTicketCreated)
    )
}
