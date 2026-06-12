import { isBoolean } from '@gorgias/toolkit'
import { isRichType } from '../isRichType'

describe('isRichType', () => {
    it('is boolean', () => {
        const values: any[] = [
            'email',
            'unknown-value',
            'chat',
            1,
            undefined,
            null,
            [],
        ]

        values.forEach((value: any) => {
            expect(isBoolean(isRichType(value))).toBe(true)
        })
    })
})
