import { describe, expect, it } from 'vitest'

import { Color } from '@gorgias/axiom'

import { FinancialStatus } from '../../types'
import { getFinancialStatusInfo } from '../getFinancialStatusInfo'

describe('getFinancialStatusInfo', () => {
    it.each([
        [FinancialStatus.Paid, 'Paid', Color.Green],
        [FinancialStatus.Pending, 'Pending', Color.Orange],
        [FinancialStatus.PartiallyPaid, 'Partially paid', Color.Orange],
        [FinancialStatus.Refunded, 'Refunded', Color.Grey],
        [FinancialStatus.Voided, 'Voided', Color.Grey],
        [FinancialStatus.PartiallyRefunded, 'Partially refunded', Color.Orange],
        ['unknown' as FinancialStatus, 'Unknown', Color.Red],
    ])(
        'should return "%s" label with %s color for %s status',
        (status, expectedLabel, expectedColor) => {
            const result = getFinancialStatusInfo(status)
            expect(result).toEqual({
                label: expectedLabel,
                color: expectedColor,
            })
        },
    )
})
