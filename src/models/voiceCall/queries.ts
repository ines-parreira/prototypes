import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {ListVoiceCallsParams} from './types'
import {listVoiceCalls} from './resources'

export const voiceCallsKeys = {
    all: () => ['voiceCalls'] as const,
    lists: () => [...voiceCallsKeys.all(), 'list'] as const,
    list: (params?: ListVoiceCallsParams) => [
        ...voiceCallsKeys.lists(),
        params,
    ],
}

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
