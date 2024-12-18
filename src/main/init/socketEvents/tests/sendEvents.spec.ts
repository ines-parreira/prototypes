import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import sendEvents from '../sendEvents'

describe('sendEvents', () => {
    it('is array', () => {
        expect(_isArray(sendEvents)).toBe(true)
    })

    it('is array of objects', () => {
        expect(_isObject(sendEvents[0])).toBe(true)
    })

    it('structure of objects', () => {
        sendEvents.forEach((event) => {
            expect(event).toHaveProperty('name')
            expect(event).toHaveProperty('dataToSend')

            const dataToSend = event.dataToSend()
            expect(_isObject(dataToSend)).toBe(true)
            expect(dataToSend).toHaveProperty('event')
        })
    })
})
