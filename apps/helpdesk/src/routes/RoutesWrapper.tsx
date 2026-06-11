import { useMemo } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { SidebarProvider } from '@repo/navigation'
import { useLocation } from 'react-router-dom'

import { AppContextProvider } from 'pages/AppContext'

import { AppLayout } from './layout/AppLayout'
import { PanelRoutes, panelRoutesRegexps } from './PanelRoutes'
import { Routes } from './Routes'

export function RoutesWrapper() {
    const { pathname } = useLocation()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const renderPanelRoutes = useMemo(
        () => panelRoutesRegexps.some((re) => re.test(pathname)),
        [pathname],
    )

    const routes = renderPanelRoutes ? <PanelRoutes /> : <Routes />

    /* The key="wayfinding" / key="legacy" props on the two layout providers ensure React fully unmounts the old tree before mounting the new one whenever the flag changes, closing the window where PanelGroup could render without its Panels context. */

    return (
        <AppContextProvider>
            {hasWayfindingMS1Flag ? (
                <AppLayout key="wayfinding" hasPanel={renderPanelRoutes}>
                    {routes}
                </AppLayout>
            ) : (
                <SidebarProvider key="legacy">{routes}</SidebarProvider>
            )}
        </AppContextProvider>
    )
}
