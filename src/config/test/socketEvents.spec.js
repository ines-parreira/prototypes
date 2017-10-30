import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import * as socketEvents from '../socketEvents'

describe('Config: socketEvents', () => {
    describe('sendEvents', () => {
        const {sendEvents} = socketEvents

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

    describe('joinEvents', () => {
        const {joinEvents} = socketEvents

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

    describe('receivedEvents', () => {
        const {receivedEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(receivedEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(receivedEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            receivedEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('onReceive')
            })
        })
    })
})
