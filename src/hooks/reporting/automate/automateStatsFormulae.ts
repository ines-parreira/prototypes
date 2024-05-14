const infinityNanToZero = (value: number) => {
    return isNaN(value) || value === Infinity ? 0 : value
}

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

const averageFRTWithoutAutomation = (
    billableTicketCount: number,
    totalFirstResponseTime: number
): number => infinityNanToZero(totalFirstResponseTime / billableTicketCount)

const averageFRTWithAutomation = (
    billableTicketCount: number,
    totalFirstResponseTime: number,
    automatedInteractions: number
): number =>
    infinityNanToZero(
        totalFirstResponseTime / (billableTicketCount + automatedInteractions)
    )

export const decreaseInFirstResponseTime = (
    automatedInteractions: number | null,
    billableTicketCount: number | null,
    totalFirstResponseTime: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketCount != null &&
        totalFirstResponseTime != null
    ) {
        return (
            averageFRTWithoutAutomation(
                billableTicketCount,
                totalFirstResponseTime
            ) -
            averageFRTWithAutomation(
                billableTicketCount,
                totalFirstResponseTime,
                automatedInteractions
            )
        )
    }
    return 0
}

export const resolutionTimeWithAutomation = (
    totalResolutionTime: number | null,
    billableTicketCount: number | null,
    automatedInteractions: number | null
): number => {
    if (
        totalResolutionTime != null &&
        billableTicketCount != null &&
        automatedInteractions != null
    ) {
        return infinityNanToZero(
            totalResolutionTime / (billableTicketCount + automatedInteractions)
        )
    }
    return 0
}

export const decreaseInResolutionTime = (
    automatedInteractions: number | null,
    billableTicketCount: number | null,
    totalResolutionTime: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketCount != null &&
        totalResolutionTime != null
    )
        return infinityNanToZero(
            totalResolutionTime / billableTicketCount -
                resolutionTimeWithAutomation(
                    totalResolutionTime,
                    billableTicketCount,
                    automatedInteractions
                )
        )
    return 0
}
