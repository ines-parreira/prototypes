import {useMutation, UseQueryOptions, useQuery} from '@tanstack/react-query'
import {
    createChannelConnection,
    deleteChannelConnection,
    getChannelConnection,
    listChannelConnections,
    updateChannelConnection,
} from 'models/convert/channelConnection/resources'
import {useConvertApi} from 'pages/convert/common/hooks/useConvertApi'
import {Paths} from 'rest_api/revenue_addon_api/client.generated'
import {MutationOverrides} from 'types/query'
import {
    ChannelConnection,
    ChannelConnectionListOptions,
} from 'models/convert/channelConnection/types'
import {CONVERT_DEFAULT_OPTIONS} from '../constants'

export const channelConnectionKeys = {
    all: () => ['channelConnection'] as const,
    lists: () => [...channelConnectionKeys.all(), 'list'] as const,
    list: (params?: ChannelConnectionListOptions) =>
        [...channelConnectionKeys.lists(), params] as const,
    details: () => [...channelConnectionKeys.all(), 'detail'] as const,
    detail: (params: Paths.GetChannelConnection.PathParameters) =>
        [...channelConnectionKeys.details(), params] as const,
}

export const useGetChannelConnection = (
    params: Paths.GetChannelConnection.PathParameters,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getChannelConnection>>,
        unknown,
        ChannelConnection
    >
) => {
    const {client: convertClient} = useConvertApi()

    return useQuery({
        queryKey: channelConnectionKeys.detail(params),
        queryFn: () => getChannelConnection(convertClient, params),
        select: (data) => (data?.data ?? {}) as ChannelConnection,
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useListChannelConnections = (
    params?: ChannelConnectionListOptions,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listChannelConnections>>,
        unknown,
        ChannelConnection[]
    >
) => {
    const {client: convertClient} = useConvertApi()

    return useQuery({
        queryKey: channelConnectionKeys.list(params),
        queryFn: () => listChannelConnections(convertClient, params),
        select: (data) => (data?.data ?? []) as ChannelConnection[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useCreateChannelConnection = (
    overrides?: MutationOverrides<typeof createChannelConnection>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, data]) =>
            createChannelConnection(client, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useUpdateChannelConnection = (
    overrides?: MutationOverrides<typeof updateChannelConnection>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams, data]) =>
            updateChannelConnection(client, pathParams, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useDeleteChannelConnection = (
    overrides?: MutationOverrides<typeof deleteChannelConnection>
) => {
    const {client: convertClient} = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams]) =>
            deleteChannelConnection(client, pathParams),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}
