import { useCallback, useEffect, useState } from 'react'

import type { ShopifyIntegration } from 'models/integration/types'

type UseSpqInstallationStatusResult = {
    isSpqInstalled: boolean | undefined
    isLoaded: boolean
}

const useSpqInstallationStatus = (
    shopifyIntegration: ShopifyIntegration | undefined,
): UseSpqInstallationStatusResult => {
    const [isSpqInstalled, setIsSpqInstalled] = useState<boolean | undefined>()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    const fetchData = useCallback(async () => {
        if (!shopifyIntegration?.id) {
            return
        }

        try {
            const response = await fetch(
                `/integrations/shopify/${shopifyIntegration.id}/spq/status/`,
            )
            const result = (await response.json()) as { is_installed: boolean }
            setIsSpqInstalled(result.is_installed)
        } catch (err) {
            setIsSpqInstalled(undefined)
            console.error(err)
        }
    }, [shopifyIntegration?.id])

    useEffect(() => {
        setIsLoaded(false)
        void fetchData().finally(() => setIsLoaded(true))
    }, [fetchData])

    return {
        isSpqInstalled,
        isLoaded,
    }
}

export default useSpqInstallationStatus
