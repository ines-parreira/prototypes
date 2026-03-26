import { useMemo } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { SidebarProvider } from '@repo/navigation'
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

    /* The key="wayfinding" / key="legacy" props on the two layout providers ensure React fully unmounts the old tree before mounting the new one whenever the flag changes, closing the window where PanelGroup could render without its Panels context. */

    if (hasWayfindingMS1Flag) {
        return (
            <AppLayout key="wayfinding" hasPanel={renderPanelRoutes}>
                {routes}
            </AppLayout>
        )
    }

    return <SidebarProvider key="legacy">{routes}</SidebarProvider>
}
