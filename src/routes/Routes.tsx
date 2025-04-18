import React, { useEffect } from 'react'

import { History } from 'history'
import { useFlags } from 'launchdarkly-react-client-sdk'
import {
    Redirect,
    Route,
    RouteComponentProps,
    Switch,
    useLocation,
    useParams,
    useRouteMatch,
} from 'react-router-dom'
import { CompatRoute } from 'react-router-dom-v5-compat'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { logPageChange } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { PageSection } from 'config/pages'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import { useFlag } from 'core/flags'
// DON'T add 'pages/*' imports above to ensure CSS ordering is preserved. Placing this import elsewhere
// may cause unexpected CSS precedence issues, breaking the intended design.
//
// cf. https://github.com/gorgias/helpdesk-web-app/pull/6154
import ActionEventsViewContainer from 'pages/aiAgent/actions/ActionEventsViewContainer'
import ActionsTemplatesViewContainer from 'pages/aiAgent/actions/ActionsTemplatesViewContainer'
import ActionsViewContainer from 'pages/aiAgent/actions/ActionsViewContainer'
import CreateActionView from 'pages/aiAgent/actions/CreateActionView'
import EditActionViewContainer from 'pages/aiAgent/actions/EditActionViewContainer'
import { AiAgentAnalytics } from 'pages/aiAgent/AiAgentAnalytics'
import AiAgentConfigurationContainer from 'pages/aiAgent/AiAgentConfigurationContainer'
import { AiAgentGuidanceAiSuggestionNewContainer } from 'pages/aiAgent/AiAgentGuidanceAiSuggestionNewContainer'
import { AiAgentGuidanceContainer } from 'pages/aiAgent/AiAgentGuidanceContainer'
import { AiAgentGuidanceDetailContainer } from 'pages/aiAgent/AiAgentGuidanceDetailContainer'
import { AiAgentGuidanceLibraryContainer } from 'pages/aiAgent/AiAgentGuidanceLibraryContainer'
import { AiAgentGuidanceNewContainer } from 'pages/aiAgent/AiAgentGuidanceNewContainer'
import { AiAgentGuidanceTemplateNewContainer } from 'pages/aiAgent/AiAgentGuidanceTemplateNewContainer'
import { AiAgentGuidanceTemplatesContainer } from 'pages/aiAgent/AiAgentGuidanceTemplatesContainer'
import { AiAgentKnowledgeContainer } from 'pages/aiAgent/AiAgentKnowledgeContainer'
import AiAgentMainViewContainer from 'pages/aiAgent/AiAgentMainViewContainer'
import AiAgentOnboardingWizard from 'pages/aiAgent/AiAgentOnboardingWizard/AiAgentOnboardingWizard'
import { AiAgentPlaygroundContainer } from 'pages/aiAgent/AiAgentPlaygroundContainer'
import { AiAgentPreviewModeSettingsContainer } from 'pages/aiAgent/AiAgentPreviewModeSettings/AiAgentPreviewModeSettingsContainer'
import { AiAgentSales } from 'pages/aiAgent/AiAgentSales'
import AiAgentScrapedDomainProductsContainer from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainProductsContainer'
import AiAgentScrapedDomainQuestionsContainer from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainQuestionsContainer'
import { AiAgentVolume } from 'pages/aiAgent/AiAgentVolume'
import { AiAgentNavbar } from 'pages/aiAgent/components/AiAgentNavbar/AiAgentNavbar'
import { AiAgentRedirect } from 'pages/aiAgent/components/AiAgentRedirect/AiAgentRedirect'
import { aiAgentRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { Level2IntentsContainer } from 'pages/aiAgent/insights/Level2IntentsContainer/Level2IntentsContainer'
import { OptimizeContainer } from 'pages/aiAgent/insights/OptimizeContainer/OptimizeContainer'
import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding/components/AiAgentOnboarding/AiAgentOnboarding'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import { AiAgentOverview } from 'pages/aiAgent/Overview/AiAgentOverview'
import { AiAgentAccountConfigurationProvider } from 'pages/aiAgent/providers/AiAgentAccountConfigurationProvider'
import { AiAgentErrorBoundary } from 'pages/aiAgent/providers/AiAgentErrorBoundary'
import AiAgentStoreConfigurationProvider from 'pages/aiAgent/providers/AiAgentStoreConfigurationProvider'
import App from 'pages/App'
import ActionsPlatformAppsView from 'pages/automate/actionsPlatform/ActionsPlatformAppsView'
import ActionsPlatformCreateAppFormView from 'pages/automate/actionsPlatform/ActionsPlatformCreateAppFormView'
import ActionsPlatformCreateStepView from 'pages/automate/actionsPlatform/ActionsPlatformCreateStepView'
import ActionsPlatformCreateUseCaseTemplateView from 'pages/automate/actionsPlatform/ActionsPlatformCreateUseCaseTemplateView'
import ActionsPlatformEditAppFormView from 'pages/automate/actionsPlatform/ActionsPlatformEditAppFormView'
import ActionsPlatformEditStepViewContainer from 'pages/automate/actionsPlatform/ActionsPlatformEditStepViewContainer'
import ActionsPlatformEditUseCaseTemplateViewContainer from 'pages/automate/actionsPlatform/ActionsPlatformEditUseCaseTemplateViewContainer'
import ActionsPlatformStepsView from 'pages/automate/actionsPlatform/ActionsPlatformStepsView'
import ActionsPlatformUseCaseTemplatesView from 'pages/automate/actionsPlatform/ActionsPlatformUseCaseTemplatesView'
import ArticleRecommendationViewContainer from 'pages/automate/articleRecommendation/ArticleRecommendationViewContainer'
import AutomateAllRecommendationsContainer from 'pages/automate/common/components/AutomateAllRecommendationsContainer'
import AutomateLandingPageContainer from 'pages/automate/common/components/AutomateLandingPageContainer'
import AutomateNavbar from 'pages/automate/common/components/AutomateNavbar'
import SelfServiceContactFormsProvider from 'pages/automate/common/providers/SelfServiceContactFormsProvider'
import SelfServiceHelpCentersProvider from 'pages/automate/common/providers/SelfServiceHelpCentersProvider'
import ConnectedChannelsViewContainer from 'pages/automate/connectedChannels/ConnectedChannelsViewContainer'
import CancelOrderFlowViewContainer from 'pages/automate/orderManagement/cancelOrder/CancelOrderFlowViewContainer'
import OrderManagementPreviewProvider from 'pages/automate/orderManagement/OrderManagementPreviewProvider'
import OrderManagementViewContainer from 'pages/automate/orderManagement/OrderManagementViewContainer'
import CreateReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/reportOrderIssue/CreateReportOrderIssueFlowScenarioViewContainer'
import EditReportOrderIssueFlowScenarioViewContainer from 'pages/automate/orderManagement/reportOrderIssue/EditReportOrderIssueFlowScenarioViewContainer'
import ReportOrderIssueFlowViewContainer from 'pages/automate/orderManagement/reportOrderIssue/ReportOrderIssueFlowViewContainer'
import ReturnOrderFlowViewContainer from 'pages/automate/orderManagement/returnOrder/ReturnOrderFlowViewContainer'
import TrackOrderFlowViewContainer from 'pages/automate/orderManagement/trackOrder/TrackOrderFlowViewContainer'
import WorkflowAnalyticsContainer from 'pages/automate/workflows/analytics/WorkflowAnalyticsContainer'
import WorkflowEditorViewContainer from 'pages/automate/workflows/editor/WorkflowEditorViewContainer'
import WorkflowsViewContainer from 'pages/automate/workflows/WorkflowsViewContainer'
import NoMatch from 'pages/common/components/NoMatch'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'
import UpdateABTestView from 'pages/convert/abTests/components/UpdateABTestView'
import ABGroupIndexPage from 'pages/convert/abVariants/pages/ABGroupPage'
import ConvertBundleView from 'pages/convert/bundles/components/ConvertBundleView'
import { CampaignsView } from 'pages/convert/campaigns/CampaignsView'
import CampaginLibaryView from 'pages/convert/campaigns/components/CampaginLibaryView'
import CampaignDetailsFactory from 'pages/convert/campaigns/containers/CampaignDetailsFactory'
import {
    CampaignTemplateCustomizeLibraryView,
    CampaignTemplateCustomizeRecommendationsView,
} from 'pages/convert/campaigns/containers/CampaignTemplateCustomizeView'
import ClickTrackingPaywallView from 'pages/convert/clickTracking/components/ClickTrackingPaywallView/ClickTrackingPaywallView'
import ClickTrackingSettingsView from 'pages/convert/clickTracking/components/ClickTrackingSettingsView/ClickTrackingSettingsView'
import ConvertNavbar from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar'
import {
    CONVERT_ROUTING_CAMPAIGN_PARAM,
    CONVERT_ROUTING_PARAM,
    CONVERT_ROUTING_TEMPLATE_PARAM,
} from 'pages/convert/common/constants'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import ConvertOnboardingView from 'pages/convert/onboarding/components/ConvertOnboardingView'
import ConvertOnboardingWizardView from 'pages/convert/onboarding/components/ConvertOnboardingWizardView'
import { OverviewView } from 'pages/convert/overview/OverviewView'
import { ConvertSettingsView } from 'pages/convert/settings/ConvertSettingsView'
import CustomerNavbarContainer from 'pages/customers/common/CustomerNavbarContainer'
import CustomerDetailContainer from 'pages/customers/detail/CustomerDetailContainer'
import CustomerInfobarContainer from 'pages/customers/detail/CustomerInfobarContainer'
import CustomerSourceContainer from 'pages/customers/detail/CustomerSourceContainer'
import CustomerListContainer from 'pages/customers/list/CustomerListContainer'
import CanduContent from 'pages/onboarding/CanduContent'
import ReferralContent from 'pages/referral/ReferralContent'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import RevenueCampaignsStats from 'pages/stats/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'pages/stats/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import DefaultStatsFilters from 'pages/stats/DefaultStatsFilters'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import CreateShopifyCharge from 'pages/tasks/detail/CreateShopifyCharge'
import CreditShopifyBillingIntegration from 'pages/tasks/detail/CreditShopifyBillingIntegration'
import ImportPhoneNumber from 'pages/tasks/detail/ImportPhoneNumber'
import RemoveShopifyBilling from 'pages/tasks/detail/RemoveShopifyBilling'
import TwilioSubaccountStatusForm from 'pages/tasks/detail/TwilioSubaccountStatusForm'
import UpdatePaymentTerms from 'pages/tasks/detail/UpdatePaymentTerms'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import TicketSourceContainer from 'pages/tickets/detail/TicketSourceContainer'
import { TicketNavBarRevampWrapper } from 'pages/tickets/navbar/TicketNavBarRevampWrapper'
import SettingsRoutes from 'routes/settings'
import { StatsRoutes } from 'routes/StatsRoutes'
import { VoiceOfCustomerRoutes } from 'routes/VoiceOfCustomerRoutes'

export default function Routes() {
    return (
        <Route path="/app">
            <AppRoutes />
        </Route>
    )
}

export function AppRoutes() {
    const { path } = useRouteMatch()
    const location = useLocation()
    const isAiAgentAssistantEnabled = useFlag(FeatureFlagKey.AiAgentAssistant)
    const { isModuleRestrictedToCurrentUser } = useReportChartRestrictions()

    useEffect(() => {
        if (isAiAgentAssistantEnabled) {
            window.loadGorgiasChat?.(location.pathname.includes('ai-agent'))
        }
    }, [location.pathname, isAiAgentAssistantEnabled])

    return (
        <Switch>
            <Route path={`${path}/customers`} render={CustomersRoutes} />
            <Route path={`${path}/customer`} render={CustomerRoutes} />
            <Route path={`${path}/users`} render={UsersRoutes} />
            <Route path={`${path}/user`} render={UserRoutes} />
            <Route path={`${path}/ticket`} render={TicketRoutes} />
            <Route path={`${path}/admin/tasks`} render={AdminTasksRoutes} />
            {!isModuleRestrictedToCurrentUser(`${path}/stats`) && (
                <Route path={`${path}/stats`}>
                    <StatsRoutes />
                </Route>
            )}
            {!isModuleRestrictedToCurrentUser(`${path}/voice-of-customer`) && (
                <Route path={`${path}/voice-of-customer`}>
                    <VoiceOfCustomerRoutes />
                </Route>
            )}
            <Route path={`${path}/automation`} render={AutomationRoutes} />
            <Route path={`${path}/ai-agent`} render={AiAgentBaseRoutes} />
            <Route path={`${path}/convert`}>
                <ConvertRoutes />
            </Route>
            <Route path={`${path}/settings`}>
                <SettingsRoutes />
            </Route>
            <Route path={`${path}/home`} render={HomepageRoutes} />
            <Route
                path={`${path}/referral-program`}
                exact
                render={() => (
                    <App
                        content={ReferralContent}
                        navbar={TicketNavBarRevampWrapper}
                    />
                )}
            />
            <Route>
                <NoMatch />
            </Route>
        </Switch>
    )
}

export function CustomersRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/search`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
        </Switch>
    )
}

export function CustomerRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:customerId`}
                exact
                render={() => (
                    <App
                        content={CustomerDetailContainer}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        infobarOnMobile
                    />
                )}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            CustomerSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', ''),
                        )}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        isEditingWidgets
                        noContainerWidthLimit
                        containerPadding
                    />
                )}
            />
        </Switch>
    )
}

