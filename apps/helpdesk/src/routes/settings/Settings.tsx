import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { NotificationsSettings } from 'common/notifications'
import { PageSection } from 'config/pages'
import type { PaywallConfig } from 'config/paywalls'
import { paywallConfigs as defaultPaywallConfigs } from 'config/paywalls'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import { OBJECT_TYPES } from 'custom-fields/constants'
import Access from 'pages/settings/access/Access'
import AgentStatuses from 'pages/settings/agentUnavailability/AgentStatuses'
import APIView from 'pages/settings/api/APIView'
import UserAuditList from 'pages/settings/audit/UserAuditList'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import BusinessHoursPage from 'pages/settings/businessHours/BusinessHoursPage'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import SidebarSettings from 'pages/settings/sidebar/SidebarSettings'
import ManageTags from 'pages/settings/tags/ManageTags'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'
import PasswordAnd2FA from 'pages/settings/yourProfile/PasswordAnd2FA'
import YourProfileContainer from 'pages/settings/yourProfile/YourProfileContainer'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'
import { useCurrentRouteProduct } from 'routes/hooks/useCurrentRouteProduct'
import { Product } from 'routes/layout/productConfig'
import { WorkflowsRoutes } from 'routes/settings/Workflows'
import { AutomatePaywall } from 'settings/automate'
import {
    ArticleRecommendationsSettings,
    AutomateSettings,
    FlowsSettings,
    OrderManagementSettings,
} from 'settings/pages'
import { AccountFeature } from 'state/currentAccount/types'
import { assetsUrl } from 'utils'

import { Billing } from './Billing'
import { Channels } from './Channels'
import { ConditionalFields } from './ConditionalFields'
import { ContactForm } from './ContactForm'
import { Convert } from './Convert'
import { CustomFields } from './CustomFields'
import { HelpCenter } from './HelpCenter'
import { renderAppSettings } from './helpers/settingsRenderer'
import { HistoricalImportsRoute } from './HistoricalImportsRoute'
import { ImportEmailsRoute } from './ImportEmailsRoute'
import { ImportZendeskRoute } from './ImportZendeskRoute'
import { Integrations } from './Integrations'
import { Macros } from './Macros'
import { PhoneNumbers } from './PhoneNumbers'
import { Rules } from './Rules'
import { SLA } from './SLA'
import { StoreManagement } from './StoreManagement'
import { Teams } from './Teams'
import { Users } from './Users'

export const PaywalledArticleRecommendations = () => (
    <AutomatePaywall>
        <ArticleRecommendationsSettings />
    </AutomatePaywall>
)

export const PaywalledAutomate = () => (
    <AutomatePaywall>
        <AutomateSettings />
    </AutomatePaywall>
)

export const PaywalledFlows = () => (
    <AutomatePaywall>
        <FlowsSettings />
    </AutomatePaywall>
)

export const PaywalledOrderManagement = () => (
    <AutomatePaywall>
        <OrderManagementSettings />
    </AutomatePaywall>
)

