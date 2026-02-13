import { Color } from '@gorgias/axiom'
import type { Color as ColorType } from '@gorgias/axiom'

import type { FulfillmentStatusValue } from '../types/order'

type FulfillmentStatusInfo = {
    label: string
    color: Extract<ColorType, 'grey' | 'green' | 'orange'>
}

export function getFulfillmentStatusInfo(
    status: FulfillmentStatusValue | null,
): FulfillmentStatusInfo {
    if (!status) {
        return { label: 'Unfulfilled', color: Color.Grey }
    }

    switch (status) {
        case 'fulfilled':
            return { label: 'Fulfilled', color: Color.Green }
        case 'partial':
            return { label: 'Partially fulfilled', color: Color.Orange }
        case 'restocked':
            return { label: 'Restocked', color: Color.Grey }
        default:
            return { label: 'Unknown', color: Color.Grey }
    }
}
