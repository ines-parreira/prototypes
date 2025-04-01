import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { OnboardingPanel } from 'common/onboarding'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { Handle, Panels } from 'core/layout/panels'
import { GlobalNavigationPanel } from 'core/navigation'
import { ContentPanels } from 'core/ui'
import { useIsMobileResolution } from 'hooks/useIsMobileResolution'
import useWindowSize from 'hooks/useWindowSize'
import { useOnToggleUnread } from 'tickets/dtp'
import { TicketsNavbarPanel } from 'tickets/navigation'
import { TicketsPage } from 'tickets/pages'
import { TicketDetailPanel } from 'tickets/ticket-detail'
import { TicketEmptyPanel } from 'tickets/ticket-empty'
import { TicketInfobarPanel } from 'tickets/ticket-infobar'
import { TicketsListPanel } from 'tickets/tickets-list'
import { ViewPanel } from 'tickets/view'

import { MobileRoutes } from './MobileRoutes'

export const panelRoutesRegexps = [
    /^\/app\/?$/,
    /^\/app\/tickets\/?/,
    /^\/app\/ticket\/([^\/]+)\/?$/,
    /^\/app\/views\/?/,
]

export default function PanelRoutes() {
    const hasRedirectDeprecatedTicketRoutes = useFlag<boolean>(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
        false,
    )
    const { width } = useWindowSize()
    const { onToggleUnread, registerOnToggleUnread } = useOnToggleUnread()
    const isMobileResolution = useIsMobileResolution()

    const match = useRouteMatch<{ viewId?: string }>('/app/views/:viewId?')
    const viewId = match?.params.viewId || 'default'

    if (isMobileResolution) {
        return <MobileRoutes />
    }

    if (hasRedirectDeprecatedTicketRoutes) {
        return (
            <Panels size={width}>
                <GlobalNavigationPanel />
                <Switch>
                    <Route path="/app/tickets">
                        <TicketsPage />
                    </Route>
                    <Route exact path="/app/ticket/:ticketId">
                        <TicketsNavbarPanel key="navbar" />
                        <Handle />
                        <TicketDetailPanel key="ticket-detail-panel" />
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                </Switch>
            </Panels>
        )
    }

    // The `key` props below are not really needed in most cases, but they are
    // needed in the case of the `TicketListPanel`, `TicketDetailPanel` and
    // `TicketInfobarPanel`. When switching between the ticket routes, the
    // `TicketListPanel` can simply (dis)appear without the detail/infobar
    // panels re-rendering, but this can only be achieved by using react keys.
    return (
        <Panels size={width}>
            <GlobalNavigationPanel key="global-navigation" />
            <TicketsNavbarPanel key="navbar" />
            <Handle />
            <ContentPanels subtractSize={10}>
                <Switch>
                    <Route exact path="/app">
                        <ViewPanel key="view-panel" />
                        <OnboardingPanel key="onboarding-panel" />
                    </Route>
                    <Route exact path="/app/tickets">
                        <ViewPanel key="view-panel" />
                        <OnboardingPanel key="onboarding-panel" />
                    </Route>
                    <Route exact path="/app/tickets/new/:visibility?">
                        <ViewPanel key="view-panel" />
                        <OnboardingPanel key="onboarding-panel" />
                    </Route>
                    <Route exact path="/app/tickets/search">
                        <ViewPanel key="view-panel" />
                        <OnboardingPanel key="onboarding-panel" />
                    </Route>
                    <Route exact path="/app/tickets/:viewId/:viewSlug?">
                        <ViewPanel key="view-panel" />
                        <OnboardingPanel key="onboarding-panel" />
                    </Route>
                    <Route exact path="/app/ticket/:ticketId">
                        <TicketDetailPanel key="ticket-detail-panel" />
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                    <Route exact path="/app/views/:viewId?">
                        <TicketsListPanel key={`ticket-list-panel-${viewId}`} />
                        <Handle />
                        <TicketEmptyPanel key="ticket-empty-panel" />
                    </Route>
                    <Route exact path="/app/views/:viewId/:ticketId">
                        <TicketsListPanel
                            key={`ticket-list-panel-${viewId}`}
                            registerOnToggleUnread={registerOnToggleUnread}
                        />
                        <Handle />
                        <TicketDetailPanel
                            key="ticket-detail-panel"
                            onToggleUnread={onToggleUnread}
                        />
                        <Handle />
                        <TicketInfobarPanel key="infobar-panel" />
                    </Route>
                </Switch>
            </ContentPanels>
        </Panels>
    )
}
