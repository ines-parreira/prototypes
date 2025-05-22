import { useGetStoreMappingsByAccountId } from '@gorgias/api-queries'

import useAllIntegrations from 'hooks/useAllIntegrations'
import { Integration } from 'models/integration/types'

import enrichStores from '../helpers/enrichStores'
import getUnassignedChannels from '../helpers/getUnassignedChannels'
import { StoreMappingResponse } from '../types'

export default function useStoresWithMaps() {
    const { data: storeMappings, refetch } =
        useGetStoreMappingsByAccountId<StoreMappingResponse>()

    const { integrations: allIntegrations } = useAllIntegrations()

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
    }
}
