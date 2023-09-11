import {stringify} from 'qs'
import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {TicketVoiceCall, ListTicketVoiceCallsParams} from './types'

export async function listTicketVoiceCalls(
    params?: ListTicketVoiceCallsParams
): Promise<ApiListResponseCursorPagination<TicketVoiceCall[]>> {
    const response = await client.get<
        ApiListResponseCursorPagination<TicketVoiceCall[]>
    >(`/api/phone/voice-calls/`, {
        params,
        paramsSerializer: stringify,
    })
    return response.data
}