export function UsersRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/search`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
            <Route
                path={`${path}/:viewId/:viewSlug?`}
                exact
                render={() => (
                    <App
                        content={CustomerListContainer}
                        navbar={CustomerNavbarContainer}
                    />
                )}
            />
        </Switch>
    )
}

export function UserRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:customerId`}
                exact
                render={() => (
                    <App
                        content={CustomerDetailContainer}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        noContainerWidthLimit
                        infobarOnMobile
                        containerPadding
                    />
                )}
            />
            <Route
                path={`${path}/:customerId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            CustomerSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', ''),
                        )}
                        navbar={CustomerNavbarContainer}
                        infobar={CustomerInfobarContainer}
                        isEditingWidgets
                        noContainerWidthLimit
                        containerPadding
                    />
                )}
            />
        </Switch>
    )
}

export function TicketRoutes({
    location,
    match: { path },
}: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/:ticketId/edit-widgets`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            TicketSourceContainer,
                            ADMIN_ROLE,
                            undefined,
                            location.pathname.replace('/edit-widgets', ''),
                        )}
                        navbar={TicketNavBarRevampWrapper}
                        infobar={TicketInfobarContainer}
                        noContainerWidthLimit
                        isEditingWidgets
                        containerPadding
                    />
                )}
            />
            <Route
                path={`${path}/:ticketId/print`}
                exact
                render={() => <App content={TicketPrintContainer} />}
            />
        </Switch>
    )
}

