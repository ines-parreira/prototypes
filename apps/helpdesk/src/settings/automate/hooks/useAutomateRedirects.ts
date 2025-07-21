import { useEffect } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

export function useAutomateRedirects() {
    const shouldRedirect = useFlag(FeatureFlagKey.AutomateSettingsRevamp)

    const history = useHistory()
    const { pathname } = useLocation()

    useEffect(() => {
        if (!shouldRedirect) return

        let m = pathname.match(
            /^\/app\/automation\/([^/]+)\/([^/]+)\/article-recommendation(\/.*)?$/,
        )
        if (m) {
            const [, shopType, shopName, rest] = m
            history.replace(
                `/app/settings/article-recommendations/${shopType}/${shopName}${rest || ''}`,
            )
            return
        }

        m = pathname.match(
            /^\/app\/automation\/([^/]+)\/([^/]+)\/flows(\/.*)?$/,
        )
        if (m) {
            const [, shopType, shopName, rest] = m
            history.replace(
                `/app/settings/flows/${shopType}/${shopName}${rest || ''}`,
            )
            return
        }

        m = pathname.match(
            /^\/app\/automation\/([^/]+)\/([^/]+)\/order-management(\/.*)?$/,
        )
        if (m) {
            const [, shopType, shopName, rest] = m
            history.replace(
                `/app/settings/order-management/${shopType}/${shopName}${rest || ''}`,
            )
            return
        }
    }, [history, pathname, shouldRedirect])
}
