import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import getVariablesList from '../getVariablesList'

describe('getVariablesList', () => {
    const list = getVariablesList()

    it('is array', () => {
        expect(_isArray(list)).toBe(true)
    })

    it('is array of objects', () => {
        expect(_isObject(list[0])).toBe(true)
    })

    it('structure of objects', () => {
        const object = list[0]
        expect(object).toHaveProperty('name')
        expect(object).toHaveProperty('value')
        expect(object).toHaveProperty('fullName')
    })
})
