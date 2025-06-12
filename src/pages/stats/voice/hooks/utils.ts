import { cloneDeep } from 'lodash'
import moment from 'moment/moment'

import {
    ListLiveCallQueueVoiceCallsParams,
    ListLiveCallQueueVoiceCallsResult,
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
