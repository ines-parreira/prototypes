import { isArray, isObject } from '@gorgias/toolkit'
import { sendEvents } from '../sendEvents'

describe('sendEvents', () => {
    it('is array', () => {
        expect(isArray(sendEvents)).toBe(true)
    })

    it('is array of objects', () => {
        expect(isObject(sendEvents[0])).toBe(true)
    })

    it('structure of objects', () => {
        sendEvents.forEach((event) => {
            expect(event).toHaveProperty('name')
            expect(event).toHaveProperty('dataToSend')

            const dataToSend = event.dataToSend()
            expect(isObject(dataToSend)).toBe(true)
            expect(dataToSend).toHaveProperty('event')
        })
    })
})
