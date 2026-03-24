import { Call } from '@twilio/voice-sdk'
import { EventEmitter } from 'events'
import { fromJS } from 'immutable'

import { appQueryClient } from 'api/queryClient'
import { TwilioSocketEventType } from 'business/twilio'
import * as api from 'hooks/integrations/phone/api'
import * as twilioCallUtils from 'hooks/integrations/phone/twilioCall.utils'
import {
    generateCallId,
    getCallSid,
    handleAcceptedCallEvent,
    handleCallEvents,
    logCallEnd,
} from 'hooks/integrations/phone/twilioCall.utils'
import type { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import slice from 'pages/integrations/integration/components/voice/voiceDeviceSlice'
import { ActivityEvents } from 'services/activityTracker'
import * as activityTracker from 'services/activityTracker'

jest.mock('common/notifications')
jest.mock('@repo/logging')
jest.mock('@twilio/voice-sdk')
jest.mock('services/activityTracker')
jest.mock('api/queryClient')

const dispatch = jest.fn()

const actions = Object.keys(slice.actions).reduce(
    (acc, key) => ({
        ...acc,
        [key]: jest.fn(),
    }),
    {},
) as VoiceDeviceActions

describe('handleCallEvents', () => {
    describe('should handle required events', () => {
        const call: EventEmitter = new EventEmitter()

        const callContext = {
            call_sid: undefined,
            id: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        }

        const sendTwilioSocketEvent = jest
            .spyOn(twilioCallUtils, 'sendTwilioSocketEvent')
            .mockImplementation(() => {})
        const cancelCall = jest.spyOn(api, 'cancelCall')
        const disconnectCall = jest.spyOn(api, 'disconnectCall')
        const logCallEndSpy = jest
            .spyOn(twilioCallUtils, 'logCallEnd')
            .mockImplementation(() => {})

        beforeAll(() => {
            handleCallEvents(call as Call, dispatch, actions)
        })

        it('should handle "accept" event', () => {
            jest.spyOn(global, 'setTimeout')

            call.emit('accept')

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallAccepted,
                data: callContext,
            })

            expect(actions.setIsRinging).toHaveBeenCalledWith(false)
            expect(actions.setIsDialing).toHaveBeenCalledWith(false)
            expect(setTimeout).toHaveBeenCalled()
        })

        it('should handle "reject" event', () => {
            call.emit('reject')

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
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

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
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

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
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

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallReconnected,
                data: callContext,
            })

            expect(actions.setError).toHaveBeenCalledWith(null)
        })

        it('should handle "error" event', () => {
            const expectedError = new Error('Call Error')
            call.emit('error', expectedError)

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
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
            const warningData = {
                name: 'rtt',
                values: [425, 438, 412, 445, 429],
                samples: [
                    { rtt: 425, timestamp: 1234567890 },
                    { rtt: 438, timestamp: 1234567891 },
                ],
                threshold: {
                    name: 'max',
                    value: 400,
                },
            }
            call.emit('warning', warning, warningData)

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallWarningStarted,
                data: {
                    metric_name: warning,
                    warning_data: warningData,
                    ...callContext,
                },
            })

            expect(actions.setWarning).toHaveBeenCalledWith(warning)
        })

        it('should handle "warning-cleared" event', () => {
            const warning = 'high-latency'
            const warningData = {
                name: 'rtt',
                values: [385, 362, 378, 355, 340],
                samples: [
                    { rtt: 385, timestamp: 1234567895 },
                    { rtt: 362, timestamp: 1234567896 },
                ],
                threshold: {
                    name: 'max',
                    value: 400,
                },
            }
            call.emit('warning-cleared', warning, warningData)

            expect(sendTwilioSocketEvent).toHaveBeenCalledWith({
                type: TwilioSocketEventType.CallWarningEnded,
                data: {
                    metric_name: warning,
                    warning_data: warningData,
                    ...callContext,
                },
            })

            expect(actions.setWarning).toHaveBeenCalledWith(null)
        })
    })

    describe('should handle messageReceived event', () => {
        const call: EventEmitter = new EventEmitter()

        it('should call onMessageReceived callback when provided', () => {
            const onMessageReceived = jest.fn()

            handleCallEvents(call as Call, dispatch, actions, onMessageReceived)

            call.emit('messageReceived', {
                content: {
                    type: 'event-happened',
                    data: {
                        key: 'value',
                    },
                },
            })

            expect(onMessageReceived).toHaveBeenCalledWith({
                type: 'event-happened',
                data: {
                    key: 'value',
                },
            })
        })
    })
})

describe('logCallEnd', () => {
    it('should log the call end when call has a ticket_id param', () => {
        // reset original logCallEnd implementation
        const logCallEndSpy = jest.spyOn(twilioCallUtils, 'logCallEnd')
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
            },
        )
    })

    it('should log the call end when call does not have a ticket_id param, and look it up from query cache', () => {
        // reset original logCallEnd implementation
        const logCallEndSpy = jest.spyOn(twilioCallUtils, 'logCallEnd')
        logCallEndSpy.mockRestore()

        const logEventSpy = jest.spyOn(activityTracker, 'logActivityEvent')
        const getQueriesDataSpy = jest.spyOn(appQueryClient, 'getQueriesData')
        getQueriesDataSpy.mockReturnValue([
            [
                ['foo', 'bar', { ticket_id: 123456 }],
                { data: [{ external_id: 'CA123' }] },
            ],
        ])

        const call = {
            parameters: { CallSid: 'CA123' },
            direction: Call.CallDirection.Outgoing,
            customParameters: new Map(),
        } as unknown as Call

        logCallEnd(call)
        expect(logEventSpy).toHaveBeenCalledWith(
            ActivityEvents.UserFinishedPhoneCall,
            {
                entityType: 'ticket',
                entityId: 123456,
            },
        )
    })
})

describe('handleAcceptedCallEvent', () => {
    const cancelCall = jest.spyOn(api, 'cancelCall')
    const acceptCall = jest.spyOn(api, 'acceptCall')

    beforeEach(() => {
        jest.clearAllMocks()
    })

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
            },
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
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33',
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
            '4ae6fde649ec113bf070d2cdd44dc622fb9e94bb595da893416c9e8ad378ab33',
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
