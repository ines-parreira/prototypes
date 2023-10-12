import {List, Map, fromJS} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {IntegrationType} from 'models/integration/constants'

import useAppSelector from 'hooks/useAppSelector'

import {
    GorgiasChatInstallationMethod,
    ShopifyIntegration,
} from 'models/integration/types'

import {
    DEPRECATED_getIntegrationsByTypes,
    getStoreIntegrations,
} from 'state/integrations/selectors'

const getHasShopifyScriptTagScopes = ({
    storeIntegration,
}: {
    storeIntegration: ShopifyIntegration
}) =>
    ['read_script_tags', 'write_script_tags'].every((scope) => {
        if (
            !storeIntegration ||
            storeIntegration.type !== IntegrationType.Shopify
        ) {
            return false
        }

        return storeIntegration.meta.oauth.scope?.includes(scope)
    })

const getRequiresScriptTagMigration = ({
    storeIntegration,
    gorgiasChatIntegration,
}: {
    storeIntegration: ShopifyIntegration
    gorgiasChatIntegration: Map<any, any>
}) => {
    let gorgiasChatRequiresReinstall = false,
        storeRequiresPermissionUpdates = false

    const shopIntegrationId = gorgiasChatIntegration.getIn([
        'meta',
        'shop_integration_id',
    ])

    const shopifyIntegrationIds: List<number> = gorgiasChatIntegration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : false

    if (!isOneClickInstallation) {
        return {
            gorgiasChatRequiresReinstall,
            storeRequiresPermissionUpdates,
        }
    }

    const oneClickInstallationMethod: string =
        gorgiasChatIntegration.getIn([
            'meta',
            'one_click_installation_method',
        ]) ?? GorgiasChatInstallationMethod.Asset

    gorgiasChatRequiresReinstall =
        oneClickInstallationMethod !== GorgiasChatInstallationMethod.ScriptTag

    const hasShopifyScriptTagScope = getHasShopifyScriptTagScopes({
        storeIntegration,
    })

    storeRequiresPermissionUpdates = !hasShopifyScriptTagScope

    return {
        gorgiasChatRequiresReinstall,
        storeRequiresPermissionUpdates,
    }
}

const useStoresRequiringScriptTagMigration = () => {
    const hasScriptTagFeatureFlagOn: boolean =
        useFlags()[FeatureFlagKey.ShopifyIntegrationScopeScriptTag] ?? false

    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const gorgiasChatIntegrations = useAppSelector(
        DEPRECATED_getIntegrationsByTypes([IntegrationType.GorgiasChat])
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
                (integration) =>
                    !integration?.get('deactivated_datetime') &&
                    integration?.getIn(['meta', 'shop_integration_id']) ===
                        storeIntegration.id
            )

            if (!gorgiasChatIntegration) {
                return
            }

            const {
                gorgiasChatRequiresReinstall,
                storeRequiresPermissionUpdates,
            } = getRequiresScriptTagMigration({
                storeIntegration: storeIntegration as ShopifyIntegration,
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
