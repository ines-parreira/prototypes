import {searchVoiceCalls as apiSearchVoiceCalls} from '@gorgias/api-client'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'
import {
    VoiceCallSearchOptions,
    VoiceCallWithHighlightsResponse,
} from 'models/search/types'
import {mergeEntitiesWithHighlights} from 'models/search/utils'

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

export const searchVoiceCalls = async ({
    search,
    cancelToken,
    withHighlights,
    cursor,
    ...rest
}: VoiceCallSearchOptions) => {
    return await apiSearchVoiceCalls(
        {
            search: search ?? '',
        },
        {
            ...deepMapKeysToSnakeCase({
                ...rest,
                cursor,
                withHighlights,
            }),
        },
        {
            ...(cancelToken ? {cancelToken} : {}),
        }
    )
}

export const searchVoiceCallsWithHighlights = (
    options: Omit<VoiceCallSearchOptions, 'withHighlights'>
) =>
    searchVoiceCalls({...options, withHighlights: true}).then((resp) => ({
        ...resp,
        data: {
            ...resp.data,
            data: (resp.data?.data as VoiceCallWithHighlightsResponse[]).map(
                mergeEntitiesWithHighlights
            ),
        },
    }))
