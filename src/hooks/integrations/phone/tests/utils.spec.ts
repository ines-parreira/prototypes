import {EventEmitter} from 'events'
import {fromJS} from 'immutable'
import {Call, Device} from '@twilio/voice-sdk'
import {waitFor} from '@testing-library/react'

import {reportError} from 'utils/errors'
import {
    TwilioErrorCode,
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
import * as envUtils from 'utils/environment'
import {ActivityEvents} from 'services/activityTracker'
import {appQueryClient} from 'api/queryClient'
import {VoiceDeviceActions} from 'pages/integrations/integration/components/voice/types'
import slice from 'pages/integrations/integration/components/voice/voiceDeviceSlice'

jest.mock('utils/errors')
jest.mock('@twilio/voice-sdk')
jest.mock('services/activityTracker')
jest.mock('api/queryClient')

const getLDClientSpy = jest.spyOn(LDUtils, 'getLDClient')

const dispatch = jest.fn()
const device = {
    on: jest.fn(),
    register: jest.fn(),
    updateToken: jest.fn(),
} as unknown as Device

const actions = Object.keys(slice.actions).reduce(
    (acc, key) => ({
        ...acc,
        [key]: jest.fn(),
    }),
    {}
) as VoiceDeviceActions

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

    it('should fail and report error if the proto is not HTTPs and env is production', async () => {
        Object.defineProperty(window, 'location', {
            value: new URL('http://test'),
        })
        jest.spyOn(envUtils, 'isProduction').mockReturnValueOnce(true)

        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.HttpsProtoRequired
        )

        void connectDevice(dispatch, 0, actions)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(actions.setIsConnecting).toHaveBeenCalledWith(true)
            expect(actions.incrementReconnectAttempts).toHaveBeenCalled()
            expect(actions.setError).toHaveBeenCalledWith(expectedError)
            expect(actions.setIsConnecting).toHaveBeenCalledWith(false)
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should fail and report error if there are too many failed attempts', async () => {
        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.TooManyReconnectionAttepts
        )

        void connectDevice(dispatch, 6, actions)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(actions.setIsConnecting).toHaveBeenCalledWith(true)
            expect(actions.incrementReconnectAttempts).toHaveBeenCalled()
            expect(actions.setError).toHaveBeenCalledWith(expectedError)
            expect(actions.setIsConnecting).toHaveBeenCalledWith(false)
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should fail and report error if it cannot obtain a token', async () => {
        const expectedError = new VoiceAppError(
            VoiceAppErrorCode.MissingOrInvalidToken
        )

        jest.spyOn(api, 'getToken').mockReturnValue(Promise.resolve(null))

        void connectDevice(dispatch, 0, actions)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(actions.setIsConnecting).toHaveBeenCalledWith(true)
            expect(actions.incrementReconnectAttempts).toHaveBeenCalled()
            expect(actions.setError).toHaveBeenCalledWith(expectedError)
            expect(actions.setIsConnecting).toHaveBeenCalledWith(false)
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })
    })

    it('should set error when getting the token fails', async () => {
        jest.spyOn(api, 'getToken').mockReturnValue(Promise.reject())

        void connectDevice(dispatch, 0, actions)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(actions.setIsConnecting).toHaveBeenCalledWith(true)
            expect(actions.incrementReconnectAttempts).toHaveBeenCalled()
            expect(actions.setError).toHaveBeenCalledTimes(1)
            expect(actions.setIsConnecting).toHaveBeenCalledWith(false)
        })
    })

    it('should implement an exponential backoff for connections', () => {
        const sleep = jest.spyOn(utils, 'sleep')

        void connectDevice(dispatch, 1, actions)
        expect(sleep).toHaveBeenCalledWith(5000)

        void connectDevice(dispatch, 2, actions)
        expect(sleep).toHaveBeenCalledWith(10000)

        void connectDevice(dispatch, 5, actions)
        expect(sleep).toHaveBeenCalledWith(25000)
    })

    it('should create, set and register the device', async () => {
        jest.spyOn(utils, 'createDevice').mockReturnValue(device)

        const register = jest.spyOn(utils, 'registerDevice')

        void connectDevice(dispatch, 0, actions)
        jest.advanceTimersToNextTimer()

        await waitFor(() => {
            expect(actions.setIsConnecting).toHaveBeenCalledWith(true)
            expect(actions.incrementReconnectAttempts).toHaveBeenCalled()
            expect(actions.setDevice).toHaveBeenCalledWith(device)
            expect(actions.setIsConnecting).toHaveBeenCalledWith(false)
            expect(register).toHaveBeenCalledWith(device, dispatch, actions)
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
        void disconnectDevice(
            {
                ...device,
                state: Device.State.Registered,
            } as Device,
            actions
        )

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(1)
            expect(device.unregister).toHaveBeenCalledTimes(1)
            expect(device.destroy).toHaveBeenCalledTimes(1)
            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(actions.setDevice).toHaveBeenCalledWith(null)
        })
    })

    it('should not call disconnect and unregister if the device is unregistered', async () => {
        void disconnectDevice(
            {
                ...device,
                state: Device.State.Unregistered,
            } as Device,
            actions
        )

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(0)
            expect(device.unregister).toHaveBeenCalledTimes(0)

            expect(device.destroy).toHaveBeenCalledTimes(1)
            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(actions.setDevice).toHaveBeenCalledWith(null)
        })
    })

    it('should only remove listeners and clear the redux state if the device is already destroyed', async () => {
        void disconnectDevice(
            {
                ...device,
                state: Device.State.Destroyed,
            } as Device,
            actions
        )

        await waitFor(() => {
            expect(device.disconnectAll).toHaveBeenCalledTimes(0)
            expect(device.unregister).toHaveBeenCalledTimes(0)
            expect(device.destroy).toHaveBeenCalledTimes(0)

            expect(device.removeAllListeners).toHaveBeenCalledTimes(1)
            expect(actions.setDevice).toHaveBeenCalledWith(null)
        })
    })
})

