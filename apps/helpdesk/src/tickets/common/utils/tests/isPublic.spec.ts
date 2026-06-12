import { isBoolean } from '@gorgias/toolkit'
import { isPublic } from '../isPublic'

describe('isPublic', () => {
    it('is boolean', () => {
        const values: any[] = ['email', 'unknown-value', 1, undefined, null, []]

        values.forEach((value: any) => {
            expect(isBoolean(isPublic(value))).toBe(true)
        })
    })
})
