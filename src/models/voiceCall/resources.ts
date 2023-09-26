import {stringify} from 'qs'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {VoiceCall, ListVoiceCallsParams} from './types'

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
