import { useMemo } from 'react'

import { useAllIntegrations } from '@repo/integrations'

import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import { isStoreIntegration, type StoreIntegration } from '../types'
import { STORE_MAPPINGS_QUERY_OPTIONS } from './storeMappingsQueryOptions'

// The set of stores is sourced from the account's store mappings (the
// authoritative `store_id`s), resolved to their integration objects from the
// shared `useAllIntegrations` query. Both ride cached queries, so no extra
// request is made per consumer.
export function useAllStores(): StoreIntegration[] {
    const integrations = useAllIntegrations()
    const { data } = useGetStoreMappingsByAccountId({
        query: STORE_MAPPINGS_QUERY_OPTIONS,
    })

    return useMemo(() => {
        const mappings = data?.data?.data ?? []
        const storeIds = new Set(mappings.map((mapping) => mapping.store_id))
        const integrationsById = new Map(
            integrations.map((integration) => [integration.id, integration]),
        )

        return [...storeIds]
            .map((storeId) => integrationsById.get(storeId))
            .filter(
                (integration): integration is StoreIntegration =>
                    integration !== undefined &&
                    isStoreIntegration(integration),
            )
    }, [integrations, data])
}
