import {Connection, Device} from 'twilio-client'

import {mockIncomingConnection, mockDevice} from '../../../tests/twilioMocks'

import {
    SET_TWILIO_CONNECTION,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RINGING,
} from '../constants'
import {setConnection, setDevice, setIsDialing, setIsRinging} from '../actions'

describe('Twilio actions', () => {
    describe('setDevice()', () => {
        const device = mockDevice() as Device

        it.each([device, null])(
            'should return action with the given device',
            (device) => {
                const action = setDevice(device)

                expect(action).toEqual({
                    type: SET_TWILIO_DEVICE,
                    payload: device,
                })
            }
        )
    })

    describe('setConnection()', () => {
        const connection = mockIncomingConnection() as Connection

        it.each([connection, null])(
            'should return action with the given connection',
            (connection) => {
                const action = setConnection(connection)

                expect(action).toEqual({
                    type: SET_TWILIO_CONNECTION,
                    payload: connection,
                })
            }
        )
    })

    describe('setIsDialing()', () => {
        it.each([true, false])(
            'should return action with the given boolean value',
            (isDialing) => {
                const action = setIsDialing(isDialing)

                expect(action).toEqual({
                    type: SET_TWILIO_IS_DIALING,
                    payload: isDialing,
                })
            }
        )
    })

    describe('setIsRinging()', () => {
        it.each([true, false])(
            'should return action with the given boolean value',
            (isRinging) => {
                const action = setIsRinging(isRinging)

                expect(action).toEqual({
                    type: SET_TWILIO_IS_RINGING,
                    payload: isRinging,
                })
            }
        )
    })
})
