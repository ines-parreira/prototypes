import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {ListCallRecordingsParams, ListVoiceCallsParams} from './types'
import {listVoiceCallRecordings, listVoiceCalls} from './resources'

export const voiceCallsKeys = {
    all: () => ['voiceCalls'] as const,
    lists: () => [...voiceCallsKeys.all(), 'list'] as const,
    list: (params?: ListVoiceCallsParams) => [
        ...voiceCallsKeys.lists(),
        params,
    ],
    listRecordings: (params?: ListCallRecordingsParams) =>
        [...voiceCallsKeys.all(), 'recordings', params] as const,
}

export type UseListVoiceCalls = Awaited<ReturnType<typeof listVoiceCalls>>

export const useListVoiceCalls = (
    params?: ListVoiceCallsParams,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof listVoiceCalls>>>
) => {
    return useQuery({
        queryKey: voiceCallsKeys.list(params),
        queryFn: () => listVoiceCalls(params),
        ...overrides,
    })
}

export const useListRecordings = (
    params?: ListCallRecordingsParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listVoiceCallRecordings>>
    >
) => {
    return useQuery({
        queryKey: voiceCallsKeys.listRecordings(params),
        queryFn: () => listVoiceCallRecordings(params),
        ...overrides,
    })
}
