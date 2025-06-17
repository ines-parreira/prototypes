import { cloneDeep, merge } from 'lodash'
import moment from 'moment/moment'

import {
    ListLiveCallQueueAgentsQueryResult,
    ListLiveCallQueueVoiceCallsParams,
    ListLiveCallQueueVoiceCallsResult,
    LiveCallQueueAgentCallStatusesItem,
    LiveCallQueueVoiceCall,
    queryKeys,
} from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'

import { VALID_LIVE_STATUSES } from '../constants/liveVoice'

export const transformDateToUTCString = (date: string | Date): string => {
    return moment.utc(date).toISOString()
}

export const isFilteredOut = (
    value: number | undefined,
    filterValue: number[] | undefined,
) => {
    return (
        value !== undefined &&
        filterValue &&
        filterValue.length > 0 &&
        !filterValue.includes(value)
    )
}

export const isVoiceCallIncludedInFilters = (
    voiceCall: Partial<LiveCallQueueVoiceCall>,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
): boolean => {
    // Check if the voice call has a valid status and is not filtered out
    const isValidStatus = voiceCall.status
        ? VALID_LIVE_STATUSES.includes(voiceCall.status)
        : false
    if (!isValidStatus) {
        return false
    }

    if (!params) {
        return true
    }

    const agentId =
        voiceCall.initiated_by_agent_id || voiceCall.last_answered_by_agent_id

    return !(
        isFilteredOut(voiceCall.integration_id, params.integration_ids) ||
        isFilteredOut(voiceCall.queue_id, params.voice_queue_ids) ||
        isFilteredOut(agentId, params.agent_ids)
    )
}

export const addVoiceCallToLiveCallsQueryCache = (
    voiceCall: LiveCallQueueVoiceCall,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

    appQueryClient.setQueryData<ListLiveCallQueueVoiceCallsResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return

            const index = oldData.data.data.findIndex(
                (call) => call.id === voiceCall.id,
            )
            // Call found, skip adding it again
            if (index !== -1) {
                return oldData
            }
            const newData = cloneDeep(oldData)

            if (isVoiceCallIncludedInFilters(voiceCall, params)) {
                newData.data.data.unshift(voiceCall)
            }

            return newData
        },
    )
}

export const updateVoiceCallInLiveCallsQueryCache = (
    voiceCall: Partial<LiveCallQueueVoiceCall>,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueVoiceCalls(params)

    appQueryClient.setQueryData<ListLiveCallQueueVoiceCallsResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return
            const index = oldData.data.data.findIndex(
                (call) => call.id === voiceCall.id,
            )
            // Call not found, no update needed
            if (index === -1) {
                return oldData
            }

            const newData = cloneDeep(oldData)
            const existingCall = newData.data.data[index]

            const newVoiceCall = merge({}, existingCall, voiceCall)
            if (isVoiceCallIncludedInFilters(newVoiceCall, params)) {
                newData.data.data[index] = merge(existingCall, newVoiceCall)
            } else {
                // remove the call if it no longer matches the filters
                newData.data.data.splice(index, 1)
            }

            return newData
        },
    )
}

export const updateAgentStatusInLiveAgentsQueryCache = (
    agentId: number,
    status: Partial<LiveCallQueueAgentCallStatusesItem>,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsQueryResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return
            const index = oldData.data.data.findIndex(
                (agent) => agent.id === agentId,
            )
            if (index === -1) return oldData // Agent not found, no update needed

            const newData = cloneDeep(oldData)
            const existingAgent = newData.data.data[index]

            const updatedCallStatuses = [...(existingAgent.call_statuses ?? [])]
            const callStatusIndex = updatedCallStatuses.findIndex(
                (cs) => cs.call_sid === status.call_sid,
            )

            if (callStatusIndex !== -1) {
                // Update existing call status
                updatedCallStatuses[callStatusIndex] = merge(
                    updatedCallStatuses[callStatusIndex],
                    status,
                )
            } else {
                // Add new call status
                updatedCallStatuses.push(status)
            }

            newData.data.data[index] = {
                ...existingAgent,
                call_statuses: updatedCallStatuses,
            }
            return newData
        },
    )
}

export const removeAgentStatusInLiveAgentsQueryCache = (
    agentId: number,
    callSid: string | undefined,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsQueryResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return
            const index = oldData.data.data.findIndex(
                (agent) => agent.id === agentId,
            )
            if (index === -1) return oldData // Agent not found, no update needed

            const newData = cloneDeep(oldData)
            const existingAgent = newData.data.data[index]

            const updatedCallStatuses = (
                existingAgent.call_statuses ?? []
            ).filter((cs) => cs.call_sid !== callSid)

            newData.data.data[index] = {
                ...existingAgent,
                call_statuses: updatedCallStatuses,
            }
            return newData
        },
    )
}

export const removeVoiceCallInLiveCallsQueryCache = (
    callSid: string,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsQueryResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return

            const newData = cloneDeep(oldData)
            newData.data.data = newData.data.data.map((existingAgent) => ({
                ...existingAgent,
                call_statuses:
                    existingAgent.call_statuses?.filter(
                        (s) => s.call_sid !== callSid,
                    ) ?? [],
            }))
            return newData
        },
    )
}
