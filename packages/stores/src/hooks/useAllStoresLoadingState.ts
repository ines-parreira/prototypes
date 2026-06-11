import { useAllIntegrationsLoadingState } from '@repo/integrations'

import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import { STORE_MAPPINGS_QUERY_OPTIONS } from './storeMappingsQueryOptions'

// Stores depend on two queries: the shared all-integrations fetch and the
// account's store mappings. Loading/error reflect either.
export function useAllStoresLoadingState() {
    const integrations = useAllIntegrationsLoadingState()
    const { isLoading, isError } = useGetStoreMappingsByAccountId({
        query: STORE_MAPPINGS_QUERY_OPTIONS,
    })

    return {
        isLoading: integrations.isLoading || isLoading,
        isError: integrations.isError || isError,
    }
}
