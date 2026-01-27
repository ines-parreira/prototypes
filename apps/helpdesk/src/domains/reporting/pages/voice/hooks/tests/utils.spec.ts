import moment from 'moment'

import type {
    ListLiveCallQueueVoiceCallsParams,
    LiveCallQueueVoiceCall,
} from '@gorgias/helpdesk-queries'
import { AgentStatus, queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { VALID_LIVE_STATUSES } from 'domains/reporting/pages/voice/constants/liveVoice'
import {
    addVoiceCallToLiveCallsQueryCache,
    getWrapUpStatusesThatShouldExpire,
    isFilteredOut,
    isVoiceCallIncludedInFilters,
    removeAgentStatusInLiveAgentsQueryCache,
    removeVoiceCallInLiveAgentsQueryCache,
    setWrapUpExpirationTimer,
    transformDateToUTCString,
    updateAgentAvailabilityInLiveAgentsQueryCache,
    updateAgentStatusInLiveAgentsQueryCache,
    updateVoiceCallInLiveCallsQueryCache,
} from 'domains/reporting/pages/voice/hooks/utils'

describe('utils.ts', () => {
    afterEach(() => {
        appQueryClient.clear()
    })

    describe('transformDateToUTCString', () => {
        it('should transform a date to UTC string', () => {
            const date = new Date('2023-01-01T00:00:00Z')
            const result = transformDateToUTCString(date)
            expect(result).toBe(moment.utc(date).toISOString())
        })
    })

    describe('isFilteredOut', () => {
        it('should return true if value is filtered out', () => {
            const result = isFilteredOut(1, [2, 3])
            expect(result).toBe(true)
        })

        it('should return false if value is not filtered out', () => {
            const result = isFilteredOut(2, [2, 3])
            expect(result).toBe(false)
        })

        it('should return false if filterValue is empty', () => {
            const result = isFilteredOut(1, [])
            expect(result).toBe(false)
        })

        it('should return false if value is undefined', () => {
            const result = isFilteredOut(undefined, [2, 3])
            expect(result).toBe(false)
        })
    })

    describe('isVoiceCallIncludedInFilters', () => {
        const voiceCall: Partial<LiveCallQueueVoiceCall> = {
            status: VALID_LIVE_STATUSES[0],
            integration_id: 1,
            queue_id: 2,
            initiated_by_agent_id: 3,
        }
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [3],
        }

        it('should return true if voice call matches filters', () => {
            const result = isVoiceCallIncludedInFilters(voiceCall, params)
            expect(result).toBe(true)
        })

        it('should return false if voice call status is invalid', () => {
            const invalidVoiceCall: Partial<LiveCallQueueVoiceCall> = {
                ...voiceCall,
                status: 'completed',
            }
            const result = isVoiceCallIncludedInFilters(
                invalidVoiceCall,
                params,
            )
            expect(result).toBe(false)
        })

        it('should return false if voice call is filtered out', () => {
            const filteredVoiceCall = { ...voiceCall, integration_id: 99 }
            const result = isVoiceCallIncludedInFilters(
                filteredVoiceCall,
                params,
            )
            expect(result).toBe(false)
        })

        it('should return true if params are undefined', () => {
            const result = isVoiceCallIncludedInFilters(voiceCall, undefined)
            expect(result).toBe(true)
        })
    })

    describe('addVoiceCallToLiveCallsQueryCache', () => {
        const voiceCall = {
            id: 123,
            status: VALID_LIVE_STATUSES[0],
            integration_id: 1,
            queue_id: 2,
            initiated_by_agent_id: 3,
        } as LiveCallQueueVoiceCall
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [3],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

        it('should add voice call to cache if it matches filters', () => {
            const oldData = {
                data: { data: [] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            addVoiceCallToLiveCallsQueryCache(voiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [voiceCall] },
            })
        })

        it('should not add voice call to cache if it already exists', () => {
            const oldData = {
                data: { data: [{ id: voiceCall.id, status: 'whatever' }] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            addVoiceCallToLiveCallsQueryCache(voiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [{ id: voiceCall.id, status: 'whatever' }] },
            })
        })

        it('should not add voice call to cache if it does not match filters', () => {
            const oldData = {
                data: { data: [] },
            }
            const filteredVoiceCall = { ...voiceCall, integration_id: 99 }
            appQueryClient.setQueryData(queryKey, oldData)

            addVoiceCallToLiveCallsQueryCache(filteredVoiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldDatd) => {
            appQueryClient.setQueryData(queryKey, oldDatd)

            addVoiceCallToLiveCallsQueryCache(voiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldDatd)
        })
    })

    describe('updateVoiceCallInLiveCallsQueryCache', () => {
        const voiceCall = {
            id: 123,
            status: VALID_LIVE_STATUSES[0],
            integration_id: 1,
            queue_id: 2,
            initiated_by_agent_id: 3,
        } as Partial<LiveCallQueueVoiceCall>
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [3],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

        it('should update voice call in cache if it matches filters', () => {
            const oldData = {
                data: { data: [{ id: voiceCall.id, status: 'oldStatus' }] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateVoiceCallInLiveCallsQueryCache(voiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [{ ...voiceCall, status: VALID_LIVE_STATUSES[0] }],
                },
            })
        })

        it('should not do anything if the voice call is not in the data', () => {
            const oldData = {
                data: { data: [] },
            }
            const filteredVoiceCall = { ...voiceCall, integration_id: 99 }
            appQueryClient.setQueryData(queryKey, oldData)

            updateVoiceCallInLiveCallsQueryCache(filteredVoiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })

        it('should remove voice call from cache if it is not included in filters', () => {
            const oldData = {
                data: { data: [{ id: voiceCall.id, status: 'oldStatus' }] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            const filteredVoiceCall = { ...voiceCall, integration_id: 99 }
            updateVoiceCallInLiveCallsQueryCache(filteredVoiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldData) => {
            appQueryClient.setQueryData(queryKey, oldData)

            updateVoiceCallInLiveCallsQueryCache(voiceCall, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldData)
        })
    })

    describe('updateAgentStatusInLiveAgentsQueryCache', () => {
        const agentId = 1
        const statusUpdate = {
            status: AgentStatus.Ringing,
            call_sid: '12345',
            created_datetime: new Date().toISOString(),
        }
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [agentId],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

        it('should update agent status in cache', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: 1,
                            call_statuses: [
                                {
                                    status: 'dialling',
                                    call_sid: '12345',
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentStatusInLiveAgentsQueryCache(
                agentId,
                statusUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            call_statuses: [statusUpdate],
                        },
                    ],
                },
            })
        })

        it('should not do anything if the agent is not in the data', () => {
            const oldData = {
                data: { data: [] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentStatusInLiveAgentsQueryCache(
                agentId,
                statusUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })

        it('should add agent status if it does not exist', () => {
            const oldData = {
                data: { data: [{ id: 1, call_statuses: [] }] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentStatusInLiveAgentsQueryCache(
                agentId,
                statusUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [{ id: 1, call_statuses: [statusUpdate] }] },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldData) => {
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentStatusInLiveAgentsQueryCache(
                agentId,
                statusUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldData)
        })
    })

    describe('removeVoiceCallInLiveAgentsQueryCache', () => {
        const queryKey = queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(
            {},
        )
        const oldData = {
            data: {
                data: [
                    {
                        id: 1,
                        call_statuses: [
                            {
                                status: 'dialling',
                                call_sid: '12345',
                            },
                            { status: 'ringing', call_sid: '67890' },
                        ],
                    },
                    {
                        id: 2,
                        call_statuses: [
                            {
                                status: 'ringing',
                                call_sid: '12345',
                            },
                        ],
                    },
                    {
                        id: 3,
                    },
                    {
                        id: 4,
                        call_statuses: [
                            { status: 'wrapping-up', call_sid: '12345' },
                        ],
                    },
                ],
            },
        }

        it('should remove statuses from cache', () => {
            appQueryClient.setQueryData(queryKey, oldData)
            removeVoiceCallInLiveAgentsQueryCache('12345', {})
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            call_statuses: [
                                { status: 'ringing', call_sid: '67890' },
                            ],
                        },
                        {
                            id: 2,
                            call_statuses: [],
                        },
                        {
                            id: 3,
                            call_statuses: [],
                        },
                        {
                            id: 4,
                            call_statuses: [
                                { status: 'wrapping-up', call_sid: '12345' },
                            ],
                        },
                    ],
                },
            })
        })

        it('should should not ignore wrap up', () => {
            appQueryClient.setQueryData(queryKey, oldData)
            removeVoiceCallInLiveAgentsQueryCache('12345', {}, false)
            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            call_statuses: [
                                { status: 'ringing', call_sid: '67890' },
                            ],
                        },
                        {
                            id: 2,
                            call_statuses: [],
                        },
                        {
                            id: 3,
                            call_statuses: [],
                        },
                        {
                            id: 4,
                            call_statuses: [],
                        },
                    ],
                },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldData) => {
            appQueryClient.setQueryData(queryKey, oldData)

            removeVoiceCallInLiveAgentsQueryCache('12345', {})

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldData)
        })
    })

    describe('getWrapUpStatuses', () => {
        it('should return wrapping up statuses', () => {
            const wrapUpStatus = {
                agent_id: 1,
                status: AgentStatus.WrappingUp,
                call_sid: '123',
                expiration_datetime: new Date().toISOString(),
            }
            const agents = [
                {
                    id: 1,
                    call_statuses: [
                        wrapUpStatus,
                        { status: AgentStatus.Ringing, call_sid: '456' },
                    ],
                },
                {
                    id: 2,
                    call_statuses: [
                        { status: AgentStatus.WrappingUp, call_sid: '789' },
                    ],
                },
                {
                    id: 3,
                    call_statuses: [
                        { status: AgentStatus.Ringing, call_sid: '101' },
                    ],
                },
                {
                    id: 4,
                },
            ]
            const result = getWrapUpStatusesThatShouldExpire(agents)
            expect(result).toEqual([wrapUpStatus])
        })

        it('should return empty array if no agents', () => {
            const result = getWrapUpStatusesThatShouldExpire(undefined)
            expect(result).toEqual([])
        })
    })

    describe('setWrapUpExpirationTimer', () => {
        beforeEach(() => {
            jest.useFakeTimers()
        })

        afterEach(() => {
            jest.useRealTimers()
        })

        it('should set a timeout for wrap up expiration', () => {
            const queryKey =
                queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents({})
            const oldData = {
                data: {
                    data: [
                        {
                            id: 1,
                            call_statuses: [
                                {
                                    status: AgentStatus.WrappingUp,
                                    call_sid: '123',
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            const timeouts: React.MutableRefObject<
                Record<string, NodeJS.Timeout>
            > = { current: {} }
            const status = {
                agent_id: 1,
                call_sid: '123',
                expiration_datetime: moment
                    .utc()
                    .add(1, 'minute')
                    .toISOString(),
            }
            setWrapUpExpirationTimer(timeouts, status, {})

            expect(timeouts.current['1-123']).toBeDefined()

            jest.advanceTimersByTime(60000) // Advance time by 1 minute
            expect(
                appQueryClient.getQueryData(
                    queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents({}),
                ),
            ).toEqual({ data: { data: [{ call_statuses: [], id: 1 }] } })
        })

        it('should not set a timeout if expiration_datetime is in the past', () => {
            const timeouts: React.MutableRefObject<
                Record<string, NodeJS.Timeout>
            > = { current: {} }
            const status = {
                agent_id: 1,
                call_sid: '123',
                expiration_datetime: moment
                    .utc()
                    .subtract(1, 'minute')
                    .toISOString(),
            }
            setWrapUpExpirationTimer(timeouts, status)

            expect(timeouts.current['1-123']).toBeUndefined()
        })
    })

    describe('updateAgentAvailabilityInLiveAgentsQueryCache', () => {
        const agentId = 1
        const availabilityUpdate = {
            available: false,
            forward_calls: false,
            forward_when_offline: false,
        }
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [agentId],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

        it('should update agent availability in cache', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: 1,
                            available: true,
                            name: 'Agent 1',
                            forward_calls: true,
                            forward_when_offline: true,
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentAvailabilityInLiveAgentsQueryCache(
                agentId,
                availabilityUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            available: false,
                            forward_calls: false,
                            forward_when_offline: false,
                            name: 'Agent 1',
                        },
                    ],
                },
            })
        })

        it('should not do anything if the agent is not in the data', () => {
            const oldData = {
                data: { data: [] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentAvailabilityInLiveAgentsQueryCache(
                agentId,
                availabilityUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })

        it('should merge availability updates with existing agent data', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: 1,
                            name: 'Agent 1',
                            email: 'agent1@example.com',
                            call_statuses: [
                                {
                                    status: AgentStatus.Ringing,
                                    call_sid: '12345',
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentAvailabilityInLiveAgentsQueryCache(
                agentId,
                availabilityUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            available: false,
                            forward_calls: false,
                            forward_when_offline: false,
                            name: 'Agent 1',
                            email: 'agent1@example.com',
                            call_statuses: [
                                {
                                    status: AgentStatus.Ringing,
                                    call_sid: '12345',
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should handle partial availability updates', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: 1,
                            available: true,
                            forward_calls: true,
                            forward_when_offline: true,
                            name: 'Agent 1',
                            email: 'agent1@example.com',
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            const partialUpdate = { available: false }
            updateAgentAvailabilityInLiveAgentsQueryCache(
                agentId,
                partialUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: 1,
                            available: false,
                            forward_calls: true,
                            forward_when_offline: true,
                            name: 'Agent 1',
                            email: 'agent1@example.com',
                        },
                    ],
                },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldData) => {
            appQueryClient.setQueryData(queryKey, oldData)

            updateAgentAvailabilityInLiveAgentsQueryCache(
                agentId,
                availabilityUpdate,
                params,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldData)
        })
    })

    describe('removeAgentStatusInLiveAgentsQueryCache', () => {
        const agentId = 1
        const callSid = '12345'
        const params: ListLiveCallQueueVoiceCallsParams = {
            integration_ids: [1],
            voice_queue_ids: [2],
            agent_ids: [agentId],
        }
        const queryKey =
            queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

        it('should remove agent status from cache', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [
                                {
                                    status: AgentStatus.Ringing,
                                    call_sid: callSid,
                                },
                                {
                                    status: AgentStatus.Dialling,
                                    call_sid: '67890',
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            removeAgentStatusInLiveAgentsQueryCache(agentId, callSid, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [
                                {
                                    status: AgentStatus.Dialling,
                                    call_sid: '67890',
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should preserve wrap up status when ignoreWrapUp is true', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [
                                {
                                    status: AgentStatus.WrappingUp,
                                    call_sid: callSid,
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            removeAgentStatusInLiveAgentsQueryCache(
                agentId,
                callSid,
                params,
                true,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [
                                {
                                    status: AgentStatus.WrappingUp,
                                    call_sid: callSid,
                                },
                            ],
                        },
                    ],
                },
            })
        })

        it('should remove wrap up status when ignoreWrapUp is false', () => {
            const oldData = {
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [
                                {
                                    status: AgentStatus.WrappingUp,
                                    call_sid: callSid,
                                },
                            ],
                        },
                    ],
                },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            removeAgentStatusInLiveAgentsQueryCache(
                agentId,
                callSid,
                params,
                false,
            )

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: {
                    data: [
                        {
                            id: agentId,
                            call_statuses: [],
                        },
                    ],
                },
            })
        })

        it.each([
            undefined,
            { data: undefined },
            { data: { data: undefined } },
        ])('should not modify cache when oldData is undefined', (oldData) => {
            appQueryClient.setQueryData(queryKey, oldData)

            removeAgentStatusInLiveAgentsQueryCache(agentId, callSid, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual(oldData)
        })

        it('should not do anything if agent is not found', () => {
            const oldData = {
                data: { data: [] },
            }
            appQueryClient.setQueryData(queryKey, oldData)

            removeAgentStatusInLiveAgentsQueryCache(agentId, callSid, params)

            expect(appQueryClient.getQueryData(queryKey)).toEqual({
                data: { data: [] },
            })
        })
    })
})