function AiAgentRoutes({ match: { path }, location }: RouteComponentProps) {
    const { shopType } = useParams<{
        shopType: string
    }>()

    const isAiAgentAIGeneratedGuidancesEnabled =
        useFlags()[FeatureFlagKey.AiAgentAIGeneratedGuidances]

    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    const isAiAgentKnowledgeTabEnabled =
        useFlags()[FeatureFlagKey.AiAgentKnowledgeTab]

    const isAiAgentStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const isAiAgentScrapeStoreDomainEnabled =
        useFlags()[FeatureFlagKey.AiAgentScrapeStoreDomain]

    if (shopType !== 'shopify') {
        return <Redirect to="/app/automation" />
    }

    // TMP: Remove it when AI Agent will be fully migrated to its new route
    // Redirect from old /app/automation/../../ai-agent/.. to new `/app/ai-agent/../../..` route
    if (
        isAiAgentStandaloneMenuEnabled &&
        location.pathname.startsWith('/app/automation')
    ) {
        const newLocation = {
            ...location,
            pathname: location.pathname
                .replace('/ai-agent', '')
                .replace('/automation', '/ai-agent'),
        }

        if (
            newLocation.pathname.includes('/guidance') &&
            !newLocation.pathname.includes('/knowledge/guidance')
        ) {
            newLocation.pathname = newLocation.pathname.replace(
                '/guidance',
                '/knowledge/guidance',
            )
        }

        if (location.pathname.includes('/preview-mode')) {
            newLocation.pathname = newLocation.pathname.replace(
                '/preview-mode',
                '/settings/preview',
            )
        }

        return <Redirect to={newLocation} />
    }

    const isGorgiasUser = window.USER_IMPERSONATED || window.DEVELOPMENT

    return (
        <Switch>
            <AiAgentAccountConfigurationProvider>
                <AiAgentStoreConfigurationProvider>
                    <Route
                        path={`${path}`}
                        exact
                        component={AiAgentMainViewContainer}
                    />
                    <AiAgentErrorBoundary section="ai-agent-optimize">
                        <Route
                            path={`${path}/optimize`}
                            exact
                            component={OptimizeContainer}
                        />
                        <Switch>
                            <Route
                                path={`${path}/optimize/:intentId`}
                                component={Level2IntentsContainer}
                            />
                        </Switch>
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary section="ai-agent-configuration-channels">
                        <Route
                            path={`${path}/settings/:tab(channels)`}
                            exact
                            component={AiAgentConfigurationContainer}
                        />
                    </AiAgentErrorBoundary>
                    {isGorgiasUser && (
                        <AiAgentErrorBoundary
                            section="ai-agent-preview-mode"
                            team={SentryTeam.CONVAI_KNOWLEDGE}
                        >
                            <Route
                                path={`${path}/settings/preview`}
                                exact
                                component={AiAgentPreviewModeSettingsContainer}
                            />
                        </AiAgentErrorBoundary>
                    )}
                    <AiAgentErrorBoundary section="ai-agent-configuration">
                        <Route
                            path={`${path}/settings`}
                            exact
                            component={AiAgentConfigurationContainer}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary section="ai-agent-playground">
                        <Route
                            path={`${path}/test`}
                            exact
                            component={AiAgentPlaygroundContainer}
                        />
                    </AiAgentErrorBoundary>

                    <Switch>
                        <Route
                            path={`${path}/actions`}
                            exact
                            component={ActionsViewContainer}
                        />
                        <Route
                            path={`${path}/actions/new`}
                            exact
                            component={CreateActionView}
                        />
                        <Route
                            path={`${path}/actions/edit/:id`}
                            exact
                            component={EditActionViewContainer}
                        />
                        <Route
                            path={`${path}/actions/templates`}
                            exact
                            component={ActionsTemplatesViewContainer}
                        />
                        <Route
                            path={`${path}/actions/events/:id`}
                            exact
                            component={ActionEventsViewContainer}
                        />
                    </Switch>

                    {/* TODO: Remove this in favour of `/knowledge/guidance`, after fully migrate to new AI Agent standalone menu */}
                    <AiAgentErrorBoundary section="ai-agent-guidance">
                        <Route
                            path={`${path}/guidance`}
                            exact
                            component={AiAgentGuidanceContainer}
                        />
                        <Switch>
                            <Route
                                path={`${path}/guidance/new`}
                                component={AiAgentGuidanceNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/guidance/library`}
                                    exact
                                    component={AiAgentGuidanceLibraryContainer}
                                />
                            )}
                            <Route
                                path={`${path}/guidance/templates`}
                                exact
                                component={AiAgentGuidanceTemplatesContainer}
                            />
                            <Route
                                path={`${path}/guidance/templates/:templateId`}
                                component={AiAgentGuidanceTemplateNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/guidance/library/:aiGuidanceId`}
                                    component={
                                        AiAgentGuidanceAiSuggestionNewContainer
                                    }
                                />
                            )}
                            <Route
                                path={`${path}/guidance/templates`}
                                component={AiAgentGuidanceTemplatesContainer}
                            />

                            <Route
                                path={`${path}/guidance/:articleId`}
                                component={AiAgentGuidanceDetailContainer}
                            />
                        </Switch>
                    </AiAgentErrorBoundary>
                    {isGorgiasUser && (
                        <AiAgentErrorBoundary
                            section="ai-agent-preview-mode"
                            team={SentryTeam.CONVAI_KNOWLEDGE}
                        >
                            <Route
                                path={`${path}/preview-mode`}
                                exact
                                component={AiAgentPreviewModeSettingsContainer}
                            />
                        </AiAgentErrorBoundary>
                    )}
                    {isAiAgentOnboardingWizardEnabled && (
                        <AiAgentErrorBoundary
                            section="ai-agent-onboarding-wizard"
                            team={SentryTeam.MARKETING}
                        >
                            <Route
                                path={`${path}/new`}
                                exact
                                component={AiAgentOnboardingWizard}
                            />
                        </AiAgentErrorBoundary>
                    )}
                    {isAiAgentKnowledgeTabEnabled && (
                        <AiAgentErrorBoundary
                            section="ai-agent-knowledge"
                            team={SentryTeam.CONVAI_KNOWLEDGE}
                        >
                            <Route
                                path={`${path}/knowledge`}
                                exact
                                component={AiAgentKnowledgeContainer}
                            />
                            {isAiAgentScrapeStoreDomainEnabled && (
                                <Switch>
                                    <Route
                                        path={`${path}/knowledge/sources`}
                                        exact
                                        component={AiAgentKnowledgeContainer}
                                    />
                                    <Route
                                        path={`${path}/knowledge/sources/pages-content`}
                                        component={
                                            AiAgentScrapedDomainQuestionsContainer
                                        }
                                    />
                                    <Route
                                        path={`${path}/knowledge/sources/products-content`}
                                        component={
                                            AiAgentScrapedDomainProductsContainer
                                        }
                                    />
                                </Switch>
                            )}
                        </AiAgentErrorBoundary>
                    )}
                    <AiAgentErrorBoundary section="ai-agent-guidance">
                        <Route
                            path={`${path}/knowledge/guidance`}
                            exact
                            component={AiAgentGuidanceContainer}
                        />
                        <Switch>
                            <Route
                                path={`${path}/knowledge/guidance/new`}
                                component={AiAgentGuidanceNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/knowledge/guidance/library`}
                                    exact
                                    component={AiAgentGuidanceLibraryContainer}
                                />
                            )}
                            <Route
                                path={`${path}/knowledge/guidance/templates`}
                                exact
                                component={AiAgentGuidanceTemplatesContainer}
                            />
                            <Route
                                path={`${path}/knowledge/guidance/templates/:templateId`}
                                component={AiAgentGuidanceTemplateNewContainer}
                            />
                            {isAiAgentAIGeneratedGuidancesEnabled && (
                                <Route
                                    path={`${path}/knowledge/guidance/library/:aiGuidanceId`}
                                    component={
                                        AiAgentGuidanceAiSuggestionNewContainer
                                    }
                                />
                            )}
                            <Route
                                path={`${path}/knowledge/guidance/templates`}
                                component={AiAgentGuidanceTemplatesContainer}
                            />

                            <Route
                                path={`${path}/knowledge/guidance/:articleId`}
                                component={AiAgentGuidanceDetailContainer}
                            />
                        </Switch>
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-sales"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales`}
                            exact
                            component={AiAgentSales}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-volume"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales/volume`}
                            exact
                            component={AiAgentVolume}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-analytics"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales/analytics`}
                            exact
                            component={AiAgentAnalytics}
                        />
                    </AiAgentErrorBoundary>
                </AiAgentStoreConfigurationProvider>
            </AiAgentAccountConfigurationProvider>
        </Switch>
    )
}

