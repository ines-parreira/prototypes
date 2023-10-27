import {VARIABLES} from 'tickets/common/config'

import getVariableWithValue from '../getVariableWithValue'

describe('getVariableWithValue', () => {
    it('undefined if unknown value', () => {
        const invalidValues: any[] = [undefined, null, 'unknown-variable']

        invalidValues.forEach((value: any) => {
            expect(getVariableWithValue(value)).toBe(undefined)
        })
    })

    it('returns correct config object', () => {
        const config = VARIABLES[0].children && VARIABLES[0].children[0]
        if (!config) {
            throw new Error('config is undefined')
        }
        const result = getVariableWithValue(config.value)

        expect(result).toHaveProperty('name', config.name)
        expect(result).toHaveProperty('value', config.value)
        expect(result).toHaveProperty('fullName', config.fullName)
    })
})
