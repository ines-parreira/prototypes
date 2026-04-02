export function isRefundedStatus(financialStatus: string): boolean {
    return ['refunded', 'partially_refunded', 'voided'].includes(
        financialStatus.toLowerCase(),
    )
}
