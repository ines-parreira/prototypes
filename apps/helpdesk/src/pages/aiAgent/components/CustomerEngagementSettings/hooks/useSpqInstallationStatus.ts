import { useCallback, useEffect, useMemo, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type {
    GorgiasChatIntegration,
    ShopifyIntegration,
} from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getInstallationStatuses } from 'state/integrations/actions'
import { getIntegrationsByType } from 'state/integrations/selectors'

type UseSpqInstallationStatusResult = {
    isSpqInstalled: boolean | undefined
    isLoaded: boolean
}

const useSpqInstallationStatus = (
    shopifyIntegration: ShopifyIntegration | undefined,
): UseSpqInstallationStatusResult => {
    const [isSpqInstalledViaEndpoint, setIsSpqInstalledViaEndpoint] = useState<
        boolean | undefined
    >()
    const [
        isSpqInstalledViaInstallationStatus,
        setIsSpqInstalledViaInstallationStatus,
    ] = useState<boolean | undefined>()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    const getChatIntegrations = useMemo(
        () =>
            getIntegrationsByType<GorgiasChatIntegration>(
                IntegrationType.GorgiasChat,
            ),
        [],
    )
    const chatIntegrations = useAppSelector(getChatIntegrations)

    const chatAppIdsForStore = useMemo(() => {
        if (!shopifyIntegration?.id) {
            return new Set<number>()
        }

        return new Set(
            chatIntegrations
                .filter(
                    (chat) =>
                        chat.meta.shop_integration_id === shopifyIntegration.id,
                )
                .map((chat) => chat.meta.app_id)
                .filter((appId): appId is string => appId !== undefined)
                .map((appId) => Number(appId)),
        )
    }, [chatIntegrations, shopifyIntegration?.id])

    const fetchData = useCallback(async () => {
        if (!shopifyIntegration?.id) {
            return
        }

        try {
            const [spqStatusResponse, installationStatusesResponse] =
                await Promise.all([
                    fetch(
                        `/integrations/shopify/${shopifyIntegration.id}/spq/status/`,
                    ),
                    getInstallationStatuses(),
                ])

            const spqStatusResult = (await spqStatusResponse.json()) as {
                is_installed: boolean
            }
            setIsSpqInstalledViaEndpoint(spqStatusResult.is_installed)

            const hasEmbeddedSpqInstalled =
                installationStatusesResponse.installationStatuses?.some(
                    (status) =>
                        chatAppIdsForStore.has(status.applicationId) &&
                        status.embeddedSpqInstalled,
                ) ?? false
            setIsSpqInstalledViaInstallationStatus(hasEmbeddedSpqInstalled)
        } catch (err) {
            setIsSpqInstalledViaEndpoint(undefined)
            setIsSpqInstalledViaInstallationStatus(undefined)
            console.error(err)
        }
    }, [shopifyIntegration?.id, chatAppIdsForStore])

    useEffect(() => {
        setIsLoaded(false)
        void fetchData().finally(() => setIsLoaded(true))
    }, [fetchData])

    const isSpqInstalled =
        isSpqInstalledViaEndpoint || isSpqInstalledViaInstallationStatus

    return {
        isSpqInstalled,
        isLoaded,
    }
}

export default useSpqInstallationStatus
