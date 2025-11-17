import { useCallback, useEffect, useState } from 'react'

import type { ShopifyIntegration } from 'models/integration/types'

import useThemeAppExtensionInstallation from './useThemeAppExtensionInstallation'

const useShopifyThemeAppExtension = ({
    shopifyIntegration,
    appUuid,
}: {
    appUuid: string
    shopifyIntegration?: ShopifyIntegration
}) => {
    const [isInstalled, setIsInstalled] = useState<boolean | undefined>()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(shopifyIntegration)

    const fetchData = useCallback(async () => {
        if (
            !shopifyIntegration?.id ||
            !appUuid ||
            !shouldUseThemeAppExtensionInstallation
        ) {
            return
        }

        try {
            const response = await fetch(
                `/integrations/shopify/${shopifyIntegration.id}/gorgias-theme-app-extension/status/${appUuid}`,
            )
            const result = (await response.json()) as { is_installed: boolean }
            void setIsInstalled(result.is_installed)
        } catch (err) {
            setIsInstalled(undefined)
            console.error(err)
        }
    }, [
        appUuid,
        shopifyIntegration?.id,
        shouldUseThemeAppExtensionInstallation,
    ])

    useEffect(() => {
        setIsLoaded(false)
        void fetchData().finally(() => setIsLoaded(true))
    }, [fetchData])

    return {
        isInstalled,
        isLoaded,
    }
}

export default useShopifyThemeAppExtension
