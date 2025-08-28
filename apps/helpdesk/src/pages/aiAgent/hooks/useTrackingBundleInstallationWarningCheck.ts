import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useFlags } from 'launchdarkly-react-client-sdk'
import moment from 'moment'

import {
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useListBundles } from 'models/convert/bundle/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import useShopifyIntegrations from 'pages/automate/common/hooks/useShopifyIntegrations'

const BUNDLE_RECENT_ACTIVITY_THRESHOLD_IN_HOURS = 72

export const useTrackingBundleInstallationWarningCheck = ({
    storeName,
}: {
    storeName?: string
}) => {
    const storeIntegrations = useShopifyIntegrations()

    const hasShoppingAssistant =
        !!useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]
    const hasTrackingBundleWarningBanner =
        !!useFlags()[
            FeatureFlagKey.AiShoppingAssistantTrackingBundleWarningBanner
        ]

    const atLeastOneStoreHasActiveTrial = useAtLeastOneStoreHasActiveTrial()
    const canUseAiSalesAgent = useCanUseAiSalesAgent()

    const enabled =
        hasTrackingBundleWarningBanner &&
        hasShoppingAssistant &&
        (canUseAiSalesAgent || atLeastOneStoreHasActiveTrial)

    const { storeActivations, isFetchLoading: isStoreActivationsLoading } =
        useStoreActivations({
            storeName,
            withChatIntegrationsStatus: enabled,
            withStoresKnowledgeStatus: enabled,
            enabled,
        })

    const { data: bundles } = useListBundles({
        enabled,
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
        if (!integrationsToCheck.length || !enabled) {
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
    }, [activeBundleIds, enabled, integrationsToCheck])

    return {
        isLoading: enabled && isStoreActivationsLoading,
        uninstalledChatIntegrationId: uninstalledChatIntegrationIds?.[0],
    }
}
