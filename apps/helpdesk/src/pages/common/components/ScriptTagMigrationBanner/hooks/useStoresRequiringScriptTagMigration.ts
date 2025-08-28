import { FeatureFlagKey } from '@repo/feature-flags'
import { fromJS, List, Map } from 'immutable'

import { getHasShopifyScriptTagScopes } from 'config/integrations/gorgias_chat'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import {
    GorgiasChatInstallationMethod,
    ShopifyIntegration,
} from 'models/integration/types'
import {
    DEPRECATED_getIntegrationsByTypes,
    getStoreIntegrations,
} from 'state/integrations/selectors'

const getRequiresScriptTagMigration = ({
    storeIntegration,
    gorgiasChatIntegration,
}: {
    storeIntegration: ShopifyIntegration
    gorgiasChatIntegration: Map<any, any>
}) => {
    const oneClickInstallationMethod: string =
        gorgiasChatIntegration.getIn([
            'meta',
            'one_click_installation_method',
        ]) ?? GorgiasChatInstallationMethod.Asset

    const gorgiasChatRequiresReinstall =
        oneClickInstallationMethod !== GorgiasChatInstallationMethod.ScriptTag

    const hasShopifyScriptTagScope = getHasShopifyScriptTagScopes({
        storeIntegration,
    })

    const storeRequiresPermissionUpdates = !hasShopifyScriptTagScope

    return {
        gorgiasChatRequiresReinstall,
        storeRequiresPermissionUpdates,
    }
}

const useStoresRequiringScriptTagMigration = () => {
    const hasScriptTagFeatureFlagOn: boolean =
        useFlag(FeatureFlagKey.ShopifyIntegrationScopeScriptTag) ?? false

    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const gorgiasChatIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    ) as List<Map<any, any>>

    if (!hasScriptTagFeatureFlagOn) {
        return
    }

    const shopifyIntegrationsRequiringScriptTagMigration = storeIntegrations
        .map((storeIntegration) => {
            const isConnectedToShopify =
                storeIntegration?.type === IntegrationType.Shopify

            if (!isConnectedToShopify) {
                return
            }

            const gorgiasChatIntegration = gorgiasChatIntegrations.find(
                (integration) => {
                    if (integration?.get('deactivated_datetime')) {
                        return false
                    }

                    const shopIntegrationId = integration?.getIn([
                        'meta',
                        'shop_integration_id',
                    ])

                    if (
                        !shopIntegrationId ||
                        shopIntegrationId !== storeIntegration.id
                    ) {
                        return false
                    }

                    const shopifyIntegrationIds: List<number> | undefined =
                        integration?.getIn(
                            ['meta', 'shopify_integration_ids'],
                            fromJS([]),
                        )
                    const isOneClickInstallation =
                        shopifyIntegrationIds?.includes(shopIntegrationId)

                    return !!isOneClickInstallation
                },
            )

            if (!gorgiasChatIntegration) {
                return
            }

            const {
                gorgiasChatRequiresReinstall,
                storeRequiresPermissionUpdates,
            } = getRequiresScriptTagMigration({
                storeIntegration: storeIntegration,
                gorgiasChatIntegration,
            })

            if (
                !gorgiasChatRequiresReinstall &&
                !storeRequiresPermissionUpdates
            ) {
                return
            }

            return {
                storeIntegration,
                storeRequiresPermissionUpdates,
                gorgiasChatIntegration,
                gorgiasChatRequiresReinstall,
            }
        })
        .filter(Boolean) as {
        storeIntegration: ShopifyIntegration
        storeRequiresPermissionUpdates: boolean
        gorgiasChatIntegration: Map<any, any>
        gorgiasChatRequiresReinstall: boolean
    }[]

    return shopifyIntegrationsRequiringScriptTagMigration
}

export default useStoresRequiringScriptTagMigration
