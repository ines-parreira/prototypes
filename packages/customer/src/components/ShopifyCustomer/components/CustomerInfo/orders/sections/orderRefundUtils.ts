import type { OrderRefund } from '../../../../types'

export function getRefundNote(refunds?: OrderRefund[]): string | undefined {
    if (!refunds?.length) return undefined

    const sorted = [...refunds].sort(
        (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    for (const refund of sorted) {
        if (refund.note?.trim()) {
            return refund.note.trim()
        }
    }

    return undefined
}
