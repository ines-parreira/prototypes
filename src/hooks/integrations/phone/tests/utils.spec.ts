import {EventEmitter} from 'events'
import {fromJS} from 'immutable'
import {Call, Device} from '@twilio/voice-sdk'
import {waitFor} from '@testing-library/react'

import {reportError} from 'utils/errors'
import {
    incrementReconnectAttempts,
    setCall,
    setDevice,
    setError,
    setIsConnecting,
    setIsDialing,
    setIsRinging,
    setWarning,
} from 'state/twilio/actions'
import {
    TwilioSocketEventType,
    VoiceAppError,
    VoiceAppErrorCode,
} from 'business/twilio'

import {
    generateCallId,
    getCallSid,
    refreshToken,
    connectDevice,
    disconnectDevice,
    registerDevice,
    handleDeviceEvents,
    handleCallEvents,
    handleAcceptedCallEvent,
    logCallEnd,
} from 'hooks/integrations/phone/utils'

import * as utils from 'hooks/integrations/phone/utils'
import * as api from 'hooks/integrations/phone/api'
import * as LDUtils from 'utils/launchDarkly'
import * as activityTracker from 'services/activityTracker'
import {ActivityEvents} from 'services/activityTracker'

jest.mock('utils/errors')
jest.mock('@twilio/voice-sdk')
jest.mock('services/activityTracker')

const getLDClientSpy = jest.spyOn(LDUtils, 'getLDClient')

const dispatch = jest.fn()
const device = {
    on: jest.fn(),
    register: jest.fn(),
    updateToken: jest.fn(),
} as unknown as Device

describe('refreshToken', () => {
    it('should update the device token', async () => {
        jest.spyOn(api, 'getToken').mockReturnValue(
            Promise.resolve('valid-jwt')
        )

        await refreshToken(device)

        expect(device.updateToken).toHaveBeenCalledWith('valid-jwt')
    })

    it('should report the error on failure', async () => {
        jest.spyOn(api, 'getToken').mockReturnValue(Promise.reject())

        await refreshToken(device)

        expect(device.updateToken).not.toHaveBeenCalled()
        expect(reportError).toHaveBeenCalledTimes(1)
    })
})

describe('connectDevice', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        Object.defineProperty(window, 'location', {
            value: new URL('https://test'),
        })
        jest.spyOn(api, 'getToken').mockReturnValue(
            Promise.resolve('valid-jwt')
        )
    })

    it('should fail and report error if the proto is not HTTPs', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://test'),
        })

        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.HttpsProtoRequired
        )

        void connectDevice(dispatch, 0)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting())
            expect(dispatch).toHaveBeenCalledWith(incrementReconnectAttempts())
            expect(dispatch).toHaveBeenCalledWith(setError(expectedError))
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting(false))
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should fail and report error if there are too many failed attempts', async () => {
        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.TooManyReconnectionAttepts
        )

        void connectDevice(dispatch, 6)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting())
            expect(dispatch).toHaveBeenCalledWith(incrementReconnectAttempts())
            expect(dispatch).toHaveBeenCalledWith(setError(expectedError))
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting(false))
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should fail and report error if it cannot obtain a token', async () => {
        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.MissingOrInvalidToken
        )

        jest.spyOn(api, 'getToken').mockReturnValue(Promise.resolve(null))

        void connectDevice(dispatch, 0)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting())
            expect(dispatch).toHaveBeenCalledWith(incrementReconnectAttempts())
            expect(dispatch).toHaveBeenCalledWith(setError(expectedError))
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting(false))
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should implement an exponential backoff for connections', () => {
        const sleep = jest.spyOn(utils, 'sleep')

        void connectDevice(dispatch, 1)
        expect(sleep).toHaveBeenCalledWith(5000)

        void connectDevice(dispatch, 2)
        expect(sleep).toHaveBeenCalledWith(10000)

        void connectDevice(dispatch, 5)
        expect(sleep).toHaveBeenCalledWith(25000)
    })

    it('should create, set and register the device', async () => {
        jest.spyOn(utils, 'createDevice').mockReturnValue(device)

        const register = jest.spyOn(utils, 'registerDevice')

        void connectDevice(dispatch, 0)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting())
            expect(dispatch).toHaveBeenCalledWith(incrementReconnectAttempts())
            expect(dispatch).toHaveBeenCalledWith(setDevice(device))
            expect(dispatch).toHaveBeenCalledWith(setIsConnecting(false))
            expect(register).toHaveBeenCalledWith(device, dispatch)
        })
    })
})

