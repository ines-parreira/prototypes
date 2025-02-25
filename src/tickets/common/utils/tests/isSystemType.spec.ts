import { SYSTEM_SOURCE_TYPES } from 'tickets/common/config'

import isSystemType from '../isSystemType'

describe('isSystemType', () => {
    it('is correct', () => {
        const validTypes = SYSTEM_SOURCE_TYPES
        const invalidTypes: any[] = ['test', 123, undefined, null, {}, []]

        validTypes.forEach((type) => {
            expect(isSystemType(type)).toEqual(true)
        })

        invalidTypes.forEach((type: any) => {
            expect(isSystemType(type)).toEqual(false)
        })
    })
})
