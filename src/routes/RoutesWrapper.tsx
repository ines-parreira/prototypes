import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import PanelRoutes, {panelRoutesRegexps} from './PanelRoutes'
import Routes from './Routes'

export default function RoutesWrapper() {
    const shouldRedirectDeprecatedTicketRoutes = useFlag<boolean>(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
        false
    )
    const {pathname} = useLocation()

    const renderPanelRoutes = useMemo(
        () =>
            shouldRedirectDeprecatedTicketRoutes &&
            panelRoutesRegexps.some((re) => re.test(pathname)),
        [pathname, shouldRedirectDeprecatedTicketRoutes]
    )

    return renderPanelRoutes ? <PanelRoutes /> : <Routes />
}
