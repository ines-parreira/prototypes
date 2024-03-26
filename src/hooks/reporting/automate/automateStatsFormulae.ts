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

export const decreaseInFirstResponseTime = (
    automatedInteractions: number | null,
    billableTicketCount: number | null,
    totalFirstResponseTime: number | null
): number => {
    if (
        automatedInteractions != null &&
        billableTicketCount != null &&
        totalFirstResponseTime != null
    )
        return infinityNanToZero(
            totalFirstResponseTime / billableTicketCount -
                automatedInteractions /
                    (totalFirstResponseTime /
                        (billableTicketCount + automatedInteractions))
        )
    return 0
}

export const resolutionTime = (
    totalResolutionTime: number | null,
    billableTicketCount: number | null,
    automatedInteractions: number | null
): number => {
    if (
        totalResolutionTime != null &&
        billableTicketCount != null &&
        automatedInteractions != null
    )
        return infinityNanToZero(
            ((totalResolutionTime / billableTicketCount) *
                billableTicketCount) /
                (billableTicketCount + automatedInteractions)
        )
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
                resolutionTime(
                    totalResolutionTime,
                    billableTicketCount,
                    automatedInteractions
                )
        )
    return 0
}
