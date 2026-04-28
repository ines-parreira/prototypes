import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { getAllJourneysPublic } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

export type FlowsListResponse = {
    built_in: JourneyApiDTO[]
    custom: JourneyApiDTO[]
}

export const CUSTOM_FLOWS_PAGE_SIZE = 10

const fetchFlowsList = async (
    integrationId: number,
): Promise<FlowsListResponse> => {
    const response = await getAllJourneysPublic(
        { integration_id: integrationId },
        { baseURL: getGorgiasRevenueAddonApiBaseUrl() },
    )

    const items = Array.isArray(response.data) ? response.data : []
    const builtIn = items.filter((j) => (j.type as string) !== 'custom')
    const custom = items.filter((j) => (j.type as string) === 'custom')

    return { built_in: builtIn, custom }
}

export const flowsListKeys = {
    all: () => ['flowsList'] as const,
    list: (integrationId: number | undefined) =>
        [...flowsListKeys.all(), integrationId] as const,
}

export const useFlowsList = (
    integrationId: number | undefined,
    options: UseQueryOptions<FlowsListResponse> = {},
) => {
    return useQuery({
        queryKey: flowsListKeys.list(integrationId),
        queryFn: () => fetchFlowsList(integrationId!),
        enabled: !!integrationId && options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        ...options,
    })
}
