import type { UseQueryOptions } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'

import { CONVERT_DEFAULT_OPTIONS } from 'models/convert/constants'
import { useConvertApi } from 'pages/convert/common/hooks/useConvertApi'
import type { MutationOverrides } from 'types/query'

import {
    createCampaign,
    deleteCampaign,
    getCampaign,
    listCampaigns,
    suggestCampaignCopy,
    updateCampaign,
} from './resources'
import type { Campaign, CampaignListOptions, CampaignParams } from './types'

export const campaignKeys = {
    all: () => ['campaign'] as const,
    lists: () => [...campaignKeys.all(), 'list'] as const,
    list: (params: CampaignListOptions) =>
        [...campaignKeys.lists(), params] as const,
    details: () => [...campaignKeys.all(), 'detail'] as const,
    detail: (params: CampaignParams) =>
        [...campaignKeys.details(), params] as const,
}

export const useGetCampaign = (
    params: CampaignParams,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof getCampaign>>,
        unknown,
        Campaign
    >,
) => {
    const { client: convertClient } = useConvertApi()

    return useQuery({
        queryKey: campaignKeys.detail(params),
        queryFn: () => getCampaign(convertClient, params),
        select: (data) => (data?.data ?? {}) as Campaign,
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useListCampaigns = (
    params: CampaignListOptions,
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof listCampaigns>>,
        unknown,
        Campaign[]
    >,
) => {
    const { client: convertClient } = useConvertApi()

    return useQuery({
        queryKey: campaignKeys.list(params),
        queryFn: () => listCampaigns(convertClient, params),
        select: (data) => (data?.data ?? []) as Campaign[],
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
        enabled: !!convertClient && (overrides?.enabled ?? true),
    })
}

export const useCreateCampaign = (
    overrides?: MutationOverrides<typeof createCampaign>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, data]) =>
            createCampaign(client, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useUpdateCampaign = (
    overrides?: MutationOverrides<typeof updateCampaign>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams, data]) =>
            updateCampaign(client, pathParams, data),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useDeleteCampaign = (
    overrides?: MutationOverrides<typeof deleteCampaign>,
) => {
    const { client: convertClient } = useConvertApi()

    return useMutation({
        mutationFn: ([client = convertClient, pathParams]) =>
            deleteCampaign(client, pathParams),
        ...CONVERT_DEFAULT_OPTIONS,
        ...overrides,
    })
}

export const useSuggestCampaignCopy = (
    overrides?: MutationOverrides<typeof suggestCampaignCopy>,
) => {
    const { client: convertClient } = useConvertApi()
    const suggestCampaignCopyOptions = {
        ...CONVERT_DEFAULT_OPTIONS,
        staleTime: 0,
        cacheTime: 0,
    }

    return useMutation({
        mutationFn: ([client = convertClient, data]) =>
            suggestCampaignCopy(client, data),
        ...suggestCampaignCopyOptions,
        ...overrides,
    })
}
