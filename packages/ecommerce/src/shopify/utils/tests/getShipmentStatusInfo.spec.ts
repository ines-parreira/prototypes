import { describe, expect, it } from 'vitest'

import { Color } from '@gorgias/axiom'

import { getShipmentStatusInfo } from '../getShipmentStatusInfo'

describe('getShipmentStatusInfo', () => {
    it.each([
        [null, null],
        [undefined, null],
    ])('should return null for %s status', (status, expected) => {
        expect(getShipmentStatusInfo(status)).toBe(expected)
    })

    it.each([
        ['label_printed', 'Label printed', Color.Grey],
        ['label_purchased', 'Label purchased', Color.Grey],
        ['confirmed', 'Confirmed', Color.Grey],
        ['in_transit', 'In transit', Color.Grey],
        ['out_for_delivery', 'Out for delivery', Color.Grey],
        ['ready_for_pickup', 'Ready for pickup', Color.Grey],
        ['attempted_delivery', 'Attempted delivery', Color.Orange],
        ['delivered', 'Delivered', Color.Green],
        ['failure', 'Failure', Color.Red],
    ])(
        'should return "%s" with label "%s" and color %s',
        (status, expectedLabel, expectedColor) => {
            expect(getShipmentStatusInfo(status)).toEqual({
                label: expectedLabel,
                color: expectedColor,
            })
        },
    )

    it('should return grey with humanized label for unknown statuses', () => {
        expect(getShipmentStatusInfo('some_new_status')).toEqual({
            label: 'Some new status',
            color: Color.Grey,
        })
    })
})
