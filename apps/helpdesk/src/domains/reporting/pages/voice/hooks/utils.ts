import { cloneDeep, merge } from 'lodash'
import debounce from 'lodash/debounce'
import moment from 'moment/moment'

import {
    ListLiveCallQueueAgentsResult,
    ListLiveCallQueueVoiceCallsParams,
    ListLiveCallQueueVoiceCallsResult,
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItem,
    LiveCallQueueVoiceCall,
    queryKeys,
} from '@gorgias/helpdesk-queries'
import { AgentStatus } from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import { VALID_LIVE_STATUSES } from 'domains/reporting/pages/voice/constants/liveVoice'

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

export const debouncedUpdateVoiceCallInLiveCallsQueryCache = debounce(
    (
        voiceCall: Partial<LiveCallQueueVoiceCall>,
        params: ListLiveCallQueueVoiceCallsParams | undefined,
    ) => {
        updateVoiceCallInLiveCallsQueryCache(voiceCall, params)
    },
    250,
)

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

export const updateVoiceCallInLiveCallsQueryCacheWithDebounce = (
    voiceCall: Partial<LiveCallQueueVoiceCall>,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
    shouldDebounce: boolean,
) => {
    if (shouldDebounce) {
        debouncedUpdateVoiceCallInLiveCallsQueryCache(voiceCall, params)
    } else {
        // If debounce is not needed, update immediately
        updateVoiceCallInLiveCallsQueryCache(voiceCall, params)
    }
}

export const updateAgentAvailabilityInLiveAgentsQueryCache = (
    agentId: number,
    availability: Partial<LiveCallQueueAgent>,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return
            const index = oldData.data.data.findIndex(
                (agent) => agent.id === agentId,
            )
            if (index === -1) return oldData // Agent not found, no update needed

            const newData = cloneDeep(oldData)
            const existingAgent = newData.data.data[index]

            const updatedAgent = merge({}, existingAgent, availability)

            newData.data.data[index] = updatedAgent

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

    appQueryClient.setQueryData<ListLiveCallQueueAgentsResult>(
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
    ignoreWrapUp = true,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return
            const index = oldData.data.data.findIndex(
                (agent) => agent.id === agentId,
            )
            if (index === -1) return oldData // Agent not found, no update needed

            const newData = cloneDeep(oldData)
            const existingAgent = newData.data.data[index]

            const updatedCallStatuses =
                existingAgent.call_statuses?.filter(
                    (s) =>
                        s.call_sid !== callSid ||
                        (ignoreWrapUp && s.status === AgentStatus.WrappingUp),
                ) ?? []

            newData.data.data[index] = {
                ...existingAgent,
                call_statuses: updatedCallStatuses,
            }
            return newData
        },
    )
}

export const removeVoiceCallInLiveAgentsQueryCache = (
    callSid: string,
    params: ListLiveCallQueueVoiceCallsParams | undefined,
    ignoreWrapUp = true,
) => {
    const queryKey =
        queryKeys.voiceCallLiveQueue.listLiveCallQueueAgents(params)

    appQueryClient.setQueryData<ListLiveCallQueueAgentsResult>(
        queryKey,
        (oldData) => {
            if (!oldData) return

            const newData = cloneDeep(oldData)
            newData.data.data = newData.data.data.map((existingAgent) => ({
                ...existingAgent,
                call_statuses:
                    existingAgent.call_statuses?.filter(
                        (s) =>
                            s.call_sid !== callSid ||
                            (ignoreWrapUp &&
                                s.status === AgentStatus.WrappingUp),
                    ) ?? [],
            }))

            return newData
        },
    )
}

export const getWrapUpStatusesThatShouldExpire = (
    agents?: LiveCallQueueAgent[],
) => {
    return (
        agents?.reduce((res: LiveCallQueueAgentCallStatusesItem[], agent) => {
            const callStatuses =
                agent.call_statuses?.filter(
                    (call) =>
                        call.status === AgentStatus.WrappingUp &&
                        call.expiration_datetime,
                ) ?? []
            return [...res, ...callStatuses]
        }, []) ?? []
    )
}

export const setWrapUpExpirationTimer = (
    timeouts: React.MutableRefObject<Record<string, NodeJS.Timeout>>,
    status: LiveCallQueueAgentCallStatusesItem,
    params?: ListLiveCallQueueVoiceCallsParams,
) => {
    if (status.expiration_datetime) {
        const expiresAt = moment.utc(status.expiration_datetime)
        const now = moment.utc()
        const timeLeft = expiresAt.diff(now)

        if (
            timeLeft > 0 &&
            !timeouts.current[`${status.agent_id}-${status.call_sid}`]
        ) {
            timeouts.current[`${status.agent_id}-${status.call_sid}`] =
                setTimeout(() => {
                    if (status.agent_id && status.call_sid) {
                        removeAgentStatusInLiveAgentsQueryCache(
                            status.agent_id,
                            status.call_sid,
                            params,
                            false,
                        )
                    }
                }, timeLeft)
        }
    }
}
