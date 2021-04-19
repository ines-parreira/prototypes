import {Connection, Device} from 'twilio-client'

import {mockConnection, mockDevice} from '../../../tests/twilioMocks'

import {
    SET_TWILIO_CONNECTION,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_RINGING,
} from '../constants'
import reducer, {initialState} from '../reducers'

describe('Twilio reducer', () => {
    describe('SET_TWILIO_DEVICE', () => {
        it('should set device', () => {
            const device = mockDevice() as Device
            const action = {
                type: SET_TWILIO_DEVICE,
                payload: device,
            }
            const nextState = reducer(initialState, action)
            expect(nextState.device).toBe(device)
        })

        describe('SET_TWILIO_CONNECTION', () => {
            it('should set connection', () => {
                const connection = mockConnection() as Connection
                const action = {
                    type: SET_TWILIO_CONNECTION,
                    payload: connection,
                }
                const nextState = reducer(initialState, action)
                expect(nextState.connection).toBe(connection)
            })
        })

        describe('SET_TWILIO_IS_RINGING', () => {
            it('should set ringing state', () => {
                const action = {
                    type: SET_TWILIO_IS_RINGING,
                    payload: true,
                }
                const nextState = reducer(initialState, action)
                expect(nextState.isRinging).toBe(true)
            })
        })
    })
})
