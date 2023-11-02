import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import {SocketEventType} from 'services/socketManager/types'

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

    it('Should stop typing when leaving ticket room', () => {
        const ticketJoinEvent = _find(joinEvents, {name: 'ticket'})

        class MockSocketManager {
            ticketOnLeaveJoinEvent = ticketJoinEvent
                ? ticketJoinEvent.onLeave
                : null
            send = jest.fn()
        }

        const mockSocketManager = new MockSocketManager()
        const ticketId = '1234'

        if (mockSocketManager.ticketOnLeaveJoinEvent) {
            mockSocketManager.ticketOnLeaveJoinEvent(ticketId)
        }

        expect(mockSocketManager.send).toHaveBeenCalledWith(
            SocketEventType.AgentTypingStopped,
            ticketId
        )
    })
})
