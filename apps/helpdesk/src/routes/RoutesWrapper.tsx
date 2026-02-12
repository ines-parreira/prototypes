import { useMemo } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { useLocation } from 'react-router-dom'

import { AppLayout } from './layout/AppLayout'
import PanelRoutes, { panelRoutesRegexps } from './PanelRoutes'
import Routes from './Routes'

export default function RoutesWrapper() {
    const { pathname } = useLocation()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const renderPanelRoutes = useMemo(
        () => panelRoutesRegexps.some((re) => re.test(pathname)),
        [pathname],
    )

    const routes = renderPanelRoutes ? <PanelRoutes /> : <Routes />

    if (hasWayfindingMS1Flag) {
        return <AppLayout hasPanel={renderPanelRoutes}>{routes}</AppLayout>
    }

    return routes
}
