//@flow
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import * as rulesConfig from '../rules.ts'

describe('Config: rules', () => {
    describe('triggers', () => {
        const events = rulesConfig.events.toJS()

        it('is array', () => {
            expect(_isArray(events)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(events[0])).toBe(true)
        })

        it('structure of objects', () => {
            const object = events[0]
            expect(object).toHaveProperty('value')
            expect(object).toHaveProperty('label')
        })
    })
})
