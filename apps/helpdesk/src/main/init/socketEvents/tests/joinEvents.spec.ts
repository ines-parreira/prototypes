import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import joinEvents from '../joinEvents'

describe('joinEvents', () => {
    it('is array', () => {
        expect(_isArray(joinEvents)).toBe(true)
    })

    it('is array of objects', () => {
        expect(_isObject(joinEvents[0])).toBe(true)
    })

    it('structure of objects', () => {
        joinEvents.forEach((event) => {
            expect(event).toHaveProperty('name')
            expect(event).toHaveProperty('dataToSend')

            const dataToSend = event.dataToSend()
            expect(_isObject(dataToSend)).toBe(true)
            expect(dataToSend).toHaveProperty('dataType')
            expect(dataToSend).toHaveProperty('data')
        })
    })
})
