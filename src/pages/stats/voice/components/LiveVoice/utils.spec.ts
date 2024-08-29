import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItemStatus,
    LiveCallQueueVoiceCall,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/api-queries'
import {OrderDirection} from 'models/api/types'
import {
    groupAgentsByStatus,
    AgentStatusCategory,
    getOldestCall,
    isAgentBusy,
    isAgentAvailable,
    isLiveInboundVoiceCallAnswered,
    formatVoiceCallsData,
    filterLiveCallsByStatus,
    orderLiveVoiceCallsByOngoingTime,
    isLiveOutboundCallRinging,
} from './utils'
import {LiveVoiceStatusFilterOption} from './types'

describe('utils', () => {
    describe('isAgentBusy', () => {
        it('should return true if agent is busy', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        created_datetime: '',
                        status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                    },
                ],
                is_available_for_call: false,
            }

            const result = isAgentBusy(agent)

            expect(result).toBe(true)
        })

        it('should return false if agent is not busy', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [],
                is_available_for_call: true,
            }

            const result = isAgentBusy(agent)

            expect(result).toBe(false)
        })
    })

    describe('isAgentAvailable', () => {
        it('should return true if agent is available', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [],
                is_available_for_call: true,
            }

            const result = isAgentAvailable(agent)

            expect(result).toBe(true)
        })

        it('should return false if agent is not available', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [],
                is_available_for_call: false,
            }

            const result = isAgentAvailable(agent)

            expect(result).toBe(false)
        })
    })

    describe('groupAgentsByStatus', () => {
        it('should group agents by status correctly', () => {
            const agents: LiveCallQueueAgent[] = [
                {
                    id: 1,
                    name: 'Agent 1',
                    call_statuses: [
                        {
                            created_datetime: '',
                            status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        },
                    ],
                    is_available_for_call: false,
                },
                {
                    id: 2,
                    name: 'Agent 2',
                    call_statuses: [],
                    is_available_for_call: true,
                },
                {
                    id: 3,
                    name: 'Agent 3',
                    call_statuses: [
                        {
                            created_datetime: '',
                            status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        },
                    ],
                    is_available_for_call: true,
                },
                {
                    id: 4,
                    name: 'Agent 4',
                    call_statuses: [],
                    is_available_for_call: false,
                },
            ]

            const result = groupAgentsByStatus(agents)

            expect(result[AgentStatusCategory.Busy]).toEqual([
                {
                    id: 1,
                    name: 'Agent 1',
                    call_statuses: [
                        {
                            created_datetime: '',
                            status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        },
                    ],
                    is_available_for_call: false,
                },
                {
                    id: 3,
                    name: 'Agent 3',
                    call_statuses: [
                        {
                            created_datetime: '',
                            status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        },
                    ],
                    is_available_for_call: true,
                },
            ])

            expect(result[AgentStatusCategory.Available]).toEqual([
                {
                    id: 2,
                    name: 'Agent 2',
                    call_statuses: [],
                    is_available_for_call: true,
                },
            ])

            expect(result[AgentStatusCategory.Unavailable]).toEqual([
                {
                    id: 4,
                    name: 'Agent 4',
                    call_statuses: [],
                    is_available_for_call: false,
                },
            ])
        })

        it.each([true, false])(
            'should sort online agents first - is_available_for_call=%s agents',
            (is_available_for_call) => {
                const onlineAgent = {
                    id: 2,
                    name: 'Agent 2',
                    call_statuses: [],
                    is_available_for_call,
                    online: true,
                }
                const offlineAgent1 = {
                    id: 1,
                    name: 'Agent 1',
                    call_statuses: [],
                    is_available_for_call,
                    online: false,
                }
                const offlineAgent2 = {
                    id: 3,
                    name: 'Agent 3',
                    call_statuses: [],
                    is_available_for_call,
                    online: false,
                }
                const agents: LiveCallQueueAgent[] = [
                    offlineAgent1,
                    onlineAgent,
                    offlineAgent2,
                ]

                const result = groupAgentsByStatus(agents)

                expect(
                    result[
                        is_available_for_call
                            ? AgentStatusCategory.Available
                            : AgentStatusCategory.Unavailable
                    ]
                ).toEqual([onlineAgent, offlineAgent1, offlineAgent2])
            }
        )
    })

    describe('getOldestCall', () => {
        it('should return the oldest call correctly', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        created_datetime: '2021-08-01T10:00:00Z',
                    },
                    {
                        status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        created_datetime: '2021-08-01T10:01:00Z',
                    },
                    {
                        status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                        created_datetime: '2021-08-01T09:59:00Z',
                    },
                ],
                is_available_for_call: false,
            }

            const result = getOldestCall(agent)

            expect(result).toEqual({
                status: LiveCallQueueAgentCallStatusesItemStatus.InProgress,
                created_datetime: '2021-08-01T09:59:00Z',
            })
        })

        it('should return undefined if there are no calls', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [],
                is_available_for_call: false,
            }

            const result = getOldestCall(agent)

            expect(result).toBe(null)
        })
    })

    describe('formatVoiceCallsData', () => {
        it('should format voice calls data correctly for inbound calls', () => {
            const voiceCall = {
                id: 1,
                last_answered_by_agent_id: 1,
                status: VoiceCallStatus.Answered,
                phone_number_source: '123456789',
                phone_number_destination: '987654321',
                created_datetime: '2021-08-01T10:00:00Z',
                customer_id: 2,
                customer_name: 'Customer 2',
                direction: VoiceCallDirection.Inbound,
                integration_id: 3,
                duration: 60,
                ticket_id: 4,
                has_voicemail: true,
                has_call_recording: true,
            } as LiveCallQueueVoiceCall

            const result = formatVoiceCallsData([voiceCall])
            expect(result).toEqual([
                {
                    agentId: 1,
                    customerId: 2,
                    customerName: 'Customer 2',
                    direction: VoiceCallDirection.Inbound,
                    integrationId: 3,
                    createdAt: '2021-08-01T10:00:00Z',
                    status: VoiceCallStatus.Answered,
                    duration: 60,
                    ticketId: 4,
                    phoneNumberDestination: '987654321',
                    phoneNumberSource: '123456789',
                    talkTime: null,
                    waitTime: null,
                    voicemailAvailable: true,
                    voicemailUrl: null,
                    callRecordingAvailable: true,
                    callRecordingUrl: null,
                },
            ])
        })

        it('should format voice calls data correctly for outbound calls', () => {
            const voiceCall = {
                id: 1,
                initiated_by_agent_id: 1,
                status: VoiceCallStatus.Answered,
                phone_number_source: '123456789',
                phone_number_destination: '987654321',
                created_datetime: '2021-08-01T10:00:00Z',
                customer_id: 2,
                customer_name: 'Customer 2',
                direction: VoiceCallDirection.Outbound,
                integration_id: 3,
                duration: 60,
                ticket_id: 4,
                has_voicemail: true,
                has_call_recording: true,
            } as LiveCallQueueVoiceCall

            const result = formatVoiceCallsData([voiceCall])
            expect(result).toEqual([
                {
                    agentId: 1,
                    customerId: 2,
                    customerName: 'Customer 2',
                    direction: VoiceCallDirection.Outbound,
                    integrationId: 3,
                    createdAt: '2021-08-01T10:00:00Z',
                    status: VoiceCallStatus.Answered,
                    duration: 60,
                    ticketId: 4,
                    phoneNumberDestination: '987654321',
                    phoneNumberSource: '123456789',
                    talkTime: null,
                    waitTime: null,
                    voicemailAvailable: true,
                    voicemailUrl: null,
                    callRecordingAvailable: true,
                    callRecordingUrl: null,
                },
            ])
        })
    })

    describe('isLiveInboundVoiceCallAnswered', () => {
        it('should return true for status Answered', () => {
            const result = isLiveInboundVoiceCallAnswered(
                VoiceCallStatus.Answered
            )

            expect(result).toBe(true)
        })

        it.each([
            VoiceCallStatus.Ringing,
            VoiceCallStatus.Initiated,
            VoiceCallStatus.Queued,
            VoiceCallStatus.InProgress,
        ])('should return false for status %s', (status) => {
            const result = isLiveInboundVoiceCallAnswered(status)

            expect(result).toBe(false)
        })
    })

    describe('isLiveOutboundCallRinging', () => {
        it.each([
            VoiceCallStatus.InProgress,
            VoiceCallStatus.Ringing,
            VoiceCallStatus.Initiated,
            VoiceCallStatus.Queued,
        ])('should return true for status %s', (status) => {
            const result = isLiveOutboundCallRinging(status)

            expect(result).toBe(true)
        })

        it.each([
            VoiceCallStatus.Failed,
            VoiceCallStatus.Canceled,
            VoiceCallStatus.Busy,
            VoiceCallStatus.NoAnswer,
            VoiceCallStatus.Missed,
            VoiceCallStatus.Answered,
            VoiceCallStatus.Connected,
            VoiceCallStatus.Completed,
        ])('should return false for status %s', (status) => {
            const result = isLiveOutboundCallRinging(status)

            expect(result).toBe(false)
        })
    })

    describe('filterLiveCallsByStatus', () => {
        const inboundAnswered = {
            direction: VoiceCallDirection.Inbound,
            status: VoiceCallStatus.Answered,
        }
        const inboundRinging = {
            direction: VoiceCallDirection.Inbound,
            status: VoiceCallStatus.Ringing,
        }
        const outboundAnswered = {
            direction: VoiceCallDirection.Outbound,
            status: VoiceCallStatus.Answered,
        }
        const outboundRinging = {
            direction: VoiceCallDirection.Outbound,
            status: VoiceCallStatus.Ringing,
        }
        const voiceCalls = [
            inboundAnswered,
            inboundRinging,
            outboundAnswered,
            outboundRinging,
        ] as LiveCallQueueVoiceCall[]

        it('should return all voice calls for status ALL', () => {
            const result = filterLiveCallsByStatus(
                voiceCalls,
                LiveVoiceStatusFilterOption.ALL
            )

            expect(result).toEqual(voiceCalls)
        })

        it('should return only inbound unanswered calls for status IN_QUEUE', () => {
            const result = filterLiveCallsByStatus(
                voiceCalls,
                LiveVoiceStatusFilterOption.IN_QUEUE
            )

            expect(result).toEqual([inboundRinging])
        })

        it('should return outbound calls and inbound answered calls for status IN_PROGRESS', () => {
            const result = filterLiveCallsByStatus(
                voiceCalls,
                LiveVoiceStatusFilterOption.IN_PROGRESS
            )

            expect(result).toEqual([
                inboundAnswered,
                outboundAnswered,
                outboundRinging,
            ])
        })
    })

    describe('orderLiveVoiceCallsByOngoingTime', () => {
        const voiceCalls = [
            {
                id: 1,
                created_datetime: '2021-08-01T10:00:00Z',
            },
            {
                id: 2,
                created_datetime: '2021-08-01T10:01:00Z',
            },
            {
                id: 3,
                created_datetime: '2021-08-01T09:59:00Z',
            },
        ]

        it('should order voice calls by ongoing time in ascending order', () => {
            const result = orderLiveVoiceCallsByOngoingTime(
                voiceCalls as LiveCallQueueVoiceCall[],
                OrderDirection.Asc
            )

            expect(result.map((voiceCall) => voiceCall.id)).toEqual([2, 1, 3])
        })

        it('should order voice calls by ongoing time in descending order', () => {
            const result = orderLiveVoiceCallsByOngoingTime(
                voiceCalls as LiveCallQueueVoiceCall[],
                OrderDirection.Desc
            )

            expect(result.map((voiceCall) => voiceCall.id)).toEqual([3, 1, 2])
        })
    })
})