export function SettingRoutes() {
    const { path } = useRouteMatch()
    const currentProduct = useCurrentRouteProduct()
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    if (hasWayfindingMS1Flag && currentProduct.id === Product.Workflows) {
        return <WorkflowsRoutes />
    }

    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/`}
                    exact
                    component={() => (
                        <Redirect
                            to={
                                hasWayfindingMS1Flag
                                    ? `${path}/integrations/mine`
                                    : `${path}/macros`
                            }
                        />
                    )}
                />

                <Route path={`${path}/billing`}>
                    <Billing />
                </Route>
                <Route path={`${path}/channels`}>
                    <Channels />
                </Route>
                <Route path={`${path}/contact-form`}>
                    <ContactForm />
                </Route>
                <Route path={`${path}/convert`}>
                    <Convert />
                </Route>
                <Route
                    path={`${path}/${CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER]}`}
                >
                    <CustomFields objectType={OBJECT_TYPES.CUSTOMER} />
                </Route>
                <Route
                    path={`${path}/${CUSTOM_FIELD_ROUTES[OBJECT_TYPES.TICKET]}`}
                >
                    <CustomFields objectType={OBJECT_TYPES.TICKET} />
                </Route>
                <Route path={`${path}/${CUSTOM_FIELD_CONDITIONS_ROUTE}`}>
                    <ConditionalFields />
                </Route>
                <Route path={`${path}/help-center`}>
                    <HelpCenter />
                </Route>
                <Route path={`${path}/import-zendesk`}>
                    <ImportZendeskRoute />
                </Route>
                <Route path={`${path}/import-email`}>
                    <ImportEmailsRoute />
                </Route>
                <Route path={`${path}/historical-imports`}>
                    <HistoricalImportsRoute />
                </Route>
                <Route path={`${path}/integrations`}>
                    <Integrations />
                </Route>
                <Route path={`${path}/phone-numbers`}>
                    <PhoneNumbers />
                </Route>
                <Route path={`${path}/macros`}>
                    <Macros />
                </Route>
                <Route path={`${path}/rules`}>
                    <Rules />
                </Route>
                <Route path={`${path}/sla`}>
                    <SLA />
                </Route>

                <Route path={`${path}/teams`}>
                    <Teams />
                </Route>
                <Route path={`${path}/users`}>
                    <Users />
                </Route>

                <Route path={`${path}/profile`} exact>
                    {renderAppSettings(YourProfileContainer)}
                </Route>
                <Route path={`${path}/notifications`} exact>
                    {renderAppSettings(NotificationsSettings)}
                </Route>
                <Route path={`${path}/password-2fa`} exact>
                    {renderAppSettings(PasswordAnd2FA)}
                </Route>
                <Route path={`${path}/api`} exact>
                    {renderAppSettings(APIView, {
                        roleParams: [ADMIN_ROLE, PageSection.Api],
                    })}
                </Route>
                <Route path={`${path}/audit`} exact>
                    {renderAppSettings(UserAuditList, {
                        roleParams: [ADMIN_ROLE, PageSection.Audit],
                    })}
                </Route>
                <Route path={`${path}/manage-tags`} exact>
                    {renderAppSettings(ManageTags, {
                        roleParams: [AGENT_ROLE, PageSection.ManageTags],
                    })}
                </Route>
                <Route path={`${path}/access`} exact>
                    {renderAppSettings(Access, {
                        roleParams: [ADMIN_ROLE, PageSection.Access],
                    })}
                </Route>
                <Route path={`${path}/agent-statuses`} exact>
                    {renderAppSettings(AgentStatuses, {
                        roleParams: [ADMIN_ROLE, PageSection.Access],
                    })}
                </Route>
                <Route path={`${path}/business-hours`}>
                    {renderAppSettings(BusinessHoursPage, {
                        roleParams: [ADMIN_ROLE, PageSection.BusinessHours],
                    })}
                </Route>
                <Route path={`${path}/sidebar`}>
                    {renderAppSettings(SidebarSettings, {
                        roleParams: [ADMIN_ROLE, PageSection.SidebarSettings],
                    })}
                </Route>
                <Route path={`${path}/ticket-assignment`} exact>
                    {renderAppSettings(TicketAssignment)}
                </Route>
                <Route path={`${path}/auto-merge`} exact>
                    {renderAppSettings(AutoMergeSettings)}
                </Route>

                <Route path={`${path}/automate`}>
                    {renderAppSettings(PaywalledAutomate, {
                        roleParams: [AGENT_ROLE],
                    })}
                </Route>
                <Route
                    path={`${path}/article-recommendations/:shopType?/:shopName?`}
                >
                    {renderAppSettings(PaywalledArticleRecommendations, {
                        roleParams: [AGENT_ROLE],
                    })}
                </Route>
                <Route path={`${path}/flows/:shopType?/:shopName?`}>
                    {renderAppSettings(PaywalledFlows, {
                        roleParams: [AGENT_ROLE],
                    })}
                </Route>
                <Route path={`${path}/order-management/:shopType?/:shopName?`}>
                    {renderAppSettings(PaywalledOrderManagement, {
                        roleParams: [AGENT_ROLE],
                    })}
                </Route>
                <Route path={`${path}/store-management`}>
                    <StoreManagement />
                </Route>
                <Route path={`${path}/satisfaction-surveys`} exact>
                    {renderAppSettings(SatisfactionSurveyView, {
                        roleParams: [
                            ADMIN_ROLE,
                            PageSection.SatisfactionSurveys,
                        ],
                        paywallParams: [
                            AccountFeature.SatisfactionSurveys,
                            undefined,
                            {
                                [AccountFeature.SatisfactionSurveys]: {
                                    ...defaultPaywallConfigs[
                                        AccountFeature.SatisfactionSurveys
                                    ],
                                    preview: assetsUrl(
                                        '/img/paywalls/screens/satisfaction-surveys-settings.png',
                                    ),
                                } as PaywallConfig,
                            },
                        ],
                    })}
                </Route>
            </Switch>
        </HelpCenterApiClientProvider>
    )
}
