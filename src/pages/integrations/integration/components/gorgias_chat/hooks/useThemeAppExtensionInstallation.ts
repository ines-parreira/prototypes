import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {ShopifyIntegration} from 'models/integration/types'

const useThemeAppExtensionInstallation = (
    shopifyIntegration?: ShopifyIntegration
): {
    shouldUseThemeAppExtensionInstallation: boolean
    themeAppExtensionInstallationUrl: string | null
} => {
    const switchToShopifyThemeAppExtensionRawValue =
        useFlags()[FeatureFlagKey.SwitchToShopifyThemeAppExtension]

    if (!switchToShopifyThemeAppExtensionRawValue) {
        return {
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl: null,
        }
    }

    const switchDate = new Date(
        Number(switchToShopifyThemeAppExtensionRawValue)
    )

    if (!shopifyIntegration) {
        // Consider new installation method if no shopify integration is selected.
        return {
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: null,
        }
    }

    // TODO. We can improve it once we have published the theme app extension. CF https://shopify.dev/docs/apps/online-store/theme-app-extensions/extensions-framework#app-embed-block-deep-linking-url.
    const themeAppExtensionInstallationUrl = `https://admin.shopify.com/store/${shopifyIntegration.name}/themes/current/editor?context=apps`

    return {
        shouldUseThemeAppExtensionInstallation:
            new Date(shopifyIntegration.created_datetime) > switchDate,
        themeAppExtensionInstallationUrl,
    }
}

export default useThemeAppExtensionInstallation
