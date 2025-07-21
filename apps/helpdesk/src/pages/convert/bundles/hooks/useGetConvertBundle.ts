import { useMemo } from 'react'

import { useListBundles } from 'models/convert/bundle/queries'

export const useGetConvertBundle = (
    storeIntegrationId: number,
    chatIntegrationId?: number,
    overrides?: { staleTime?: number },
) => {
    const { data: bundles, isLoading } = useListBundles({
        enabled: !!storeIntegrationId || !!chatIntegrationId,
        ...overrides,
    })

    const bundle = useMemo(() => {
        if (!bundles || !Array.isArray(bundles)) return undefined

        return bundles.find((bundle) => {
            return (
                bundle.shop_integration_id === storeIntegrationId ||
                bundle.shop_integration_id === chatIntegrationId
            )
        })
    }, [bundles, storeIntegrationId, chatIntegrationId])

    return { isLoading, bundle }
}
