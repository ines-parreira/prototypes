import _isBoolean from 'lodash/isBoolean'

import isRichType from '../isRichType'

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
            expect(_isBoolean(isRichType(value))).toBe(true)
        })
    })
})
