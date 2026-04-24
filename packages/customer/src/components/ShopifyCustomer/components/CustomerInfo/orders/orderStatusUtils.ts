export function isRefundedStatus(
    financialStatus: string | null | undefined,
): boolean {
    if (!financialStatus) return false
    return ['refunded', 'partially_refunded', 'voided'].includes(
        financialStatus.toLowerCase(),
    )
}

export function isFulfilledStatus(
    fulfillmentStatus: string | null | undefined,
): boolean {
    if (!fulfillmentStatus) return false
    return ['fulfilled', 'partial'].includes(fulfillmentStatus.toLowerCase())
}
