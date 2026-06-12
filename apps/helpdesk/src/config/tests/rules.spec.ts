import { isArray, isObject } from '@gorgias/toolkit'
import * as rulesConfig from '../rules'

describe('Config: rules', () => {
    describe('triggers', () => {
        const events = rulesConfig.events.toJS() as {
            label: string
            value: string
        }[]

        it('is array', () => {
            expect(isArray(events)).toBe(true)
        })

        it('is array of objects', () => {
            expect(isObject(events[0])).toBe(true)
        })

        it('structure of objects', () => {
            const object = events[0]
            expect(object).toHaveProperty('value')
            expect(object).toHaveProperty('label')
        })
    })
})
