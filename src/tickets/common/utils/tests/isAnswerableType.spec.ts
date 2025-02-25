import { USABLE_SOURCE_TYPES } from 'tickets/common/config'

import isAnswerableType from '../isAnswerableType'

describe('isAnswerableType', () => {
    it('is correct', () => {
        const validTypes = USABLE_SOURCE_TYPES
        const invalidTypes = ['test', 123, undefined, null, {}, []]

        validTypes.forEach((type) => {
            expect(isAnswerableType(type)).toEqual(true)
        })

        invalidTypes.forEach((type: any) => {
            expect(isAnswerableType(type)).toEqual(false)
        })
    })
})
