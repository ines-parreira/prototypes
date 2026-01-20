import { describe, expect, it } from 'vitest'

import type { DurationUnit } from '@gorgias/helpdesk-queries'

import { DURATION_OPTIONS } from '../../constants'
import { findDurationOption } from '../findDurationOption'

const CUSTOM_OPTION = DURATION_OPTIONS[DURATION_OPTIONS.length - 1]

describe('findDurationOption', () => {
    it('should return unlimited option when both unit and value are null', () => {
        expect(findDurationOption(null, null)).toEqual(DURATION_OPTIONS[0])
    })

    it.each([
        ['minutes', 15, DURATION_OPTIONS[1]],
        ['minutes', 30, DURATION_OPTIONS[2]],
        ['hours', 1, DURATION_OPTIONS[3]],
        ['hours', 4, DURATION_OPTIONS[4]],
    ] as const)(
        'should find preset option for %s %i',
        (unit, value, expected) => {
            expect(findDurationOption(unit, value)).toEqual(expected)
        },
    )

    it.each([
        ['non-preset minutes', 'minutes', 45],
        ['non-preset hours', 'hours', 2],
        ['days unit', 'days', 7],
        ['large minutes', 'minutes', 1440],
        ['large hours', 'hours', 24],
        ['unit null but value present', null, 15],
        ['value null but unit present', 'minutes', null],
        ['zero value', 'minutes', 0],
        ['negative value', 'hours', -1],
    ] as const)(
        'should return custom option for %s',
        (_, unit: DurationUnit | null, value) => {
            expect(findDurationOption(unit, value)).toEqual(CUSTOM_OPTION)
        },
    )
})
