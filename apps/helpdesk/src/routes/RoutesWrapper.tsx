import React, { useMemo } from 'react'

import { useLocation } from 'react-router-dom'

import PanelRoutes, { panelRoutesRegexps } from './PanelRoutes'
import Routes from './Routes'

export default function RoutesWrapper() {
    const { pathname } = useLocation()

    const renderPanelRoutes = useMemo(
        () => panelRoutesRegexps.some((re) => re.test(pathname)),
        [pathname],
    )

    return renderPanelRoutes ? <PanelRoutes /> : <Routes />
}