describe('registerDevice', () => {
    it('should register the device and bind the event handlers', async () => {
        const handleDeviceEvents = jest.spyOn(utils, 'handleDeviceEvents')

        void registerDevice(device, dispatch, actions)

        await waitFor(() => {
            expect(device.register).toHaveBeenCalledTimes(1)
            expect(handleDeviceEvents).toHaveBeenCalledWith(
                device,
                dispatch,
                actions
            )
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
            handleDeviceEvents(device as Device, dispatch, actions)
        })

        it('should handle Device.EventName.Registered event', () => {
            device.emit(Device.EventName.Registered)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.DeviceRegistered,
            })

            expect(actions.setError).toHaveBeenCalledWith(null)
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

            expect(actions.setError).toHaveBeenCalledWith(expectedError)
            expect(reportError).toHaveBeenCalledWith(expectedError)
        })

        it('should handle Device.EventName.Error event with a Twilio error', async () => {
            const disconnectDeviceSpy = jest.spyOn(utils, 'disconnectDevice')
            const expectedError = {
                code: TwilioErrorCode.AuthorizationAccessTokenInvalid,
            }

            device.emit(Device.EventName.Error, expectedError)

            await waitFor(() => {
                expect(disconnectDeviceSpy).toHaveBeenCalled()
            })
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

            expect(actions.setIsRinging).toHaveBeenCalledWith(true)
            expect(actions.setCall).toHaveBeenCalledWith(call)
            expect(handleCallEvents).toHaveBeenCalledWith(
                call,
                dispatch,
                actions
            )
        })

        it('should handle Device.EventName.Incoming event when the device is busy', () => {
            const call = {
                direction: Call.CallDirection.Incoming,
                parameters: {
                    From: '123',
                },
                customParameters: fromJS({
                    call_sid: '123',
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
            expect(actions.setIsRinging).not.toHaveBeenCalledWith(true)
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
            handleCallEvents(call as Call, dispatch, actions)
        })

        it('should handle "accept" event', () => {
            jest.spyOn(global, 'setTimeout')

            call.emit('accept')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallAccepted,
                data: callContext,
            })

            expect(actions.setIsRinging).toHaveBeenCalledWith(false)
            expect(actions.setIsDialing).toHaveBeenCalledWith(false)
            expect(setTimeout).toHaveBeenCalled()
        })

        it('should handle "reject" event', () => {
            call.emit('reject')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallRejected,
                data: callContext,
            })

            expect(actions.setCall).toHaveBeenCalledWith(null)
            expect(actions.setIsRinging).toHaveBeenCalledWith(false)
            expect(actions.setIsDialing).toHaveBeenCalledWith(false)
            expect(actions.setWarning).toHaveBeenCalledWith(null)
        })

        it('should handle "cancel" event', () => {
            call.emit('cancel')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallCancelled,
                data: callContext,
            })

            expect(actions.setCall).toHaveBeenCalledWith(null)
            expect(actions.setIsRinging).toHaveBeenCalledWith(false)
            expect(actions.setIsDialing).toHaveBeenCalledWith(false)
            expect(actions.setWarning).toHaveBeenCalledWith(null)
            expect(cancelCall).toHaveBeenCalledWith(call)
        })

        it('should handle "disconnect" event and log event', () => {
            call.emit('disconnect')

            expect(logCallEndSpy).toHaveBeenCalledWith(call)

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallDisconnected,
                data: callContext,
            })

            expect(actions.setCall).toHaveBeenCalledWith(null)
            expect(actions.setIsRinging).toHaveBeenCalledWith(false)
            expect(actions.setIsDialing).toHaveBeenCalledWith(false)
            expect(actions.setWarning).toHaveBeenCalledWith(null)

            expect(disconnectCall).toHaveBeenCalledTimes(1)
        })

        it('should handle "reconnected" event', () => {
            call.emit('reconnected')

            expect(sendSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallReconnected,
                data: callContext,
            })

            expect(actions.setError).toHaveBeenCalledWith(null)
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

            expect(actions.setError).toHaveBeenCalledWith(expectedError)
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

            expect(actions.setWarning).toHaveBeenCalledWith(warning)
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

            expect(actions.setWarning).toHaveBeenCalledWith(null)
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

describe('logCallEnd', () => {
    it('should log the call end when call has a ticket_id param', () => {
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

    it('should log the call end when call does not have a ticket_id param, and look it up from query cache', () => {
        // reset original logCallEnd implementation
        const logCallEndSpy = jest.spyOn(utils, 'logCallEnd')
        logCallEndSpy.mockRestore()
        const logEventSpy = jest.spyOn(activityTracker, 'logActivityEvent')
        const getQueriesDataSpy = jest.spyOn(appQueryClient, 'getQueriesData')
        getQueriesDataSpy.mockReturnValue([
            [
                ['foo', 'bar', {ticket_id: 123456}],
                {data: [{external_id: 'CA123'}]},
            ],
        ])

        const call = {
            parameters: {CallSid: 'CA123'},
            direction: Call.CallDirection.Outgoing,
            customParameters: new Map(),
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
