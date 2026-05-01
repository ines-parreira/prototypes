import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { getAllJourneysPublic, JourneyTypeEnum } from '@gorgias/convert-client'

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

    // Accept both response shapes: legacy JourneyApiDTO[] and the new
    // { built_in, custom: { items } } shape introduced in convert-service
    // aijou-1661. Without this, once the backend stops emitting the legacy
    // shape custom flows silently disappear from the table.
    const data = response.data as unknown as
        | { built_in: JourneyApiDTO[]; custom: { items: JourneyApiDTO[] } }
        | JourneyApiDTO[]
        | null
        | undefined
    let items: JourneyApiDTO[] = []
    if (Array.isArray(data)) {
        items = data
    } else if (data) {
        items = [...(data.built_in ?? []), ...(data.custom?.items ?? [])]
    }

    const builtIn = items.filter((j) => j.type !== JourneyTypeEnum.Custom)
    const custom = items.filter((j) => j.type === JourneyTypeEnum.Custom)

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
