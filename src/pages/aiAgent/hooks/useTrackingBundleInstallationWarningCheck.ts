import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useListBundles } from 'models/convert/bundle/queries'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'

import { StoreActivation } from '../Activation/hooks/storeActivationReducer'

export const useTrackingBundleInstallationWarningCheck = ({
    storeActivations,
}: {
    storeActivations: Record<string, StoreActivation>
}) => {
    const storeIntegrations = useShopifyIntegrations()

    const hasShoppingAssistant =
        useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]

    const { data: bundles } = useListBundles({
        enabled: hasShoppingAssistant,
    })

    const integrationsToCheck = Object.values(storeActivations)
        .filter(({ sales, support }) => sales.enabled && support.chat.enabled)
        .map(
            ({
                configuration,
                support: {
                    chat: { availableChats },
                },
            }) => {
                const integration = storeIntegrations.find(
                    ({ meta: { shop_name } }) =>
                        shop_name === configuration.storeName,
                )

                return {
                    storeIntegrationId: integration?.id,
                    chatIntegrationIds: availableChats || [],
                }
            },
        )

    const uninstalledChatIntegrationIds = useMemo(() => {
        if (!integrationsToCheck.length) {
            return undefined
        }

        if (!bundles?.length) {
            return integrationsToCheck[0].chatIntegrationIds
        }

        const bundlesIds = new Set(
            // even though the field is called `shop_integration_id`, it can also contain chat integration ids
            bundles.map(({ shop_integration_id }) => shop_integration_id),
        )

        return integrationsToCheck
            .filter(
                ({ storeIntegrationId }) =>
                    !storeIntegrationId || !bundlesIds.has(storeIntegrationId),
            )
            .flatMap(({ chatIntegrationIds }) =>
                chatIntegrationIds.filter((id) => !bundlesIds.has(id)),
            )
    }, [bundles, integrationsToCheck])

    return {
        uninstalledChatIntegrationId: uninstalledChatIntegrationIds?.[0],
    }
}
