import { describe, expect, it } from 'vitest'

import { Color } from '@gorgias/axiom'

import { FulfillmentStatus } from '../../types'
import { getFulfillmentStatusInfo } from '../getFulfillmentStatusInfo'

describe('getFulfillmentStatusInfo', () => {
    it.each([
        [null, 'Unfulfilled', Color.Grey],
        [FulfillmentStatus.Fulfilled, 'Fulfilled', Color.Green],
        [FulfillmentStatus.Partial, 'Partially fulfilled', Color.Orange],
        [FulfillmentStatus.Restocked, 'Restocked', Color.Grey],
        ['unknown' as FulfillmentStatus, 'Unknown', Color.Grey],
    ])(
        'should return "%s" label with %s color for %s status',
        (status, expectedLabel, expectedColor) => {
            const result = getFulfillmentStatusInfo(status)
            expect(result).toEqual({
                label: expectedLabel,
                color: expectedColor,
            })
        },
    )
})
