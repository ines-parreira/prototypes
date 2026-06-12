import { isArray, isObject } from '@gorgias/toolkit'
import { joinEvents } from '../joinEvents'

describe('joinEvents', () => {
    it('is array', () => {
        expect(isArray(joinEvents)).toBe(true)
    })

    it('is array of objects', () => {
        expect(isObject(joinEvents[0])).toBe(true)
    })

    it('structure of objects', () => {
        joinEvents.forEach((event) => {
            expect(event).toHaveProperty('name')
            expect(event).toHaveProperty('dataToSend')

            const dataToSend = event.dataToSend()
            expect(isObject(dataToSend)).toBe(true)
            expect(dataToSend).toHaveProperty('dataType')
            expect(dataToSend).toHaveProperty('data')
        })
    })
})
