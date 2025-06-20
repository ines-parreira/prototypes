import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import { FeatureFlagKey } from 'config/featureFlags'
import { useListBundles } from 'models/convert/bundle/queries'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'

const BUNDLE_RECENT_ACTIVITY_THRESHOLD_IN_HOURS = 72

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

    const activeBundleIds = useMemo(() => {
        if (!bundles?.length) {
            return undefined
        }

        const activityThreshold = moment().subtract(
            BUNDLE_RECENT_ACTIVITY_THRESHOLD_IN_HOURS,
            'hours',
        )

        return new Set(
            bundles
                .filter(
                    ({ last_loaded_datetime }) =>
                        last_loaded_datetime &&
                        moment(last_loaded_datetime).isSameOrAfter(
                            activityThreshold,
                        ),
                )
                // even though the field is called `shop_integration_id`, it can also contain chat integration ids
                .map(({ shop_integration_id }) => shop_integration_id),
        )
    }, [bundles])

    const uninstalledChatIntegrationIds = useMemo(() => {
        if (!integrationsToCheck.length) {
            return undefined
        }

        if (!activeBundleIds?.size) {
            return integrationsToCheck[0].chatIntegrationIds
        }

        return integrationsToCheck
            .filter(
                ({ storeIntegrationId }) =>
                    !storeIntegrationId ||
                    !activeBundleIds.has(storeIntegrationId),
            )
            .flatMap(({ chatIntegrationIds }) =>
                chatIntegrationIds.filter((id) => !activeBundleIds.has(id)),
            )
    }, [activeBundleIds, integrationsToCheck])

    return {
        uninstalledChatIntegrationId: uninstalledChatIntegrationIds?.[0],
    }
}
