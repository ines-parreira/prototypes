import { useMemo } from 'react'

import { useGetFirstValidIntegration } from 'pages/stats/convert/hooks/useGetFirstValidIntegration'

export function useGetNamespacedShopNameForStore(
    selectedIntegrations: number[],
) {
    const selectedIntegration =
        useGetFirstValidIntegration(selectedIntegrations)

    const namespacedShopName = useMemo(() => {
        return selectedIntegration?.meta?.shop_name && selectedIntegration?.type
            ? `${selectedIntegration.type}:${selectedIntegration.meta.shop_name}`
            : ''
    }, [selectedIntegration])

    return namespacedShopName
}
