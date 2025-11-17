import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import useAllIntegrations from 'hooks/useAllIntegrations'
import type { Integration } from 'models/integration/types'

import enrichStores from '../helpers/enrichStores'
import getUnassignedChannels from '../helpers/getUnassignedChannels'
import type { StoreMappingResponse } from '../types'

export default function useStoresWithMaps() {
    const {
        data: storeMappings,
        refetch,
        isLoading: isLoadingStoreMappings,
    } = useGetStoreMappingsByAccountId<StoreMappingResponse>()

    const {
        integrations: allIntegrations,
        isLoading: isLoadingAllIntegrations,
        refetch: refetchIntegrations,
    } = useAllIntegrations()

    const enrichedStores = enrichStores(
        storeMappings?.data?.data || [],
        (allIntegrations || []) as Integration[],
    )

    const unassignedChannels = getUnassignedChannels(
        (allIntegrations || []) as Integration[],
        storeMappings?.data?.data || [],
    )

    return {
        enrichedStores,
        unassignedChannels,
        refetchMapping: refetch,
        refetchIntegrations,
        isLoading:
            (!storeMappings || !allIntegrations?.length) &&
            (isLoadingStoreMappings || isLoadingAllIntegrations),
    }
}
