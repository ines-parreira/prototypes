import {stringify} from 'qs'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    VoiceCall,
    ListVoiceCallsParams,
    ListCallRecordingsParams,
    VoiceCallRecording,
} from './types'

export async function listVoiceCalls(
    params?: ListVoiceCallsParams
): Promise<ApiListResponseCursorPagination<VoiceCall[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<VoiceCall[]>
    >(`/api/phone/voice-calls/`, {
        params,
        paramsSerializer: stringify,
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
        paramsSerializer: stringify,
    })

    return response
}
