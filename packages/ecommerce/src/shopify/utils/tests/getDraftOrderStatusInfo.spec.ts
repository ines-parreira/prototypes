import { describe, expect, it } from 'vitest'

import { Color } from '@gorgias/axiom'

import { DraftStatus } from '../../types'
import { getDraftOrderStatusInfo } from '../getDraftOrderStatusInfo'

describe('getDraftOrderStatusInfo', () => {
    it.each([
        [DraftStatus.Open, 'Open', Color.Purple],
        [DraftStatus.InvoiceSent, 'Invoice sent', Color.Orange],
        [DraftStatus.Completed, 'Completed', Color.Green],
    ])(
        'returns "%s" label with %s color for %s status',
        (status, expectedLabel, expectedColor) => {
            const result = getDraftOrderStatusInfo(status)
            expect(result).toEqual({
                label: expectedLabel,
                color: expectedColor,
            })
        },
    )

    it('falls back to Open when status is undefined and invoiceSentAt is missing', () => {
        expect(getDraftOrderStatusInfo(undefined)).toEqual({
            label: 'Open',
            color: Color.Purple,
        })
    })

    it('falls back to Invoice sent when status is undefined but invoiceSentAt is present', () => {
        expect(
            getDraftOrderStatusInfo(undefined, '2024-01-15T10:00:00Z'),
        ).toEqual({
            label: 'Invoice sent',
            color: Color.Orange,
        })
    })

    it('treats null invoiceSentAt as Open when status is undefined', () => {
        expect(getDraftOrderStatusInfo(undefined, null)).toEqual({
            label: 'Open',
            color: Color.Purple,
        })
    })
})