describe('disconnectDevice', () => {
    const device = {
        disconnectAll: jest.fn(),
        unregister: jest.fn(),
        destroy: jest.fn(),
        removeAllListeners: jest.fn(),
    } as unknown as Device

    it('should disconnect, unregister, destroy device and remove listeners', async () => {
        void disconnectDevice(dispatch, {
            ...device,
            state: Device.State.Registered,
        } as Device)

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(1)
            expect(device.unregister).toHaveBeenCalledTimes(1)
            expect(device.destroy).toHaveBeenCalledTimes(1)
            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(dispatch).toHaveBeenCalledWith(setDevice(null))
        })
    })

    it('should not call disconnect and unregister if the device is unregistered', async () => {
        void disconnectDevice(dispatch, {
            ...device,
            state: Device.State.Unregistered,
        } as Device)

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(0)
            expect(device.unregister).toHaveBeenCalledTimes(0)

            expect(device.destroy).toHaveBeenCalledTimes(1)
            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(dispatch).toHaveBeenCalledWith(setDevice(null))
        })
    })

    it('should only remove listeners and clear the redux state if the device is already destroyed', async () => {
        void disconnectDevice(dispatch, {
            ...device,
            state: Device.State.Destroyed,
        } as Device)

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(0)
            expect(device.unregister).toHaveBeenCalledTimes(0)
            expect(device.destroy).toHaveBeenCalledTimes(0)

            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(dispatch).toHaveBeenCalledWith(setDevice(null))
        })
    })
})

describe('registerDevice', () => {
    it('should register the device and bind the event handlers', async () => {
        const handleDeviceEvents = jest.spyOn(utils, 'handleDeviceEvents')

        void registerDevice(device, dispatch)

        await waitFor(() => {
            expect(device.register).toHaveBeenCalledTimes(1)
            expect(handleDeviceEvents).toHaveBeenCalledWith(device, dispatch)
        })
    })
})

describe('handleDeviceEvents', () => {
    describe('should handle required events', () => {
        const device: EventEmitter = new EventEmitter()

        const sendSocketEvent = jest
            .spyOn(utils, 'sendTwilioSocketEvent')
            .mockReturnValue()
        const refreshToken = jest.spyOn(utils, 'refreshToken')
        const handleCallEvents = jest.spyOn(utils, 'handleCallEvents')

        beforeAll(() => {
            handleDeviceEvents(device as Device, dispatch)
        })

        it('should handle Device.EventName.Registered event', () => {
            device.emit(Device.EventName.Registered)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.DeviceRegistered,
            })

            expect(dispatch).toHaveBeenCalledWith(setError(null))
        })

        it('should handle Device.EventName.Error event', () => {
            const expectedError = new Error('Device Error')
            device.emit(Device.EventName.Error, expectedError)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.DeviceError,
                data: {
                    error: expectedError,
                },
            })

            expect(dispatch).toHaveBeenCalledWith(setError(expectedError))
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })

        it('should handle Device.EventName.Unregistered event', () => {
            device.emit(Device.EventName.Unregistered)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.DeviceUnregistered,
            })
        })

        it('should handle Device.EventName.TokenWillExpire event', () => {
            device.emit(Device.EventName.TokenWillExpire)

            expect(refreshToken).toHaveBeenCalledTimes(1)
        })

        it('should handle Device.EventName.Incoming event', () => {
            const call = {
                direction: Call.CallDirection.Incoming,
                parameters: {
                    From: '123',
                },
                customParameters: fromJS({
                    call_sid: '123',
                }),
                on: jest.fn(),
            } as unknown as Call

            device.emit(Device.EventName.Incoming, call)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallIncoming,
                data: {
                    id: '287e7e8b7dab338ad09de87eb69d0bc0fb82b6a0db4387628cb43d7b07323bf9',
                    call_sid: '123',
                },
            })

            expect(dispatch).toHaveBeenCalledWith(setIsRinging(true))
            expect(dispatch).toHaveBeenCalledWith(setCall(call))
            expect(handleCallEvents).toHaveBeenCalledWith(call, dispatch)
        })

        it('should handle Device.EventName.Incoming event when the device is busy and reject_call_on_decline is false', () => {
            const call = {
                direction: Call.CallDirection.Incoming,
                parameters: {
                    From: '123',
                },
                customParameters: fromJS({
                    call_sid: '123',
                    reject_call_on_decline: 'false',
                }),
                on: jest.fn(),
                reject: jest.fn(),
                ignore: jest.fn(),
                emit: jest.fn(),
            } as unknown as Call

            ;(device as EventEmitter & {isBusy: boolean}).isBusy = true
            jest.spyOn(api, 'declineCall')
            device.emit(Device.EventName.Incoming, call)

            expect(call.ignore).toHaveBeenCalled()
            expect(call.emit).toHaveBeenCalledWith('cancel')
            expect(api.declineCall).toHaveBeenCalledWith(call)
            expect(reportError).toHaveBeenCalledTimes(1)

            expect(call.reject).not.toHaveBeenCalled()
            expect(dispatch).not.toHaveBeenCalledWith(setIsRinging(true))
            expect(dispatch).not.toHaveBeenCalledWith(setCall(call))
            expect(handleCallEvents).not.toHaveBeenCalledWith(call, dispatch)
        })

        it('should handle Device.EventName.Incoming event when the device is busy and reject_call_on_decline is true', () => {
            const call = {
                direction: Call.CallDirection.Incoming,
                parameters: {
                    From: '123',
                },
                customParameters: fromJS({
                    call_sid: '123',
                    reject_call_on_decline: 'true',
                }),
                on: jest.fn(),
                reject: jest.fn(),
                ignore: jest.fn(),
                emit: jest.fn(),
            } as unknown as Call

            getLDClientSpy.mockReturnValueOnce({
                variation: () => true,
            } as any)
            ;(device as EventEmitter & {isBusy: boolean}).isBusy = true
            device.emit(Device.EventName.Incoming, call)

            expect(call.reject).toHaveBeenCalled()
            expect(reportError).toHaveBeenCalledTimes(1)

            expect(call.ignore).not.toHaveBeenCalled()
            expect(dispatch).not.toHaveBeenCalledWith(setIsRinging(true))
        })
    })
})

