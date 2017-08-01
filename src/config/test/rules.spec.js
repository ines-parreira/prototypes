import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import * as rulesConfig from '../rules'

describe('Config: rules', () => {
    describe('triggers', () => {
        const {triggers} = rulesConfig

        it('is array', () => {
            expect(_isArray(triggers)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(triggers[0])).toBe(true)
        })

        it('structure of objects', () => {
            const object = triggers[0]
            expect(object).toHaveProperty('name')
            expect(object).toHaveProperty('event')
        })
    })
})
