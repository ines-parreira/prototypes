import {List, Map, fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {getHasShopifyScriptTagScopes} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatInstallationMethod,
    IntegrationType,
    latestSnippetVersion,
} from 'models/integration/types'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'
import {getStoreIntegrations} from 'state/integrations/selectors'

const useChatMigrationBanner = (
    integration: Map<any, any>
): {
    showScriptTagMigrationBanner: boolean
    showSnippetV3MigrationBanner: boolean
    hasShopifyScriptTagScope: boolean
} => {
    const hasScriptTagFeatureFlagOn: boolean =
        useFlags()[FeatureFlagKey.ShopifyIntegrationScopeScriptTag] ?? false
    const isChatSnippetV3BannerEnabled =
        useFlags()[FeatureFlagKey.ChatSnippetV3Banner] ?? false

    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId
          )
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([])
    )
    const isOneClickInstallation = shopIntegrationId
        ? shopifyIntegrationIds.includes(shopIntegrationId)
        : undefined
    const isConnectedToShopify =
        storeIntegration?.type === IntegrationType.Shopify

    const oneClickInstallationDate: string =
        integration.getIn(['meta', 'one_click_installation_datetime']) ??
        undefined
    const oneClickUninstallationDate: string =
        integration.getIn(['meta', 'one_click_uninstallation_datetime']) ??
        undefined
    const oneClickInstallationMethod: string =
        integration.getIn(['meta', 'one_click_installation_method']) ??
        GorgiasChatInstallationMethod.Asset
    const fiveDays = 1000 * 60 * 60 * 24 * 5

    const {minimumSnippetVersion} = useAppSelector(getChatInstallationStatus)

    const activeOrRecentOneClickUsage = useMemo(() => {
        // `one_click_installation_datetime` can be null despite oneClick installation to true,
        // because we only introduced this datetime tracking in the past months.
        if (isOneClickInstallation) {
            return true
        }

        return [oneClickInstallationDate, oneClickUninstallationDate].some(
            (clickDate) => {
                if (clickDate) {
                    const diff =
                        new Date().getTime() - new Date(clickDate).getTime()
                    return diff < fiveDays
                }
                return false
            }
        )
    }, [
        fiveDays,
        isOneClickInstallation,
        oneClickInstallationDate,
        oneClickUninstallationDate,
    ])

    const hasShopifyScriptTagScope =
        !!storeIntegration &&
        getHasShopifyScriptTagScopes({
            storeIntegration,
        })

    const {
        showSnippetV3Banner,
        showScriptTagBanner,
    }:
        | {showSnippetV3Banner: boolean; showScriptTagBanner: boolean}
        | undefined = useMemo(() => {
        let showScriptTagBanner = false
        let showSnippetV3Banner = false

        // Feature flag early return.
        if (!hasScriptTagFeatureFlagOn) {
            showSnippetV3Banner =
                minimumSnippetVersion !== latestSnippetVersion &&
                isChatSnippetV3BannerEnabled
            showScriptTagBanner = false
            return {showSnippetV3Banner, showScriptTagBanner}
        }

        showScriptTagBanner =
            isConnectedToShopify &&
            activeOrRecentOneClickUsage &&
            (!hasShopifyScriptTagScope ||
                oneClickInstallationMethod ===
                    GorgiasChatInstallationMethod.Asset)

        showSnippetV3Banner =
            minimumSnippetVersion !== latestSnippetVersion &&
            isChatSnippetV3BannerEnabled &&
            // We do not show the banner for script_tag migrated integrations.
            oneClickInstallationMethod ===
                GorgiasChatInstallationMethod.Asset &&
            // Do not show 2 banners at the same time.
            !showScriptTagBanner

        return {showSnippetV3Banner, showScriptTagBanner}
    }, [
        activeOrRecentOneClickUsage,
        hasScriptTagFeatureFlagOn,
        hasShopifyScriptTagScope,
        isChatSnippetV3BannerEnabled,
        isConnectedToShopify,
        minimumSnippetVersion,
        oneClickInstallationMethod,
    ])

    return {
        showScriptTagMigrationBanner: showScriptTagBanner,
        showSnippetV3MigrationBanner: showSnippetV3Banner,
        hasShopifyScriptTagScope: hasShopifyScriptTagScope,
    }
}

export default useChatMigrationBanner
