import { CancellationReason, Reason } from '../types'

export const findSecondaryReasonsByPrimaryReason = (
    primaryReason: Reason | null,
    reasons: CancellationReason[],
): Reason[] => {
    const cancellationReason =
        reasons.find(
            (reason) => reason.primaryReason.label === primaryReason?.label,
        ) || null
    if (cancellationReason === null) {
        throw new Error(
            `Secondary reasons not found for ${primaryReason?.label || 'null'}.`,
        )
    }
    return cancellationReason.secondaryReasons
}