describe('handleCallEvents', () => {
    describe('should handle required events', () => {
        const call: EventEmitter = new EventEmitter()

        const sendSocketEvent = jest
            .spyOn(utils, 'sendTwilioSocketEvent')
            .mockReturnValue()
        const cancelCall = jest.spyOn(api, 'cancelCall')
        const disconnectCall = jest.spyOn(api, 'disconnectCall')
        const logCallEndSpy = jest.spyOn(utils, 'logCallEnd').mockReturnValue()

        const callContext = {
            call_sid: undefined,
            id: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        }

        beforeAll(() => {
            handleCallEvents(call as Call, dispatch)
        })

        it('should handle "accept" event', () => {
            jest.spyOn(global, 'setTimeout')

            call.emit('accept')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallAccepted,
                data: callContext,
            })

            expect(dispatch).toHaveBeenCalledWith(setIsRinging(false))
            expect(dispatch).toHaveBeenCalledWith(setIsDialing(false))
            expect(setTimeout).toHaveBeenCalled()
        })

        it('should handle "reject" event', () => {
            call.emit('reject')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallRejected,
                data: callContext,
            })

            expect(dispatch).toHaveBeenCalledWith(setCall(null))
            expect(dispatch).toHaveBeenCalledWith(setIsRinging(false))
            expect(dispatch).toHaveBeenCalledWith(setIsDialing(false))
            expect(dispatch).toHaveBeenCalledWith(setWarning(null))
        })

        it('should handle "cancel" event', () => {
            call.emit('cancel')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallCancelled,
                data: callContext,
            })

            expect(dispatch).toHaveBeenCalledWith(setCall(null))
            expect(dispatch).toHaveBeenCalledWith(setIsRinging(false))
            expect(dispatch).toHaveBeenCalledWith(setIsDialing(false))
            expect(dispatch).toHaveBeenCalledWith(setWarning(null))
            expect(cancelCall).toHaveBeenCalledWith(call)
        })

        it('should handle "disconnect" event and log event', () => {
            call.emit('disconnect')

            expect(logCallEndSpy).toHaveBeenCalledWith(call)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallDisconnected,
                data: callContext,
            })

            expect(dispatch).toHaveBeenCalledWith(setCall(null))
            expect(dispatch).toHaveBeenCalledWith(setIsRinging(false))
            expect(dispatch).toHaveBeenCalledWith(setIsDialing(false))
            expect(dispatch).toHaveBeenCalledWith(setWarning(null))

            expect(disconnectCall).toHaveBeenCalledTimes(1)
        })

        it('should handle "reconnected" event', () => {
            call.emit('reconnected')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallReconnected,
                data: callContext,
            })

            expect(dispatch).toHaveBeenCalledWith(setError(null))
        })

        it('should handle "error" event', () => {
            const expectedError = new Error('Call Error')
            call.emit('error', expectedError)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallError,
                data: {
                    ...callContext,
                    error: expectedError,
                },
            })

            expect(dispatch).toHaveBeenCalledWith(setError(expectedError))
        })

        it('should handle "warning" event', () => {
            const warning = 'high-latency'
            call.emit('warning', warning)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallWarningStarted,
                data: {
                    metric_name: warning,
                    ...callContext,
                },
            })

            expect(dispatch).toHaveBeenCalledWith(setWarning(warning))
        })

        it('should handle "warning-cleared" event', () => {
            const warning = 'high-latency'
            call.emit('warning-cleared', warning)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallWarningEnded,
                data: {
                    metric_name: warning,
                    ...callContext,
                },
            })

            expect(dispatch).toHaveBeenCalledWith(setWarning(null))
        })
    })
})

