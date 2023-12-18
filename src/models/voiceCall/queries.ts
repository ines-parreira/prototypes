import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {
    ListCallEventsParams,
    ListCallRecordingsParams,
    ListVoiceCallsParams,
} from './types'
import {
    listVoiceCallEvents,
    listVoiceCallRecordings,
    listVoiceCalls,
} from './resources'

export const voiceCallsKeys = {
    all: () => ['voiceCalls'] as const,
    lists: () => [...voiceCallsKeys.all(), 'list'] as const,
    list: (params?: ListVoiceCallsParams) => [
        ...voiceCallsKeys.lists(),
        params,
    ],
    listRecordings: (params?: ListCallRecordingsParams) =>
        [...voiceCallsKeys.all(), 'recordings', params] as const,
    listEvents: (params?: ListCallEventsParams) =>
        [...voiceCallsKeys.all(), 'events', params] as const,
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

export const useListVoiceCallEvents = (
    params?: ListCallEventsParams,
    overrides?: UseQueryOptions<Awaited<ReturnType<typeof listVoiceCallEvents>>>
) => {
    return useQuery({
        queryKey: voiceCallsKeys.listEvents(params),
        queryFn: () => listVoiceCallEvents(params),
        ...overrides,
    })
}
