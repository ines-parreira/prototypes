import { Call } from '@twilio/voice-sdk'
import { fromJS } from 'immutable'

import { VoiceCallDirection, VoiceCallStatus } from '@gorgias/helpdesk-types'

import { User, UserRole } from 'config/types/user'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { MONITORING_RESTRICTION_REASONS } from 'models/voiceCall/constants'
import { VoiceCall } from 'models/voiceCall/types'
import { mockMonitoringCall } from 'tests/twilioMocks'

import {
    canMonitorCall,
    extractMonitoringCallParams,
    getCallMonitorability,
    getMonitoringParameters,
} from '../monitoring.utils'

describe('monitoring.utils', () => {
    describe('canMonitorCall', () => {
        it.each([UserRole.Admin, UserRole.Agent])(
            'should return true for allowed users',
            (role) => {
                const user = fromJS({ role: { name: role } })
                expect(canMonitorCall(user)).toBe(true)
            },
        )

        it.each([UserRole.BasicAgent, UserRole.LiteAgent, UserRole.LiteAgent])(
            'should return false for non-allowed users',
            (role) => {
                const user = fromJS({ role: { name: role } })
                expect(canMonitorCall(user)).toBe(false)
            },
        )

        it('should return false for users without a role', () => {
            const user = fromJS({})
            expect(canMonitorCall(user)).toBe(false)
        })
    })

    describe('getCallMonitorability', () => {
        it('should be false when trying to monitor your own call', () => {
            const result = getCallMonitorability(
                { status: VoiceCallStatus.Answered } as VoiceCall,
                42,
                { id: 42 } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
            })
        })

        it('should be false when trying to monitor call handled by admin', () => {
            const result = getCallMonitorability(
                { status: VoiceCallStatus.Answered } as VoiceCall,
                42,
                { id: 89, role: { name: UserRole.Admin } } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.CALL_HANDLED_BY_ADMIN,
            })
        })

        it('should be false when trying to monitor call already monitored', () => {
            const result = getCallMonitorability(
                {
                    status: VoiceCallStatus.Answered,
                    monitoring_status: 'listening',
                    last_monitoring_agent_id: 123,
                } as VoiceCall,
                42,
                { id: 89 } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.ALREADY_MONITORED,
            })
        })

        it('should be false when trying to monitor call answered by external number', () => {
            const result = getCallMonitorability(
                {
                    status: VoiceCallStatus.Answered,
                    answered_by_external_number: '+123456789',
                } as VoiceCall,
                42,
                { id: 89 } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.ANSWERED_BY_EXTERNAL_NUMBER,
            })
        })

        it('should be false when trying to monitor call being transferred to queue', () => {
            const result = getCallMonitorability(
                {
                    direction: VoiceCallDirection.Inbound,
                    status: VoiceCallStatus.Queued,
                    last_answered_by_agent_id: 123,
                } as VoiceCall,
                42,
                { id: 89 } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.TRANSFERRING_TO_QUEUE,
            })
        })

        it('should be false when trying to monitor call not in progress', () => {
            const result = getCallMonitorability(
                {
                    direction: VoiceCallDirection.Inbound,
                    status: VoiceCallStatus.Queued,
                } as VoiceCall,
                42,
                { id: 89 } as User,
            )

            expect(result).toEqual({
                isMonitorable: false,
                reason: MONITORING_RESTRICTION_REASONS.NOT_IN_PROGRESS,
            })
        })

        it.each([
            {
                direction: VoiceCallDirection.Inbound,
                status: VoiceCallStatus.Answered,
                last_answered_by_agent_id: 123,
            } as VoiceCall,
            {
                direction: VoiceCallDirection.Outbound,
                status: VoiceCallStatus.Connected,
            } as VoiceCallSummary,
        ])('should be true when call is monitorable', (voiceCall) => {
            const result = getCallMonitorability(voiceCall, 42, {
                id: 89,
            } as User)

            expect(result).toEqual({
                isMonitorable: true,
            })
        })

        it('should be true when agent is not found but call is in progress', () => {
            const result = getCallMonitorability(
                { status: VoiceCallStatus.Answered } as VoiceCall,
                42,
                undefined,
            )

            expect(result).toEqual({
                isMonitorable: true,
            })
        })
    })

    describe('extractMonitoringCallParams', () => {
        it('should extract monitoring call parameters from call object', () => {
            const integrationId = 1
            const inCallAgentId = 123
            const customerId = 456
            const customerPhoneNumber = '+14158880101'

            const call = mockMonitoringCall(
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
            ) as Call

            const params = extractMonitoringCallParams(call)

            expect(params).toEqual({
                integrationId,
                inCallAgentId,
                customerId,
                customerPhoneNumber,
            })
        })

        it('should return null for missing numeric parameters', () => {
            const call = {
                customParameters: new Map([
                    ['integration_id', 'null'],
                    ['in_call_agent_id', 'null'],
                    ['customer_id', 'null'],
                    ['customer_phone_number', '+14158880101'],
                ]),
            } as Call

            const params = extractMonitoringCallParams(call)

            expect(params).toEqual({
                integrationId: null,
                inCallAgentId: null,
                customerId: null,
                customerPhoneNumber: '+14158880101',
            })
        })

        it('should return null for undefined numeric parameters', () => {
            const call = {
                customParameters: new Map([
                    ['customer_phone_number', '+14158880101'],
                ]),
            } as Call

            const params = extractMonitoringCallParams(call)

            expect(params).toEqual({
                integrationId: null,
                inCallAgentId: null,
                customerId: null,
                customerPhoneNumber: '+14158880101',
            })
        })
    })

    describe('getMonitoringParameters', () => {
        describe('with VoiceCall', () => {
            it('should return correct params for inbound call', () => {
                const voiceCall: VoiceCall = {
                    external_id: 'CA123',
                    integration_id: 1,
                    customer_id: 100,
                    direction: VoiceCallDirection.Inbound,
                    phone_number_source: '+1234567890',
                    phone_number_destination: '+0987654321',
                    last_answered_by_agent_id: 10,
                } as VoiceCall

                const result = getMonitoringParameters(voiceCall)

                expect(result).toEqual({
                    callSidToMonitor: 'CA123',
                    monitoringExtraParams: {
                        integrationId: 1,
                        customerId: 100,
                        customerPhoneNumber: '+1234567890',
                        inCallAgentId: 10,
                    },
                })
            })

            it('should return correct params for outbound call', () => {
                const voiceCall: VoiceCall = {
                    external_id: 'CA456',
                    integration_id: 2,
                    customer_id: 200,
                    direction: VoiceCallDirection.Outbound,
                    phone_number_source: '+1111111111',
                    phone_number_destination: '+2222222222',
                    initiated_by_agent_id: 20,
                } as VoiceCall

                const result = getMonitoringParameters(voiceCall)

                expect(result).toEqual({
                    callSidToMonitor: 'CA456',
                    monitoringExtraParams: {
                        integrationId: 2,
                        customerId: 200,
                        customerPhoneNumber: '+2222222222',
                        inCallAgentId: 20,
                    },
                })
            })

            it('should return correct params for transferred outbound call', () => {
                const voiceCall: VoiceCall = {
                    external_id: 'CA789',
                    integration_id: 3,
                    customer_id: 300,
                    direction: VoiceCallDirection.Inbound,
                    phone_number_source: '+3333333333',
                    phone_number_destination: '+4444444444',
                    initiated_by_agent_id: 30,
                    last_answered_by_agent_id: 42,
                } as VoiceCall

                const result = getMonitoringParameters(voiceCall)

                expect(result).toEqual({
                    callSidToMonitor: 'CA789',
                    monitoringExtraParams: {
                        integrationId: 3,
                        customerId: 300,
                        customerPhoneNumber: '+3333333333',
                        inCallAgentId: 42,
                    },
                })
            })

            it('should handle missing fields with null fallback', () => {
                const voiceCall: VoiceCall = {
                    external_id: 'CA999',
                    integration_id: 4,
                    customer_id: 400,
                    direction: VoiceCallDirection.Inbound,
                    phone_number_source: '+5555555555',
                    phone_number_destination: '+6666666666',
                } as VoiceCall

                const result = getMonitoringParameters(voiceCall)

                expect(result).toEqual({
                    callSidToMonitor: 'CA999',
                    monitoringExtraParams: {
                        integrationId: 4,
                        customerId: 400,
                        customerPhoneNumber: '+5555555555',
                        inCallAgentId: null,
                    },
                })
            })
        })

        describe('with VoiceCallSummary', () => {
            it('should return correct params for inbound call', () => {
                const voiceCallSummary: VoiceCallSummary = {
                    callSid: 'CA111',
                    integrationId: 10,
                    customerId: 500,
                    direction: VoiceCallDirection.Inbound,
                    phoneNumberSource: '+7777777777',
                    phoneNumberDestination: '+8888888888',
                    agentId: 40,
                } as VoiceCallSummary

                const result = getMonitoringParameters(voiceCallSummary)

                expect(result).toEqual({
                    callSidToMonitor: 'CA111',
                    monitoringExtraParams: {
                        integrationId: 10,
                        customerId: 500,
                        customerPhoneNumber: '+7777777777',
                        inCallAgentId: 40,
                    },
                })
            })

            it('should return correct params for outbound call', () => {
                const voiceCallSummary: VoiceCallSummary = {
                    callSid: 'CA222',
                    integrationId: 11,
                    customerId: 600,
                    direction: VoiceCallDirection.Outbound,
                    phoneNumberSource: '+9999999999',
                    phoneNumberDestination: '+0000000000',
                    agentId: 50,
                } as VoiceCallSummary

                const result = getMonitoringParameters(voiceCallSummary)

                expect(result).toEqual({
                    callSidToMonitor: 'CA222',
                    monitoringExtraParams: {
                        integrationId: 11,
                        customerId: 600,
                        customerPhoneNumber: '+0000000000',
                        inCallAgentId: 50,
                    },
                })
            })

            it('should handle missing fields with null fallback', () => {
                const voiceCallSummary: VoiceCallSummary = {
                    callSid: 'CA333',
                    integrationId: null,
                    customerId: null,
                    direction: VoiceCallDirection.Inbound,
                    phoneNumberSource: '+1111111111',
                    phoneNumberDestination: '+2222222222',
                    agentId: null,
                } as VoiceCallSummary

                const result = getMonitoringParameters(voiceCallSummary)

                expect(result).toEqual({
                    callSidToMonitor: 'CA333',
                    monitoringExtraParams: {
                        integrationId: null,
                        customerId: null,
                        customerPhoneNumber: '+1111111111',
                        inCallAgentId: null,
                    },
                })
            })
        })
    })
})
