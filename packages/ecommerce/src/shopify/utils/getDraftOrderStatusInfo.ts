import { Color } from '@gorgias/axiom'
import type { Color as ColorType } from '@gorgias/axiom'

import type { DraftStatusValue } from '../types/order'

type DraftOrderStatusInfo = {
    label: string
    color: Extract<ColorType, 'purple' | 'green' | 'orange'>
}

export function getDraftOrderStatusInfo(
    status: DraftStatusValue | undefined,
    invoiceSentAt?: string | null,
): DraftOrderStatusInfo {
    const effectiveStatus = status ?? (invoiceSentAt ? 'invoice_sent' : 'open')

    switch (effectiveStatus) {
        case 'completed':
            return { label: 'Completed', color: Color.Green }
        case 'invoice_sent':
            return { label: 'Invoice sent', color: Color.Orange }
        case 'open':
        default:
            return { label: 'Open', color: Color.Purple }
    }
}
