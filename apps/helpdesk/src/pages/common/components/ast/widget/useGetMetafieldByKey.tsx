import { useMemo } from 'react'

import { useMetafieldDefinitions } from 'pages/settings/storeManagement/storeDetailsPage/ShopifyMetafields/hooks/useMetafieldDefinitions'

export const useGetMetafieldByKey = (
    metafieldKey?: string | null,
    integrationId?: number,
) => {
    const { data: metafields = [] } = useMetafieldDefinitions({
        integrationId: integrationId ?? 0,
        pinned: true,
    })

    const metafield = useMemo(() => {
        if (!metafieldKey) {
            return null
        }
        return metafields.find((field) => field.key === metafieldKey) ?? null
    }, [metafieldKey, metafields])

    return metafield
}
