import { useMemo } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import { getHasShopifyScriptTagScopes } from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatInstallationMethod,
    IntegrationType,
} from 'models/integration/types'
import useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import { getStoreIntegrations } from 'state/integrations/selectors'

const useChatMigrationBanner = (
    integration: Map<any, any>,
): {
    showThemeExtensionsMigrationBanner: boolean
    hasShopifyScriptTagScope: boolean
} => {
    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(integration.toJS())

    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])
        ? Number(integration.getIn(['meta', 'shop_integration_id']))
        : undefined
    const storeIntegration = shopIntegrationId
        ? storeIntegrations.find(
              (storeIntegration) => storeIntegration.id === shopIntegrationId,
          )
        : undefined
    const shopifyIntegrationIds: List<number> = integration.getIn(
        ['meta', 'shopify_integration_ids'],
        fromJS([]),
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
            },
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

    return {
        showThemeExtensionsMigrationBanner:
            shouldUseThemeAppExtensionInstallation &&
            isConnectedToShopify &&
            activeOrRecentOneClickUsage &&
            oneClickInstallationMethod !==
                GorgiasChatInstallationMethod.ThemeAppExtension,
        hasShopifyScriptTagScope,
    }
}

export default useChatMigrationBanner
