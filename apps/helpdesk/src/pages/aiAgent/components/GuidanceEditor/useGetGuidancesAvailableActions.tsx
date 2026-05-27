import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CACHE_TIME_MS, STALE_TIME_MS } from 'models/workflows/queries'
import type {
    GuidanceAction,
    MissingValuesDetail,
} from 'pages/common/draftjs/plugins/guidanceActions/types'
import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'
import type { Paths } from 'rest_api/workflows_api/client.generated'

type StoreConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
type StoreType = Paths.StoreWfConfigurationControllerList.Parameters.StoreType

const fetchStoreGuidanceActions = async (
    shopName: string,
    shopType: StoreType,
): Promise<StoreConfiguration[]> => {
    const client = await getGorgiasWfApiClient()
    const response = await client.StoreWfConfigurationController_list(
        {
            store_name: shopName,
            store_type: shopType,
            triggers: ['llm-prompt'],
        },
        {},
        { paramsSerializer: { indexes: false } },
    )
    return response.data
}

const getMissingValuesDetails = (
    action: StoreConfiguration,
): MissingValuesDetail[] => {
    const details: MissingValuesDetail[] = []

    const inputs = action.inputs ?? []
    const values = action.values
    const missingTopLevel = inputs
        .filter((input) => !values || !(input.id in values))
        .map((input) => input.name)
    if (missingTopLevel.length > 0) {
        details.push({ inputNames: missingTopLevel })
    }

    return details
}

export const useGetGuidancesAvailableActions = (
    shopName: string,
    shopType: string,
    enabled = true,
) => {
    const canFetch = enabled && !!shopName && shopType === 'shopify'

    const { data: allActions = [], isLoading } = useQuery({
        queryKey: ['guidance-actions-all', shopName, shopType],
        queryFn: () =>
            fetchStoreGuidanceActions(shopName, shopType as StoreType),
        enabled: canFetch,
        refetchOnMount: 'always',
        keepPreviousData: true,
        staleTime: STALE_TIME_MS,
        cacheTime: CACHE_TIME_MS,
    })

    const guidanceActions: GuidanceAction[] = useMemo(() => {
        return allActions.map((action) => {
            const missingValuesDetails = action.has_missing_values
                ? getMissingValuesDetails(action)
                : []
            return {
                name: action.name,
                value: action.id,
                enabled: action.enabled,
                requiresAuth: action.requires_auth,
                hasMissingValues: action.has_missing_values,
                missingValuesDetails:
                    missingValuesDetails.length > 0
                        ? missingValuesDetails
                        : undefined,
            }
        })
    }, [allActions])

    return {
        isLoading,
        guidanceActions,
        rawActions: allActions,
    }
}
