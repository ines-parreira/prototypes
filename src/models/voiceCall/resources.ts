import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'

import {
    VoiceCall,
    ListVoiceCallsParams,
    ListCallRecordingsParams,
    VoiceCallRecording,
    ListCallEventsParams,
    VoiceCallEvent,
} from './types'

export async function listVoiceCalls(
    params?: ListVoiceCallsParams
): Promise<ApiListResponseCursorPagination<VoiceCall[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<VoiceCall[]>
    >(`/api/phone/voice-calls/`, {
        params,
    })

    return response.data
}

export async function listVoiceCallRecordings(
    params?: ListCallRecordingsParams
) {
    const response = await client.get<
        ApiListResponseCursorPagination<VoiceCallRecording[]>
    >(`/api/phone/voice-call-recordings/`, {
        params,
    })

    return response
}

export async function listVoiceCallEvents(params?: ListCallEventsParams) {
    const response = await client.get<
        ApiListResponseCursorPagination<VoiceCallEvent[]>
    >(`/api/phone/voice-call-events/`, {
        params,
    })

    return response
}
