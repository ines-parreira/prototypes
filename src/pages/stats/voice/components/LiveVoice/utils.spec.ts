import moment from 'moment'

import {
    LiveCallQueueAgent,
    LiveCallQueueVoiceCall,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'

import { OrderDirection } from 'models/api/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { getMoment } from 'utils/date'
import { assumeMock } from 'utils/testing'

import { LiveVoiceStatusFilterOption } from './types'
import {
    AgentStatusCategory,
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    getLiveVoicePeriodFilter,
    groupAgentsByStatus,
    isAgentAvailable,
    isAgentBusy,
    isLiveCallRinging,
    isLiveInboundVoiceCallAnswered,
    mapBusyAgentStatus,
    orderLiveVoiceCallsByOngoingTime,
} from './utils'

jest.mock('utils/date')

const getMomentMock = assumeMock(getMoment)

describe('utils', () => {
    beforeEach(() => {
        getMomentMock.mockReturnValue(moment('2024-01-02T14:11:00.000Z'))
    })

    describe('isAgentBusy', () => {
        it('should return true if agent is busy', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        created_datetime: '',
                        status: 'in-progress',
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
                            status: 'in-progress',
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
                            status: 'in-progress',
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
                            status: 'in-progress',
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
                            status: 'in-progress',
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
                    ],
                ).toEqual([onlineAgent, offlineAgent1, offlineAgent2])
            },
        )
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
                queue_id: 1,
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
                    displayStatus: VoiceCallDisplayStatus.InProgress,
                    queueId: 1,
                    queueName: null,
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
                    displayStatus: VoiceCallDisplayStatus.InProgress,
                    queueId: null,
                    queueName: null,
                },
            ])
        })
    })

    describe('isLiveInboundVoiceCallAnswered', () => {
        it('should return true for status Answered', () => {
            const result = isLiveInboundVoiceCallAnswered(
                VoiceCallStatus.Answered,
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

    describe('isLiveCallRinging', () => {
        it.each([
            VoiceCallStatus.InProgress,
            VoiceCallStatus.Ringing,
            VoiceCallStatus.Initiated,
            VoiceCallStatus.Queued,
        ])('should return true for status %s', (status) => {
            const result = isLiveCallRinging(status)

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
            const result = isLiveCallRinging(status)

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
                LiveVoiceStatusFilterOption.ALL,
            )

            expect(result).toEqual(voiceCalls)
        })

        it('should return only inbound unanswered calls for status IN_QUEUE', () => {
            const result = filterLiveCallsByStatus(
                voiceCalls,
                LiveVoiceStatusFilterOption.IN_QUEUE,
            )

            expect(result).toEqual([inboundRinging])
        })

        it('should return outbound calls and inbound answered calls for status IN_PROGRESS', () => {
            const result = filterLiveCallsByStatus(
                voiceCalls,
                LiveVoiceStatusFilterOption.IN_PROGRESS,
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
                OrderDirection.Asc,
            )

            expect(result.map((voiceCall) => voiceCall.id)).toEqual([2, 1, 3])
        })

        it('should order voice calls by ongoing time in descending order', () => {
            const result = orderLiveVoiceCallsByOngoingTime(
                voiceCalls as LiveCallQueueVoiceCall[],
                OrderDirection.Desc,
            )

            expect(result.map((voiceCall) => voiceCall.id)).toEqual([3, 1, 2])
        })
    })

    describe('getLiveVoicePeriodFilter', () => {
        it.each([
            {
                expectedResult: {
                    start_datetime: '2024-01-02T00:00:00.000',
                    end_datetime: '2024-01-02T23:59:59.999',
                },
                timezone: 'UTC',
            },
            {
                expectedResult: {
                    start_datetime: '2024-01-01T23:00:00.000',
                    end_datetime: '2024-01-02T22:59:59.999',
                },
                timezone: 'Europe/Paris',
            },
        ])(
            'should return correct period filter for timezone %s',
            ({ expectedResult, timezone }) => {
                const result = getLiveVoicePeriodFilter(timezone)

                expect(result).toEqual(expectedResult)
            },
        )
    })

    describe('mapBusyAgentStatus', () => {
        it('should return empty description when there are no call statuses', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: '',
                isDescriptionTimestamp: false,
            })
        })

        it('should return created_datetime and isDescriptionTimestamp true for InProgress status', () => {
            const createdDateTime = '2021-08-01T09:59:00Z'
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: 'in-progress',
                        created_datetime: createdDateTime,
                    },
                ],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: createdDateTime,
                isDescriptionTimestamp: true,
            })
        })

        it('should return "Wrapping up" description for WrappingUp status', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: 'wrapping-up',
                        created_datetime: '2021-08-01T09:59:00Z',
                    },
                ],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: 'Wrapping up',
                isDescriptionTimestamp: false,
            })
        })

        it('should return "Ringing" description for Ringing status', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: 'ringing',
                        created_datetime: '2021-08-01T09:59:00Z',
                    },
                ],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: 'Ringing',
                isDescriptionTimestamp: false,
            })
        })

        it('should return "Ringing" description for any other status', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: 'SomeOtherStatus' as any,
                        created_datetime: '2021-08-01T09:59:00Z',
                    },
                ],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: 'Ringing',
                isDescriptionTimestamp: false,
            })
        })

        it('should use the oldest in progress call when multiple calls exist', () => {
            const agent: LiveCallQueueAgent = {
                id: 1,
                name: 'Agent 1',
                call_statuses: [
                    {
                        status: 'wrapping-up',
                        created_datetime: '2021-08-01T09:58:00Z',
                    },
                    {
                        status: 'in-progress',
                        created_datetime: '2021-08-01T09:59:00Z',
                    },
                    {
                        status: 'in-progress',
                        created_datetime: '2021-08-01T10:00:00Z',
                    },
                    {
                        status: 'wrapping-up',
                        created_datetime: '2021-08-01T10:01:00Z',
                    },
                ],
                is_available_for_call: false,
            }

            const result = mapBusyAgentStatus(agent)

            expect(result).toEqual({
                description: '2021-08-01T09:59:00Z',
                isDescriptionTimestamp: true,
            })
        })
    })
})
