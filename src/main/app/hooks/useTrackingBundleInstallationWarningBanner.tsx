import { useEffect } from 'react'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { useWarningBannerIsDisplayed } from 'pages/stats/automate/aiSalesAgent/hooks/useWarningBannerIsDisplayed'

export function useTrackingBundleInstallationWarningBanner() {
    const { addBanner, removeBanner } = useBanners()
    const { isBannerDisplayed, redirectToChatSettings } =
        useWarningBannerIsDisplayed({})

    useEffect(() => {
        if (isBannerDisplayed) {
            addBanner({
                preventDismiss: false,
                category: BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                instanceId:
                    BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                type: AlertBannerTypes.Warning,
                message: `Please update your chat's manual installation script to enable tracking for your Shopping Assistant.`,
                CTA: {
                    type: 'action',
                    text: 'Update Installation',
                    onClick: redirectToChatSettings,
                },
            })
        } else {
            removeBanner(
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            )
        }
    }, [isBannerDisplayed, addBanner, removeBanner, redirectToChatSettings])
}
