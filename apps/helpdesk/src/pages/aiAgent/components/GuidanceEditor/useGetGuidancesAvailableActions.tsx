import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { useListStores } from '@gorgias/helpdesk-queries'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import {
    useListServiceConnectionsByAppIds,
    useListServiceConnectionStoresByConnectionIds,
} from 'models/integration/queries'
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

const collectActionAppIds = (action: StoreConfiguration): string[] => {
    const ids: string[] = []
    for (const templateApp of action.apps ?? []) {
        if (templateApp.type === 'app') {
            ids.push(templateApp.app_id)
        }
    }
    return ids
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

    const { isEnabled: isCentralizedLibraryEnabled } =
        useActionCentralizedLibraryEnabled()

    const { data: storesResponse } = useListStores(
        { limit: 100 },
        {
            query: {
                enabled: canFetch && isCentralizedLibraryEnabled,
            },
        },
    )
    const currentStoreId = useMemo(() => {
        if (!shopName) return undefined
        return storesResponse?.data?.data?.find(
            (store) => store.name === shopName,
        )?.store_integration_id
    }, [storesResponse, shopName])

    const uniqueAppIds = useMemo(() => {
        if (!isCentralizedLibraryEnabled) return []
        const ids = new Set<string>()
        for (const action of allActions) {
            for (const appId of collectActionAppIds(action)) {
                ids.add(appId)
            }
        }
        return [...ids]
    }, [allActions, isCentralizedLibraryEnabled])

    const connectionQueries = useListServiceConnectionsByAppIds(uniqueAppIds)

    const connectionIds = useMemo(
        () =>
            connectionQueries.flatMap((query) =>
                query.isSuccess ? query.data.map((c) => c.id) : [],
            ),
        [connectionQueries],
    )
    const storeQueries =
        useListServiceConnectionStoresByConnectionIds(connectionIds)

    const storesByConnectionId = useMemo(() => {
        const map = new Map<string, ReadonlySet<number>>()
        connectionIds.forEach((connectionId, index) => {
            const query = storeQueries[index]
            if (!query?.isSuccess) return
            map.set(
                connectionId,
                new Set(query.data.map((store) => store.store_id)),
            )
        })
        return map
    }, [connectionIds, storeQueries])

    const hasConnectionByAppId = useMemo(() => {
        const map: Partial<Record<string, boolean>> = {}
        uniqueAppIds.forEach((appId, index) => {
            const connectionQuery = connectionQueries[index]
            if (!connectionQuery?.isSuccess) return
            map[appId] = connectionQuery.data.some((connection) => {
                if (currentStoreId == null) {
                    return true
                }
                const assignedStoreIds = storesByConnectionId.get(connection.id)
                return assignedStoreIds?.has(currentStoreId) ?? false
            })
        })
        return map
    }, [uniqueAppIds, connectionQueries, storesByConnectionId, currentStoreId])

    const isConnectionsLoading =
        isCentralizedLibraryEnabled &&
        (connectionQueries.some((query) => query.isInitialLoading) ||
            storeQueries.some((query) => query.isInitialLoading))

    const guidanceActions: GuidanceAction[] = useMemo(() => {
        return allActions.map((action) => {
            const missingValuesDetails = action.has_missing_values
                ? getMissingValuesDetails(action)
                : []
            const hasConnectionForAction =
                isCentralizedLibraryEnabled &&
                collectActionAppIds(action).some(
                    (appId) => hasConnectionByAppId[appId] === true,
                )
            const requiresAuth = action.requires_auth && !hasConnectionForAction
            return {
                name: action.name,
                value: action.id,
                enabled: action.enabled,
                requiresAuth,
                hasMissingValues: action.has_missing_values,
                missingValuesDetails:
                    missingValuesDetails.length > 0
                        ? missingValuesDetails
                        : undefined,
            }
        })
    }, [allActions, hasConnectionByAppId, isCentralizedLibraryEnabled])

    return {
        isLoading: isLoading || isConnectionsLoading,
        guidanceActions,
        rawActions: allActions,
    }
}
