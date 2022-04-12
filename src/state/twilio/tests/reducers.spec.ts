import {Call, Device} from '@twilio/voice-sdk'

import {mockIncomingCall, mockDevice} from 'tests/twilioMocks'

import {
    SET_TWILIO_CALL,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RINGING,
    SET_TWILIO_PREFLIGHT_CHECK_STATUS,
} from 'state/twilio/constants'
import {PreflightCheckStatus} from 'state/twilio/types'
import reducer, {initialState} from 'state/twilio/reducers'

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

        describe('SET_TWILIO_CALL', () => {
            it('should set call', () => {
                const call = mockIncomingCall() as Call
                const action = {
                    type: SET_TWILIO_CALL,
                    payload: call,
                }
                const nextState = reducer(initialState, action)
                expect(nextState.call).toBe(call)
            })
        })

        describe('SET_TWILIO_IS_DIALING', () => {
            it('should set dialing state', () => {
                const action = {
                    type: SET_TWILIO_IS_DIALING,
                    payload: true,
                }
                const nextState = reducer(initialState, action)
                expect(nextState.isDialing).toBe(true)
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

        describe('SET_TWILIO_PREFLIGHT_CHECK_STATUS', () => {
            it('should set the preflight status', () => {
                const action = {
                    type: SET_TWILIO_PREFLIGHT_CHECK_STATUS,
                    payload: PreflightCheckStatus.Running,
                }
                const nextState = reducer(initialState, action)
                expect(nextState.preflightCheckStatus).toBe(
                    PreflightCheckStatus.Running
                )
            })
        })
    })
})
