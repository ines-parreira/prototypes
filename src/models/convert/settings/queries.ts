import {useMutation, UseQueryOptions, useQuery} from '@tanstack/react-query'

import {CONVERT_DEFAULT_OPTIONS} from 'models/convert/constants'
import {useConvertApi} from 'pages/convert/common/hooks/useConvertApi'
import {MutationOverrides} from 'types/query'

import {getSettingsList, updateSettings} from './resources'
import {SettingsParams, Setting} from './types'

export const convertSettingsKeys = {
    all: () => ['convertSettings'] as const,
    lists: () => [...convertSettingsKeys.all(), 'list'] as const,
    list: (params?: SettingsParams) =>
        [...convertSettingsKeys.lists(), params] as const,
}

export const useUpdateSetting = (
    overrides?: MutationOverrides<typeof updateSettings>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams, data]) =>
            updateSettings(client, pathParams, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useGetSettingsList = (
    params: SettingsParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getSettingsList>>,
        unknown,
        Setting[]
    >
) => {
    const {client: convertClient} = useConvertApi()

    return useQuery({
        queryKey: convertSettingsKeys.list(params),
        queryFn: () => getSettingsList(convertClient, params),
        select: (data) => (data?.data ?? []) as Setting[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}