export function AutomationRoutes() {
    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    render={() => (
                        <App
                            content={AutomationContent}
                            navbar={AutomateNavbar}
                        />
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

function AutomationContent() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/ai-recommendations`} exact>
                <SelfServiceHelpCentersProvider>
                    <Route
                        path={`${path}/ai-recommendations`}
                        exact
                        component={withUserRoleRequired(
                            AutomateAllRecommendationsContainer,
                            AGENT_ROLE,
                        )}
                    />
                </SelfServiceHelpCentersProvider>
            </Route>

            <Route
                path={`${path}/:shopType/:shopName/ai-agent`}
                component={withUserRoleRequired(AiAgentRoutes, AGENT_ROLE)}
            />

            <Route
                path={`${path}/:shopType/:shopName/flows/new`}
                exact
                component={withUserRoleRequired(
                    WorkflowEditorViewContainer,
                    AGENT_ROLE,
                )}
            />

            <Route
                path={`${path}/:shopType/:shopName/flows/edit/:editWorkflowId`}
                exact
                render={(props) => (
                    <SelfServiceHelpCentersProvider>
                        <SelfServiceContactFormsProvider>
                            {React.createElement(
                                withUserRoleRequired(
                                    WorkflowEditorViewContainer,
                                    AGENT_ROLE,
                                ),
                                {
                                    ...props,
                                    editWorkflowId:
                                        props.match.params.editWorkflowId,
                                    shopType: props.match.params.shopType,
                                    shopName: props.match.params.shopName,
                                },
                            )}
                        </SelfServiceContactFormsProvider>
                    </SelfServiceHelpCentersProvider>
                )}
            />

            <Route
                path={`${path}/:shopType/:shopName/flows/analytics/:editWorkflowId`}
                exact
                render={(props) => (
                    <SelfServiceHelpCentersProvider>
                        <SelfServiceContactFormsProvider>
                            {React.createElement<{
                                shopType: string
                                shopName: string
                                editWorkflowId: string
                            }>(
                                withUserRoleRequired(
                                    WorkflowAnalyticsContainer,
                                    AGENT_ROLE,
                                ),
                                {
                                    ...props,
                                    editWorkflowId:
                                        props.match.params.editWorkflowId,
                                    shopType: props.match.params.shopType,
                                    shopName: props.match.params.shopName,
                                },
                            )}
                        </SelfServiceContactFormsProvider>
                    </SelfServiceHelpCentersProvider>
                )}
            />

            <Route
                path={[`${path}/:shopType/:shopName/flows`]}
                render={(props) => {
                    return React.createElement(
                        withUserRoleRequired(
                            WorkflowsViewContainer,
                            AGENT_ROLE,
                        ),
                        {
                            ...props,
                            shopType: props.match.params.shopType,
                            shopName: props.match.params.shopName,
                        },
                    )
                }}
            />

            <Route
                path={[
                    `${path}/shopify/:shopName/order-management`,
                    `${path}/shopify/:shopName/order-management/return`,
                    `${path}/shopify/:shopName/order-management/cancel`,
                    `${path}/shopify/:shopName/order-management/cancel`,
                    `${path}/shopify/:shopName/order-management/track`,
                    `${path}/shopify/:shopName/order-management/report-issue`,
                    `${path}/shopify/:shopName/order-management/report-issue/new`,
                    `${path}/shopify/:shopName/order-management/report-issue/:scenarioIndex`,
                ]}
                exact
            >
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <OrderManagementPreviewProvider>
                            <Switch>
                                <Route
                                    path={`${path}/shopify/:shopName/order-management`}
                                    exact
                                    component={withUserRoleRequired(
                                        OrderManagementViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/return`}
                                    exact
                                    component={withUserRoleRequired(
                                        ReturnOrderFlowViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/cancel`}
                                    exact
                                    component={withUserRoleRequired(
                                        CancelOrderFlowViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue`}
                                    exact
                                    component={withUserRoleRequired(
                                        ReportOrderIssueFlowViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/new`}
                                    exact
                                    component={withUserRoleRequired(
                                        CreateReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/report-issue/:scenarioIndex`}
                                    exact
                                    component={withUserRoleRequired(
                                        EditReportOrderIssueFlowScenarioViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                                <Route
                                    path={`${path}/shopify/:shopName/order-management/track`}
                                    exact
                                    component={withUserRoleRequired(
                                        TrackOrderFlowViewContainer,
                                        AGENT_ROLE,
                                    )}
                                />
                            </Switch>
                        </OrderManagementPreviewProvider>
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>

            <Route
                path={[
                    `${path}/:shopType/:shopName/article-recommendation`,
                    `${path}/:shopType/:shopName/train-my-ai`,
                ]}
                render={(props) => {
                    if (
                        props.match.path ===
                        `${path}/:shopType/:shopName/train-my-ai`
                    ) {
                        return (
                            <Redirect
                                to={`${path}/${props.match.params.shopType}/${props.match.params.shopName}/article-recommendation`}
                            />
                        )
                    }
                    return React.createElement(
                        withUserRoleRequired(
                            ArticleRecommendationViewContainer,
                            AGENT_ROLE,
                        ),
                        {
                            ...props,
                            shopType: props.match.params.shopType,
                            shopName: props.match.params.shopName,
                        },
                    )
                }}
            />

            <Route path={`${path}/:shopType/:shopName/connected-channels`}>
                <SelfServiceHelpCentersProvider>
                    <SelfServiceContactFormsProvider>
                        <Route
                            path={`${path}/:shopType/:shopName/connected-channels`}
                            component={withUserRoleRequired(
                                ConnectedChannelsViewContainer,
                                AGENT_ROLE,
                            )}
                        />
                    </SelfServiceContactFormsProvider>
                </SelfServiceHelpCentersProvider>
            </Route>
            <Route path={`${path}/rules/library`} exact>
                <Redirect to={'/app/settings/rules/library'} />
            </Route>
            <Route path={`${path}`} exact>
                <AutomateLandingPageContainer />
            </Route>

            <Route
                path={`${path}/ai-agent-overview`}
                component={withUserRoleRequired(AiAgentOverview, AGENT_ROLE)}
            />

            <Route>
                <Redirect to={`${path}`} />
            </Route>
        </Switch>
    )
}

export function AiAgentBaseRoutes({ match: { path } }: RouteComponentProps) {
    const handleRedirect = (history: History, newPath: string) => {
        history.replace(newPath)
        return null
    }

    return (
        <HelpCenterApiClientProvider>
            <Switch>
                {/* Redirect `/onboarding` to `/onboarding/${WizardStepEnum.SKILLSET}` */}
                <Route
                    exact
                    path={`${path}/onboarding`}
                    render={({ history }) =>
                        handleRedirect(
                            history,
                            `${path}/onboarding/${WizardStepEnum.SKILLSET}`,
                        )
                    }
                />

                {/* Redirect `/shopType/shopName/onboarding` to `/shopType/shopName/onboarding/${WizardStepEnum.SKILLSET}` */}
                <Route
                    exact
                    path={`${path}/:shopType/:shopName/onboarding`}
                    render={({ history, match }) =>
                        handleRedirect(
                            history,
                            `${path}/${match.params.shopType}/${match.params.shopName}/onboarding/${WizardStepEnum.SKILLSET}`,
                        )
                    }
                />

                {/* Generic function to wrap AiAgentOnboarding with user role validation */}
                <Route
                    path={[
                        `${path}/onboarding/:step`,
                        `${path}/:shopType/:shopName/onboarding/:step`,
                    ]}
                    exact
                    component={withUserRoleRequired(
                        AiAgentOnboarding,
                        AGENT_ROLE,
                    )}
                />

                <Route
                    render={() => (
                        <App content={AiAgentContent} navbar={AiAgentNavbar} />
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}

function AiAgentContent() {
    const { path } = useRouteMatch()
    const isActionsInternalPlatformEnabled = useFlag(
        FeatureFlagKey.ActionsInternalPlatform,
    )

    return (
        <Switch>
            <Route path={`${path}/actions-platform/use-cases`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformUseCaseTemplatesView />
                )}
            </Route>
            <Route
                path={[
                    `${path}/actions-platform/steps`,
                    `${path}/actions-platform`,
                ]}
                exact
            >
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformStepsView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformAppsView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps/new`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformCreateAppFormView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/apps/edit/:id`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformEditAppFormView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/use-cases/new`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformCreateUseCaseTemplateView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/use-cases/edit/:id`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformEditUseCaseTemplateViewContainer />
                )}
            </Route>
            <Route path={`${path}/actions-platform/steps/new`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformCreateStepView />
                )}
            </Route>
            <Route path={`${path}/actions-platform/steps/edit/:id`} exact>
                {isActionsInternalPlatformEnabled && (
                    <ActionsPlatformEditStepViewContainer />
                )}
            </Route>

            <Route
                path={aiAgentRoutes.overview}
                component={withUserRoleRequired(AiAgentOverview, AGENT_ROLE)}
            />
            <Route
                path={`${path}/:shopType/:shopName`}
                component={withUserRoleRequired(AiAgentRoutes, AGENT_ROLE)}
            />

            <Route>
                <AiAgentRedirect />
            </Route>
        </Switch>
    )
}

export function ConvertRoutes() {
    const location = useLocation()

    useEffect(logPageChange, [location.pathname])

    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    render={() => (
                        <App content={ConvertContent} navbar={ConvertNavbar} />
                    )}
                />
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}

export function ConvertContent() {
    const { path } = useRouteMatch()
    const convertPathPrefix = `${path}/${CONVERT_ROUTING_PARAM}`
    return (
        <Switch>
            <Route
                exact
                path={`${path}/overview`}
                component={withUserRoleRequired(OverviewView, ADMIN_ROLE)}
            />
            <Route
                exact
                path={`${path}/setup`}
                component={withUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup`}
                component={withUserRoleRequired(
                    ConvertOnboardingView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/wizard`}
                component={withUserRoleRequired(
                    ConvertOnboardingWizardView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/setup/wizard/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={withUserRoleRequired(
                    CampaignTemplateCustomizeRecommendationsView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns`}
                component={withUserRoleRequired(
                    CampaignsView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new`}
                component={withUserRoleRequired(
                    CampaignDetailsFactory as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                path={`${convertPathPrefix}/campaigns/library`}
                exact
                component={withUserRoleRequired(
                    CampaginLibaryView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/new/${CONVERT_ROUTING_TEMPLATE_PARAM}`}
                component={withUserRoleRequired(
                    CampaignTemplateCustomizeLibraryView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/campaigns/${CONVERT_ROUTING_CAMPAIGN_PARAM}`}
                component={withUserRoleRequired(
                    CampaignDetailsFactory as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                path={`${convertPathPrefix}/campaigns/${CONVERT_ROUTING_CAMPAIGN_PARAM}/ab-variants`}
                component={withUserRoleRequired(
                    ABGroupIndexPage as any,
                    ADMIN_ROLE,
                )}
            />
            <Route exact path={`${convertPathPrefix}/performance`}>
                <DefaultStatsFilters
                    notReadyFallback={
                        <Route
                            render={() => (
                                <App navbar={ConvertNavbar}>{null}</App>
                            )}
                        />
                    }
                >
                    <Route
                        exact
                        path={`${convertPathPrefix}/performance`}
                        component={withUserRoleRequired(
                            RevenueCampaignsStats as any,
                            ADMIN_ROLE,
                        )}
                    />
                </DefaultStatsFilters>
            </Route>
            {window.USER_IMPERSONATED && (
                <Route
                    exact
                    path={`${convertPathPrefix}/ab-test-configuration`}
                    component={withUserRoleRequired(
                        UpdateABTestView as any,
                        ADMIN_ROLE,
                    )}
                />
            )}
            <Route
                path={`${convertPathPrefix}/performance/subscribe`}
                exact
                component={withUserRoleRequired(
                    CampaignStatsPaywallView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking`}
                exact
                component={withUserRoleRequired(
                    ClickTrackingSettingsView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                path={`${convertPathPrefix}/click-tracking/subscribe`}
                exact
                component={withUserRoleRequired(
                    ClickTrackingPaywallView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                path={`${convertPathPrefix}/installation`}
                exact
                component={withUserRoleRequired(
                    ConvertBundleView as any,
                    ADMIN_ROLE,
                )}
            />
            <Route
                exact
                path={`${convertPathPrefix}/settings`}
                component={withUserRoleRequired(
                    ConvertSettingsView as any,
                    ADMIN_ROLE,
                )}
            />

            <Route path={`${path}`} exact>
                <Redirect to="/app/convert/overview" />
            </Route>
            <Route>
                <Redirect to={`${path}`} />
            </Route>
        </Switch>
    )
}

export function AdminTasksRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <Route
                path={`${path}/import-phone-number`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            ImportPhoneNumber,
                            ADMIN_ROLE,
                            PageSection.ImportPhoneNumber,
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            <Route
                path={`${path}/twilio-subaccount-status`}
                exact
                render={() => (
                    <App
                        content={withUserRoleRequired(
                            TwilioSubaccountStatusForm,
                            ADMIN_ROLE,
                            PageSection.TwilioSubaccountStatus,
                        )}
                        navbar={SettingsNavbar}
                    />
                )}
            />
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/credit-shopify-billing-integration`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                CreditShopifyBillingIntegration,
                                ADMIN_ROLE,
                                PageSection.CreditShopifyBillingIntegration,
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/create-shopify-charge`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                CreateShopifyCharge,
                                ADMIN_ROLE,
                                PageSection.CreateShopifyCharge,
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/remove-shopify-billing`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                RemoveShopifyBilling,
                                ADMIN_ROLE,
                                PageSection.RemoveShopifyBilling,
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
            {window.USER_IMPERSONATED && (
                <Route
                    path={`${path}/update-payment-terms`}
                    exact
                    render={() => (
                        <App
                            content={withUserRoleRequired(
                                UpdatePaymentTerms,
                                ADMIN_ROLE,
                                PageSection.UpdatePaymentTerms,
                            )}
                            navbar={SettingsNavbar}
                        />
                    )}
                />
            )}
        </Switch>
    )
}

export function HomepageRoutes({ match: { path } }: RouteComponentProps) {
    return (
        <Switch>
            <CompatRoute
                path={`${path}/`}
                exact
                render={() => (
                    <App navbar={TicketNavBarRevampWrapper}>
                        <CanduContent containerId="candu-home" title="Home" />
                    </App>
                )}
            />
        </Switch>
    )
}
