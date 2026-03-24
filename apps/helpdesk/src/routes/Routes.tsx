import { useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logPageChange } from '@repo/logging'
import { TicketsLegacyBridgeProvider } from '@repo/tickets'
import type { History } from 'history'
import type { RouteComponentProps } from 'react-router-dom'
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useParams,
    useRouteMatch,
} from 'react-router-dom'
import { CompatRoute } from 'react-router-dom-v5-compat'

import { AiJourneyRoutes } from 'AIJourney/routes'
import { SentryTeam } from 'common/const/sentryTeamNames'
import { PageSection } from 'config/pages'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import RevenueCampaignsStats from 'domains/reporting/pages/convert/pages/CampaignsStats'
import CampaignStatsPaywallView from 'domains/reporting/pages/convert/pages/CampaignsStats/CampaignStatsPaywallView'
import DefaultStatsFilters from 'domains/reporting/pages/DefaultStatsFilters'
import { useReportChartRestrictions } from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { StatsRoutes } from 'domains/reporting/routes/StatsRoutes'
import { VoiceOfCustomerRoutes } from 'domains/reporting/routes/VoiceOfCustomerRoutes'
// DON'T add 'pages/*' imports above to ensure CSS ordering is preserved. Placing this import elsewhere
// may cause unexpected CSS precedence issues, breaking the intended design.
//
// cf. https://github.com/gorgias/helpdesk-web-app/pull/6154
import ActionEventsViewContainer from 'pages/aiAgent/actions/ActionEventsViewContainer'
import ActionsTemplatesViewContainer from 'pages/aiAgent/actions/ActionsTemplatesViewContainer'
import ActionsViewContainer from 'pages/aiAgent/actions/ActionsViewContainer'
import CreateActionViewContainer from 'pages/aiAgent/actions/CreateActionViewContainer'
import EditActionViewContainer from 'pages/aiAgent/actions/EditActionViewContainer'
import AiAgentConfigurationContainer from 'pages/aiAgent/AiAgentConfigurationContainer'
import { AiAgentCustomerEngagement } from 'pages/aiAgent/AiAgentCustomerEngagement'
import { AiAgentGuidanceAiSuggestionNewContainer } from 'pages/aiAgent/AiAgentGuidanceAiSuggestionNewContainer'
import { AiAgentGuidanceContainer } from 'pages/aiAgent/AiAgentGuidanceContainer'
import { AiAgentGuidanceDetailContainer } from 'pages/aiAgent/AiAgentGuidanceDetailContainer'
import { AiAgentGuidanceLibraryContainer } from 'pages/aiAgent/AiAgentGuidanceLibraryContainer'
import { AiAgentGuidanceNewContainer } from 'pages/aiAgent/AiAgentGuidanceNewContainer'
import { AiAgentGuidanceTemplateNewContainer } from 'pages/aiAgent/AiAgentGuidanceTemplateNewContainer'
import { AiAgentGuidanceTemplatesContainer } from 'pages/aiAgent/AiAgentGuidanceTemplatesContainer'
import AiAgentMainViewContainer from 'pages/aiAgent/AiAgentMainViewContainer'
import AiAgentOnboardingWizard from 'pages/aiAgent/AiAgentOnboardingWizard/AiAgentOnboardingWizard'
import { AiAgentPreviewModeSettingsContainer } from 'pages/aiAgent/AiAgentPreviewModeSettings/AiAgentPreviewModeSettingsContainer'
import { AiAgentProductRecommendations } from 'pages/aiAgent/AiAgentProductRecommendations/AiAgentProductRecommendations'
import { AiAgentProductRecommendationsExclude } from 'pages/aiAgent/AiAgentProductRecommendations/AiAgentProductRecommendationsExclude'
import { AiAgentProductRecommendationsPromote } from 'pages/aiAgent/AiAgentProductRecommendations/AiAgentProductRecommendationsPromote'
import { AiAgentSales } from 'pages/aiAgent/AiAgentSales'
import { AiAgentSalesStrategy } from 'pages/aiAgent/AiAgentSalesStrategy'
import AiAgentScrapedDomainProductsContainer from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainProductsContainer'
import AiAgentScrapedDomainQuestionsContainer from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainQuestionsContainer'
import { AiAgentToneOfVoice } from 'pages/aiAgent/AiAgentToneOfVoice'
import { AiAgentNavbar } from 'pages/aiAgent/components/AiAgentNavbar/AiAgentNavbar'
import { AiAgentRedirect } from 'pages/aiAgent/components/AiAgentRedirect/AiAgentRedirect'
import AiAgentExternalDocumentsArticleContainer from 'pages/aiAgent/components/Knowledge/AiAgentExternalDocumentsArticleContainer'
import AiAgentUrlSourcesArticleContainer from 'pages/aiAgent/components/Knowledge/AiAgentUrlSourcesArticleContainer'
import {
    aiAgentRoutes,
    useAiAgentNavigation,
} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { OptimizeContainer } from 'pages/aiAgent/insights/OptimizeContainer/OptimizeContainer'
import { KnowledgeHubContainer } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubContainer'
import { AiAgentOnboarding } from 'pages/aiAgent/Onboarding_V2/components/AiAgentOnboarding/AiAgentOnboarding'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { AiAgentOpportunities } from 'pages/aiAgent/opportunities/AiAgentOpportunities'
import { AiAgentOverview } from 'pages/aiAgent/Overview/AiAgentOverview'
import { SalesPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/SalesPaywallMiddleware'
import { AiAgentPlaygroundPage } from 'pages/aiAgent/PlaygroundV2/AiAgentPlaygroundPage'
import { AiAgentAccountConfigurationProvider } from 'pages/aiAgent/providers/AiAgentAccountConfigurationProvider'
import { AiAgentErrorBoundary } from 'pages/aiAgent/providers/AiAgentErrorBoundary'
import AiAgentStoreConfigurationProvider from 'pages/aiAgent/providers/AiAgentStoreConfigurationProvider'
import { AiAgentSkills } from 'pages/aiAgent/skills/components/AiAgentSkills/AiAgentSkills'
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
import Loader from 'pages/common/components/Loader/Loader'
import NoMatch from 'pages/common/components/NoMatch'
import { DeactivatedAccountGuard } from 'pages/common/utils/DeactivatedAccountGuard'
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
import { ConvertNavbar } from 'pages/convert/common/components/ConvertNavbar/ConvertNavbar'
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
import CreateShopifyCharge from 'pages/tasks/detail/CreateShopifyCharge'
import CreditShopifyBillingIntegration from 'pages/tasks/detail/CreditShopifyBillingIntegration'
import ImportPhoneNumber from 'pages/tasks/detail/ImportPhoneNumber'
import RemoveShopifyBilling from 'pages/tasks/detail/RemoveShopifyBilling'
import TwilioSubaccountStatusForm from 'pages/tasks/detail/TwilioSubaccountStatusForm'
import UpdatePaymentTerms from 'pages/tasks/detail/UpdatePaymentTerms'
import TicketInfobarContainer from 'pages/tickets/detail/TicketInfobarContainer'
import TicketPrintContainer from 'pages/tickets/detail/TicketPrintContainer'
import TicketSourceContainer from 'pages/tickets/detail/TicketSourceContainer'
import TicketNavbar from 'pages/tickets/navbar/TicketNavbar'
import SettingsRoutes from 'routes/settings'
import { WorkflowsRoutes } from 'routes/settings/Workflows'
import { useTicketLegacyBridgeFunctions } from 'tickets/core/hooks/legacyBridge/useTicketLegacyBridgeFunctions'

// Create wrapped components outside of render to prevent re-creation on every render
const AiAgentSalesWithPaywall = SalesPaywallMiddleware(AiAgentSales)
const AiAgentCustomerEngagementWithPaywall = SalesPaywallMiddleware(
    AiAgentCustomerEngagement,
)
const AiAgentProductRecommendationsWithPaywall = SalesPaywallMiddleware(
    AiAgentProductRecommendations,
)
const AiAgentProductRecommendationsPromoteWithPaywall = SalesPaywallMiddleware(
    AiAgentProductRecommendationsPromote,
)
const AiAgentProductRecommendationsExcludeWithPaywall = SalesPaywallMiddleware(
    AiAgentProductRecommendationsExclude,
)
const AiAgentSalesStrategyWithPaywall =
    SalesPaywallMiddleware(AiAgentSalesStrategy)

export default function Routes() {
    const ticketLegacyBridgeFunctions = useTicketLegacyBridgeFunctions()
    return (
        <TicketsLegacyBridgeProvider {...ticketLegacyBridgeFunctions}>
            <Route path="/app">
                <AppRoutes />
            </Route>
        </TicketsLegacyBridgeProvider>
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
            <Route
                path={`${path}/automation`}
                component={RedirectToAiAgentRoutes}
            />
            <Route path={`${path}/ai-agent`} render={AiAgentBaseRoutes} />
            <Route path={`${path}/ai-journey`} render={AiJourneyRoutes} />
            <Route path={`${path}/convert`}>
                <ConvertRoutes />
            </Route>
            <Route path={`${path}/settings`}>
                <SettingsRoutes />
            </Route>
            <Route path={`${path}/workflows`}>
                <WorkflowsRoutes />
            </Route>
            <Route path={`${path}/home`} render={HomepageRoutes} />
            <Route
                path={`${path}/referral-program`}
                exact
                render={() => (
                    <App content={ReferralContent} navbar={TicketNavbar} />
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
                        navbar={TicketNavbar}
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
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const isAiAgentAIGeneratedGuidancesEnabled = useFlag(
        FeatureFlagKey.AiAgentAIGeneratedGuidances,
    )

    const isAiAgentOnboardingWizardEnabled = useFlag(
        FeatureFlagKey.AiAgentOnboardingWizard,
    )

    const isShoppingAssitantDeactivationEnforced = useFlag(
        FeatureFlagKey.ShoppingAssistantEnforceDeactivation,
    )

    const isAbTestingEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantAbTesting,
        false,
    )

    const isKnowledgeIntentManagementSystemEnabled = useFlag(
        FeatureFlagKey.KnowledgeIntentManagementSystem,
    )

    const { routes } = useAiAgentNavigation({ shopName })

    if (shopType !== 'shopify') {
        return <Redirect to="/app/ai-agent" />
    }

    // TMP: Remove it when AI Agent will be fully migrated to its new route
    // Redirect from old /app/automation/../../ai-agent/.. to new `/app/ai-agent/../../..` route
    if (location.pathname.startsWith('/app/automation')) {
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
                        path={`${path}/overview`}
                        exact
                        component={AiAgentOverview}
                    />
                    <Route
                        path={path}
                        exact
                        component={AiAgentMainViewContainer}
                    />
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
                            component={AiAgentPlaygroundPage}
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
                            component={CreateActionViewContainer}
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
                    <AiAgentErrorBoundary
                        section="ai-agent-knowledge"
                        team={SentryTeam.CONVAI_KNOWLEDGE}
                    >
                        <Switch>
                            <Route
                                path={[
                                    `${path}/knowledge/:type/:id`,
                                    `${path}/knowledge/sources`,
                                    `${path}/knowledge`,
                                ]}
                                exact
                                component={KnowledgeHubContainer}
                            />
                        </Switch>
                        <Switch>
                            <Route
                                exact
                                path={`${path}/knowledge/sources/questions-content`}
                                component={
                                    AiAgentScrapedDomainQuestionsContainer
                                }
                            />
                            <Route
                                path={`${path}/knowledge/sources/questions-content/:articleId`}
                                component={
                                    AiAgentScrapedDomainQuestionsContainer
                                }
                            />
                            <Route
                                exact
                                path={`${path}/knowledge/sources/products-content`}
                                component={
                                    AiAgentScrapedDomainProductsContainer
                                }
                            />
                            <Route
                                path={`${path}/knowledge/sources/products-content/:productId`}
                                component={
                                    AiAgentScrapedDomainProductsContainer
                                }
                            />
                            <Route
                                path={`${path}/knowledge/sources/url-articles/:articleIngestionId/articles/:articleId`}
                                component={AiAgentUrlSourcesArticleContainer}
                            />
                            <Route
                                path={`${path}/knowledge/sources/url-articles/:articleIngestionId/articles`}
                                component={AiAgentUrlSourcesArticleContainer}
                            />
                            <Route
                                path={`${path}/knowledge/sources/file-articles/:fileIngestionId/articles/:articleId`}
                                component={
                                    AiAgentExternalDocumentsArticleContainer
                                }
                            />
                            <Route
                                path={`${path}/knowledge/sources/file-articles/:fileIngestionId/articles`}
                                component={
                                    AiAgentExternalDocumentsArticleContainer
                                }
                            />
                        </Switch>
                        {location.pathname.endsWith('/knowledge') && (
                            <Redirect
                                to={location.pathname.replace(
                                    '/knowledge',
                                    '/knowledge/sources',
                                )}
                            />
                        )}
                        {location.pathname.includes('/pages-content') && (
                            <Redirect
                                to={location.pathname.replace(
                                    '/pages-content',
                                    '/questions-content',
                                )}
                            />
                        )}
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-tone-of-voice"
                        team={SentryTeam.AI_AGENT}
                    >
                        <Route
                            path={`${path}/tone-of-voice`}
                            component={AiAgentToneOfVoice}
                            exact
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-intents"
                        team={SentryTeam.CONVAI_KNOWLEDGE}
                    >
                        <Route
                            path={`${path}/intents`}
                            exact
                            component={OptimizeContainer}
                        />
                        {location.pathname.includes('/optimize') && (
                            <Redirect
                                to={location.pathname.replace(
                                    '/optimize',
                                    '/intents',
                                )}
                            />
                        )}
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-opportunities"
                        team={SentryTeam.CONVAI_KNOWLEDGE}
                    >
                        <Route
                            path={`${path}/opportunities`}
                            exact
                            component={AiAgentOpportunities}
                        />
                        <Route
                            path={`${path}/opportunities/:opportunityId`}
                            component={AiAgentOpportunities}
                        />
                    </AiAgentErrorBoundary>
                    {isKnowledgeIntentManagementSystemEnabled && (
                        <AiAgentErrorBoundary
                            section="ai-agent-skills"
                            team={SentryTeam.CONVAI_KNOWLEDGE}
                        >
                            <Route
                                path={`${path}/skills`}
                                exact
                                component={AiAgentSkills}
                            />
                        </AiAgentErrorBoundary>
                    )}
                    <AiAgentErrorBoundary
                        section="ai-agent-products"
                        team={SentryTeam.CONVAI_KNOWLEDGE}
                    >
                        <Switch>
                            <Route
                                path={`${path}/products`}
                                exact
                                component={
                                    AiAgentScrapedDomainProductsContainer
                                }
                            />
                            <Route
                                path={`${path}/products/:productId`}
                                component={
                                    AiAgentScrapedDomainProductsContainer
                                }
                            />
                        </Switch>
                        {location.pathname.includes(
                            '/knowledge/sources/products-content',
                        ) && (
                            <Redirect
                                to={location.pathname.replace(
                                    '/knowledge/sources/products-content',
                                    '/products',
                                )}
                            />
                        )}
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary section="ai-agent-deploy">
                        <Route
                            path={`${path}/deploy/:section`}
                            exact
                            component={AiAgentConfigurationContainer}
                        />
                    </AiAgentErrorBoundary>
                    {location.pathname.includes('/settings/channels') && (
                        <Redirect
                            to={location.pathname.replace(
                                '/settings/channels',
                                '/deploy/email',
                            )}
                        />
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
                        </Switch>
                    </AiAgentErrorBoundary>

                    {/* Enforce redirection outside of `/sales` when Shopping Assistant feature flag is set to enforce deactivation */}
                    {isShoppingAssitantDeactivationEnforced &&
                        !isAbTestingEnabled && (
                            <Route path={`${path}/sales`}>
                                <Redirect to={routes.main} />
                            </Route>
                        )}

                    <AiAgentErrorBoundary
                        section="ai-agent-sales"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales`}
                            exact
                            component={AiAgentSalesWithPaywall}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-customer-engagement"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales/customer-engagement`}
                            exact
                            component={AiAgentCustomerEngagementWithPaywall}
                        />
                    </AiAgentErrorBoundary>
                    <AiAgentErrorBoundary
                        section="ai-agent-product-recommendations"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales/product-recommendations`}
                            exact
                            component={AiAgentProductRecommendationsWithPaywall}
                        />

                        <Route
                            path={`${path}/sales/product-recommendations/promote`}
                            exact
                            component={
                                AiAgentProductRecommendationsPromoteWithPaywall
                            }
                        />

                        <Route
                            path={`${path}/sales/product-recommendations/exclude`}
                            exact
                            component={
                                AiAgentProductRecommendationsExcludeWithPaywall
                            }
                        />
                    </AiAgentErrorBoundary>
                    {location.pathname.includes('/sales/analytics') && (
                        <Redirect to={`/app/stats/ai-sales-agent/overview`} />
                    )}
                    <AiAgentErrorBoundary
                        section="ai-agent-sales-strategy"
                        team={SentryTeam.MARKETING}
                    >
                        <Route
                            path={`${path}/sales/strategy`}
                            exact
                            component={AiAgentSalesStrategyWithPaywall}
                        />
                    </AiAgentErrorBoundary>
                </AiAgentStoreConfigurationProvider>
            </AiAgentAccountConfigurationProvider>
        </Switch>
    )
}

/**
 * `/app/automation` routes have been removed, now we redirect all the routes to `/app/ai-agent`
 * This is a temporary route to avoid breaking changes, it will be removed in the future
 */
export function RedirectToAiAgentRoutes() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            {/* These routes will be redirected by the `useAutomateRedirects` hook */}
            <Route
                path={[
                    `${path}/:shopType/:shopName/order-management`,
                    `${path}/:shopType/:shopName/flows`,
                    `${path}/:shopType/:shopName/article-recommendation`,
                ]}
                component={withUserRoleRequired(Loader, AGENT_ROLE)}
            />

            <Route
                path={`${path}/:shopType/:shopName`}
                component={withUserRoleRequired(AiAgentRoutes, AGENT_ROLE)}
            />

            <Route
                render={() => (
                    <App
                        content={() => <AiAgentRedirect />}
                        navbar={AiAgentNavbar}
                    />
                )}
            ></Route>
        </Switch>
    )
}

export function AiAgentBaseRoutes({ match: { path } }: RouteComponentProps) {
    const handleRedirect = (history: History, newPath: string) => {
        history.replace(newPath)
        return null
    }
    return (
        <DeactivatedAccountGuard>
            <HelpCenterApiClientProvider>
                <Switch>
                    {/* Redirect `/onboarding` to `/onboarding/${WizardStepEnum.SKILLSET}` */}
                    <Route
                        exact
                        path={`${path}/onboarding`}
                        render={({ history }) =>
                            handleRedirect(
                                history,
                                `${path}/onboarding/${WizardStepEnum.SHOPIFY_INTEGRATION}`,
                            )
                        }
                    />

                    {/* Redirect `/shopType/shopName/onboarding` to first onboarding step */}
                    <Route
                        exact
                        path={`${path}/:shopType/:shopName/onboarding`}
                        render={({ history, match }) =>
                            handleRedirect(
                                history,
                                `${match.url}/${WizardStepEnum.TONE_OF_VOICE}`,
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
                            <App
                                content={AiAgentContent}
                                navbar={AiAgentNavbar}
                            />
                        )}
                    />
                </Switch>
            </HelpCenterApiClientProvider>
        </DeactivatedAccountGuard>
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
                    <App navbar={TicketNavbar}>
                        <CanduContent containerId="candu-home" title="Home" />
                    </App>
                )}
            />
        </Switch>
    )
}
