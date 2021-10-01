import {Call, Device} from '@twilio/voice-sdk'

import {mockIncomingCall, mockDevice} from '../../../tests/twilioMocks'

import {
    SET_TWILIO_CALL,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RINGING,
} from '../constants'
import {setCall, setDevice, setIsDialing, setIsRinging} from '../actions'

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

    describe('setCall()', () => {
        const call = mockIncomingCall() as Call

        it.each([call, null])(
            'should return action with the given call',
            (call) => {
                const action = setCall(call)

                expect(action).toEqual({
                    type: SET_TWILIO_CALL,
                    payload: call,
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
