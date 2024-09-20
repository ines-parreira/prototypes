import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {NotificationsSettings} from 'common/notifications'
import {PageSection} from 'config/pages'
import {
    PaywallConfig,
    paywallConfigs as defaultPaywallConfigs,
} from 'config/paywalls'
import {AccountFeature} from 'state/currentAccount/types'
import {assetsUrl} from 'utils'
import App from 'pages/App'
import SettingsNavbar from 'pages/settings/common/SettingsNavbar/SettingsNavbar'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import withUserRoleRequired from 'pages/common/utils/withUserRoleRequired'

import IntegrationDetail from 'pages/integrations/integration/Integration'
import Access from 'pages/settings/access/Access'
import APIView from 'pages/settings/api/APIView'
import UserAuditList from 'pages/settings/audit/UserAuditList'
import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import BusinessHours from 'pages/settings/businessHours/BusinessHours'
import SatisfactionSurveyView from 'pages/settings/satisfactionSurveys/SatisfactionSurveyView'
import SidebarSettings from 'pages/settings/sidebar/SidebarSettings'
import ManageTags from 'pages/settings/tags/ManageTags'
import TicketAssignment from 'pages/settings/ticketAssignment/TicketAssignment'
import PasswordAnd2FA from 'pages/settings/yourProfile/PasswordAnd2FA'
import YourProfileContainer from 'pages/settings/yourProfile/YourProfileContainer'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'

import {renderer} from './helpers/settingsRenderer'
import {Billing} from './Billing'
import {Channels} from './Channels'
import {ContactForm} from './ContactForm'
import {Convert} from './Convert'
import {CustomFields} from './CustomFields'
import {HelpCenter} from './HelpCenter'
import {Import} from './Import'
import {Integrations} from './Integrations'
import {Macros} from './Macros'
import {PhoneNumbers} from './PhoneNumbers'
import {Rules} from './Rules'
import {SLA} from './SLA'
import {Teams} from './Teams'
import {Users} from './Users'

export function SettingRoutes() {
    const {path} = useRouteMatch()

    const satisfactionPaywallConfig = {
        [AccountFeature.SatisfactionSurveys]: {
            ...defaultPaywallConfigs[AccountFeature.SatisfactionSurveys],
            preview: assetsUrl(
                '/img/paywalls/screens/satisfaction-surveys-settings.png'
            ),
        } as PaywallConfig,
    }

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderer(
                    IntegrationDetail,
                    ADMIN_ROLE,
                    PageSection.Channels,
                    `${path}/help-center`
                )}
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
            <Route path={`${path}/ticket-fields`}>
                <CustomFields />
            </Route>
            <Route path={`${path}/customer-fields`}>
                <CustomFields />
            </Route>
            {/* TODO: remove the condition once the production infrastructure is setup */}
            {window.location.hostname.indexOf('gorgias.help') === -1 && (
                <Route path={`${path}/help-center`}>
                    <HelpCenter />
                </Route>
            )}
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
            <Route path={`${path}/teams`}>
                <Teams />
            </Route>
            <Route path={`${path}/users`}>
                <Users />
            </Route>

            <Route path={`${path}/profile`} exact>
                {renderer(YourProfileContainer)}
            </Route>
            <Route path={`${path}/notifications`} exact>
                {renderer(NotificationsSettings)}
            </Route>
            <Route path={`${path}/password-2fa`} exact>
                {renderer(PasswordAnd2FA)}
            </Route>
            <Route path={`${path}/api`} exact>
                {renderer(APIView, ADMIN_ROLE, PageSection.Api)}
            </Route>
            <Route path={`${path}/audit`} exact>
                {renderer(UserAuditList, ADMIN_ROLE, PageSection.Audit)}
            </Route>
            <Route path={`${path}/manage-tags`} exact>
                {renderer(ManageTags, AGENT_ROLE, PageSection.ManageTags)}
            </Route>
            <Route path={`${path}/access`} exact>
                {renderer(Access, ADMIN_ROLE, PageSection.Access)}
            </Route>
            <Route path={`${path}/business-hours`} exact>
                {renderer(BusinessHours, ADMIN_ROLE, PageSection.BusinessHours)}
            </Route>
            <Route path={`${path}/sidebar`}>
                {renderer(
                    SidebarSettings,
                    ADMIN_ROLE,
                    PageSection.SidebarSettings
                )}
            </Route>
            <Route path={`${path}/ticket-assignment`} exact>
                {renderer(TicketAssignment)}
            </Route>
            <Route path={`${path}/auto-merge`} exact>
                {renderer(AutoMergeSettings)}
            </Route>
            {
                // maybe we should tailor `renderer` to also allow paywall
            }
            <Route path={`${path}/satisfaction-surveys`} exact>
                <App
                    content={withFeaturePaywall(
                        AccountFeature.SatisfactionSurveys,
                        undefined,
                        satisfactionPaywallConfig
                    )(
                        withUserRoleRequired(
                            SatisfactionSurveyView,
                            ADMIN_ROLE,
                            PageSection.SatisfactionSurveys
                        )
                    )}
                    navbar={SettingsNavbar}
                />
            </Route>
        </Switch>
    )
}
