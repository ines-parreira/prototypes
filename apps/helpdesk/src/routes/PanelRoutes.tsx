import { FeatureFlagKey } from '@repo/feature-flags'
import { useWindowSize } from '@repo/hooks'
import { TicketsLegacyBridgeProvider } from '@repo/tickets'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { useFlag } from 'core/flags'
import { Handle, PanelGroup, Panels } from 'core/layout/panels'
import { GlobalNavigationPanel } from 'core/navigation'
import { ContentPanels } from 'core/ui'
import { useIsMobileResolution } from 'hooks/useIsMobileResolution'
import { useTicketLegacyBridgeFunctions } from 'tickets/core/hooks/legacyBridge/useTicketLegacyBridgeFunctions'
import { useOnToggleUnread } from 'tickets/dtp'
import { TicketsNavbarPanel } from 'tickets/navigation'
import { TicketsPage } from 'tickets/pages'
import { TicketDetailWithInfobar } from 'tickets/pages/TicketDetailWithInfobar'
import { TicketEmptyPanel } from 'tickets/ticket-empty'
import { TicketsListPanel } from 'tickets/tickets-list'
import { TranslationsOnboardingModal } from 'tickets/translations/TranslationsOnboardingModal'
import { ViewPanel } from 'tickets/view'

import { MobileRoutes } from './MobileRoutes'

import css from './PanelRoutes.less'

export const panelRoutesRegexps = [
    /^\/app\/?$/,
    /^\/app\/tickets\/?/,
    /^\/app\/ticket\/([^/]+)\/?$/,
    /^\/app\/views\/?/,
]

export default function PanelRoutes() {
    const hasRedirectDeprecatedTicketRoutes = useFlag(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
    )
    const hasUIVisionMS1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const { width } = useWindowSize()
    const { onToggleUnread, registerOnToggleUnread } = useOnToggleUnread()
    const isMobileResolution = useIsMobileResolution()
    const ticketLegacyBridgeFunctions = useTicketLegacyBridgeFunctions()

    const match = useRouteMatch<{ viewId?: string }>('/app/views/:viewId?')
    const viewId = match?.params.viewId || 'default'

    if (isMobileResolution) {
        return (
            <TicketsLegacyBridgeProvider
                {...ticketLegacyBridgeFunctions}
                onToggleUnread={onToggleUnread}
            >
                <MobileRoutes />
                <TranslationsOnboardingModal />
            </TicketsLegacyBridgeProvider>
        )
    }

    if (hasRedirectDeprecatedTicketRoutes) {
        return (
            <TicketsLegacyBridgeProvider
                {...ticketLegacyBridgeFunctions}
                onToggleUnread={onToggleUnread}
            >
                <Panels size={width}>
                    <GlobalNavigationPanel />
                    <Switch>
                        <Route path="/app/tickets">
                            <TicketsPage />
                        </Route>
                        <Route exact path="/app/ticket/:ticketId">
                            <TicketsNavbarPanel key="navbar" />
                            <Handle />
                            <TicketDetailWithInfobar />
                        </Route>
                    </Switch>
                </Panels>
                <TranslationsOnboardingModal />
            </TicketsLegacyBridgeProvider>
        )
    }

    // The `key` props below are not really needed in most cases, but they are
    // needed in the case of the `TicketListPanel`, `TicketDetailPanel` and
    // `TicketInfobarPanel`. When switching between the ticket routes, the
    // `TicketListPanel` can simply (dis)appear without the detail/infobar
    // panels re-rendering, but this can only be achieved by using react keys.
    return (
        <TicketsLegacyBridgeProvider
            {...ticketLegacyBridgeFunctions}
            onToggleUnread={onToggleUnread}
        >
            <Panels size={width}>
                <GlobalNavigationPanel key="global-navigation" />
                <TicketsNavbarPanel key="navbar" />
                <Handle />
                {hasUIVisionMS1 && (
                    <Switch key="ui-vision-dtp">
                        <Route exact path="/app/views/:viewId?">
                            <PanelGroup
                                className={css.dtpWrapper}
                                subtractSize={10}
                            >
                                <TicketsListPanel
                                    key={`ticket-list-panel-${viewId}`}
                                />
                            </PanelGroup>
                            <Handle className={css.dtpHandle} />
                        </Route>
                        <Route exact path="/app/views/:viewId/:ticketId">
                            <PanelGroup
                                className={css.dtpWrapper}
                                subtractSize={10}
                            >
                                <TicketsListPanel
                                    key={`ticket-list-panel-${viewId}`}
                                    registerOnToggleUnread={
                                        registerOnToggleUnread
                                    }
                                />
                            </PanelGroup>
                            <Handle className={css.dtpHandle} />
                        </Route>
                    </Switch>
                )}
                <ContentPanels key="content" subtractSize={10}>
                    <Switch>
                        <Route exact path="/app">
                            <ViewPanel key="view-panel" />
                        </Route>
                        <Route exact path="/app/tickets">
                            <ViewPanel key="view-panel" />
                        </Route>
                        <Route exact path="/app/tickets/new/:visibility?">
                            <ViewPanel key="view-panel" />
                        </Route>
                        <Route exact path="/app/tickets/search">
                            <ViewPanel key="view-panel" />
                        </Route>
                        <Route exact path="/app/tickets/:viewId/:viewSlug?">
                            <ViewPanel key="view-panel" />
                        </Route>
                        <Route exact path="/app/ticket/:ticketId">
                            <TicketDetailWithInfobar key="ticket-detail-with-infobar" />
                        </Route>
                        <Route exact path="/app/views/:viewId?">
                            {!hasUIVisionMS1 && (
                                <>
                                    <TicketsListPanel
                                        key={`ticket-list-panel-${viewId}`}
                                    />
                                    <Handle />
                                </>
                            )}
                            <TicketEmptyPanel key="ticket-empty-panel" />
                        </Route>
                        <Route exact path="/app/views/:viewId/:ticketId">
                            {!hasUIVisionMS1 && (
                                <>
                                    <TicketsListPanel
                                        key={`ticket-list-panel-${viewId}`}
                                        registerOnToggleUnread={
                                            registerOnToggleUnread
                                        }
                                    />
                                    <Handle />
                                </>
                            )}
                            <TicketDetailWithInfobar
                                key="ticket-detail-with-infobar"
                                onToggleUnread={onToggleUnread}
                            />
                        </Route>
                    </Switch>
                </ContentPanels>
            </Panels>
            <TranslationsOnboardingModal />
        </TicketsLegacyBridgeProvider>
    )
}
