import React from 'react'

import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { NotificationsSettings } from 'common/notifications'
import { PageSection } from 'config/pages'
import {
    paywallConfigs as defaultPaywallConfigs,
    PaywallConfig,
} from 'config/paywalls'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import { OBJECT_TYPES } from 'custom-fields/constants'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import Access from 'pages/settings/access/Access'
import APIView from 'pages/settings/api/APIView'
import UserAuditList from 'pages/settings/audit/UserAuditList'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import BusinessHours from 'pages/settings/businessHours/BusinessHours'
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
import { AutomateSettings } from 'settings/pages'
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
import { Import } from './Import'
import { Integrations } from './Integrations'
import { Macros } from './Macros'
import { PhoneNumbers } from './PhoneNumbers'
import { Rules } from './Rules'
import { SLA } from './SLA'
import { Teams } from './Teams'
import { Users } from './Users'

export function SettingRoutes() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(IntegrationDetail, {
                    roleParams: [
                        ADMIN_ROLE,
                        PageSection.Channels,
                        `${path}/help-center`,
                    ],
                })}
            </Route>

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
            <Route path={`${path}/${CUSTOM_FIELD_ROUTES[OBJECT_TYPES.TICKET]}`}>
                <CustomFields objectType={OBJECT_TYPES.TICKET} />
            </Route>
            <Route path={`${path}/${CUSTOM_FIELD_CONDITIONS_ROUTE}`}>
                <ConditionalFields />
            </Route>
            <Route path={`${path}/help-center`}>
                <HelpCenter />
            </Route>
            <Route path={`${path}/import-data`}>
                <Import />
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
            <Route path={`${path}/automate`}>
                {renderAppSettings(AutomateSettings, {
                    roleParams: [AGENT_ROLE],
                })}
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
            <Route path={`${path}/business-hours`} exact>
                {renderAppSettings(BusinessHours, {
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
            <HelpCenterApiClientProvider>
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
            </HelpCenterApiClientProvider>
        </Switch>
    )
}
