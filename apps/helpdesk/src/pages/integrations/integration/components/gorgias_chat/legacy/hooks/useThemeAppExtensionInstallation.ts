import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { getEnvironment, GorgiasUIEnv } from '@repo/utils'

import type { ShopifyIntegration } from 'models/integration/types'

const useThemeAppExtensionInstallation = (
    shopifyIntegration?: ShopifyIntegration,
): {
    themeAppExtensionEnabled: boolean // This determines if the Theme App Extension is released.
    shouldUseThemeAppExtensionInstallation: boolean // This determines if the Theme App Extension should be used for this integration.
    themeAppExtensionInstallationUrl: string | null
} => {
    const switchToShopifyThemeAppExtensionRawValue = useFlag(
        FeatureFlagKey.SwitchToShopifyThemeAppExtension,
    )

    const themeAppExtensionEnabled = !!switchToShopifyThemeAppExtensionRawValue

    if (!switchToShopifyThemeAppExtensionRawValue) {
        return {
            themeAppExtensionEnabled,
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl: null,
        }
    }

    const switchDate = new Date(
        Number(switchToShopifyThemeAppExtensionRawValue),
    )

    if (!shopifyIntegration) {
        // Consider new installation method if no shopify integration is selected.
        return {
            themeAppExtensionEnabled,
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: null,
        }
    }
    // Deep link to the settings. The theme app extension should be pre-toggled ON (if getThemeAppExtensionId() is not empty).
    // What's remaining is to click Save.
    const themeAppExtensionInstallationUrl = `https://admin.shopify.com/store/${
        shopifyIntegration.name
    }/themes/current/editor?context=apps&activateAppId=${getGorgiasMainThemeAppExtensionId()}/gorgias`

    return {
        shouldUseThemeAppExtensionInstallation:
            new Date(shopifyIntegration.created_datetime) > switchDate,
        themeAppExtensionInstallationUrl,
        themeAppExtensionEnabled,
    }
}

export const getGorgiasMainThemeAppExtensionId = (): string => {
    const env = getEnvironment()

    switch (env) {
        case GorgiasUIEnv.Production:
            return encodeURI('a66db725-7b96-4e3f-916e-6c8e6f87aaaa')
        case GorgiasUIEnv.Staging:
            return encodeURI('de98a9b4-b32b-4d92-8c0f-210c8cbebd9e')
        case GorgiasUIEnv.Development: // Every developer have their own Theme App Extension.
        default:
            return ''
    }
}

export default useThemeAppExtensionInstallation
