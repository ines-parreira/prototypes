import moment from 'moment'

import {
    AgentStatus,
    ListLiveCallQueueVoiceCallsParams,
    LiveCallQueueVoiceCall,
    queryKeys,
} from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'

import { VALID_LIVE_STATUSES } from '../../constants/liveVoice'
import {
    addVoiceCallToLiveCallsQueryCache,
    isFilteredOut,
    isVoiceCallIncludedInFilters,
    transformDateToUTCString,
    updateAgentStatusInLiveAgentsQueryCache,
    updateVoiceCallInLiveCallsQueryCache,
} from '../utils'

describe('utils.ts', () => {
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
    })
})
