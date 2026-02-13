import { Color } from '@gorgias/axiom'
import type { Color as ColorType } from '@gorgias/axiom'

import type { FinancialStatusValue } from '../types/order'

type FinancialStatusInfo = {
    label: string
    color: Extract<ColorType, 'grey' | 'green' | 'orange' | 'red'>
}

export function getFinancialStatusInfo(
    status: FinancialStatusValue,
): FinancialStatusInfo {
    switch (status) {
        case 'paid':
            return { label: 'Paid', color: Color.Green }
        case 'pending':
            return { label: 'Pending', color: Color.Orange }
        case 'partially_paid':
            return { label: 'Partially paid', color: Color.Orange }
        case 'refunded':
            return { label: 'Refunded', color: Color.Grey }
        case 'voided':
            return { label: 'Voided', color: Color.Grey }
        case 'partially_refunded':
            return { label: 'Partially refunded', color: Color.Orange }
        default:
            return { label: 'Unknown', color: Color.Red }
    }
}
