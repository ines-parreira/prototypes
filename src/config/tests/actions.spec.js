//@flow
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import * as actionsConfig from '../actions.ts'

describe('Config: actions', () => {
    describe('triggers', () => {
        const {actions} = actionsConfig

        it('is array', () => {
            expect(_isArray(actions)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(actions[0])).toBe(true)
        })

        it('structure of objects', () => {
            const object = actions[0]
            expect(object).toHaveProperty('name')
            expect(object).toHaveProperty('label')
        })
    })

    describe('getActionByName', () => {
        it('returns correct config', () => {
            const config = actionsConfig.actions[0]

            expect(actionsConfig.getActionByName(config.name)).toEqual(config)
        })
    })
})
