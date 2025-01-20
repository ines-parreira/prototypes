import React, {useMemo} from 'react'
import {useLocation} from 'react-router-dom'

import {useShowGlobalNavFeatureFlag} from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'

import PanelRoutes, {panelRoutesRegexps} from './PanelRoutes'
import Routes from './Routes'

export default function RoutesWrapper() {
    const shouldRedirectDeprecatedTicketRoutes = useShowGlobalNavFeatureFlag()
    const {pathname} = useLocation()

    const renderPanelRoutes = useMemo(
        () =>
            shouldRedirectDeprecatedTicketRoutes &&
            panelRoutesRegexps.some((re) => re.test(pathname)),
        [pathname, shouldRedirectDeprecatedTicketRoutes]
    )

    return renderPanelRoutes ? <PanelRoutes /> : <Routes />
}