describe('handleAcceptedCallEvent', () => {
    const cancelCall = jest.spyOn(api, 'cancelCall')
    const acceptCall = jest.spyOn(api, 'acceptCall')

    it('should be skipped if call is outgoing', () => {
        const call = {
            direction: Call.CallDirection.Outgoing,
        } as unknown as Call

        handleAcceptedCallEvent(call, dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    it('should be skipped if call is (already) closed', () => {
        const call = {
            status: () => Call.State.Closed,
        } as unknown as Call

        handleAcceptedCallEvent(call, dispatch)

        expect(cancelCall).toHaveBeenCalled()
    })

    it('should handle accept call and trigger appropriate API and tracking calls', () => {
        const logEventSpy = jest.spyOn(activityTracker, 'logActivityEvent')

        const call = {
            status: () => Call.State.Open,
            customParameters: new Map([['ticket_id', '123456']]),
        } as unknown as Call

        handleAcceptedCallEvent(call, dispatch)

        expect(acceptCall).toHaveBeenCalledWith(call)
        expect(logEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserStartedPhoneCall,
            {
                entityType: 'ticket',
                entityId: 123456,
            }
        )
    })
})

describe('generateCallId', () => {
    it('should generate an ID from an incoming call', () => {
        const call = {
            direction: Call.CallDirection.Incoming,
            parameters: {
                From: '+123',
            },
            customParameters: fromJS({
                to: '+456',
            }),
        } as unknown as Call

        expect(generateCallId(call)).toEqual(
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33'
        )
    })

    it('should generate an ID from an outgoing call', () => {
        const call = {
            direction: Call.CallDirection.Outgoing,
            customParameters: fromJS({
                From: '+123',
                To: '+456',
            }),
        } as unknown as Call

        expect(generateCallId(call)).toEqual(
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33'
        )
    })
})

describe('getCallSid', () => {
    it('should get the CallSid from an incoming call', () => {
        const call = {
            direction: Call.CallDirection.Incoming,
            customParameters: fromJS({
                call_sid: 'CA123',
            }),
        } as unknown as Call

        expect(getCallSid(call)).toEqual('CA123')
    })

    it('should get the CallSid from an outgoing call', () => {
        const call = {
            direction: Call.CallDirection.Outgoing,
            parameters: {
                CallSid: 'CA123',
            },
        } as unknown as Call

        expect(getCallSid(call)).toEqual('CA123')
    })
})

describe('logEndCall', () => {
    it('should log the call end', () => {
        // reset original logCallEnd implementation
        const logCallEndSpy = jest.spyOn(utils, 'logCallEnd')
        logCallEndSpy.mockRestore()

        const logEventSpy = jest.spyOn(activityTracker, 'logActivityEvent')
        const call = {
            customParameters: new Map([['ticket_id', '123456']]),
        } as unknown as Call

        logCallEnd(call)
        expect(logEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserFinishedPhoneCall,
            {
                entityType: 'ticket',
                entityId: 123456,
            }
        )
    })
})
