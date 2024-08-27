import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItemStatus,
} from '@gorgias/api-queries'
import {
    groupAgentsByStatus,
    AgentStatusCategory,
    getOldestCall,
    isAgentBusy,
    isAgentAvailable,
} from './utils'

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
})
