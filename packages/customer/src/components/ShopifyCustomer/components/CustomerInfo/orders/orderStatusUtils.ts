export function isRefundedStatus(
    financialStatus: string | null | undefined,
): boolean {
    if (!financialStatus) return false
    return ['refunded', 'partially_refunded', 'voided'].includes(
        financialStatus.toLowerCase(),
    )
}
