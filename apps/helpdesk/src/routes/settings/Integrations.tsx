import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import AppDetail from 'pages/integrations/integration/components/app/App'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import IntegrationsStore from 'pages/integrations/Store'
import MyIntegrations from 'pages/integrations/Store/Mine'

import { renderAppSettings } from './helpers/settingsRenderer'

export function Integrations() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(IntegrationsStore, {
                    roleParams: [ADMIN_ROLE, PageSection.Integrations],
                })}
            </Route>

            <Route path={`${path}/mine`} exact>
                {renderAppSettings(MyIntegrations, {
                    roleParams: [ADMIN_ROLE, PageSection.Integrations],
                })}
            </Route>

            <Route path={`${path}/app/:appId/:extra?`} exact>
                {renderAppSettings(AppDetail, {
                    roleParams: [ADMIN_ROLE],
                })}
            </Route>

            <Route
                path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                exact
            >
                {renderAppSettings(IntegrationDetail, {
                    roleParams: [ADMIN_ROLE, PageSection.Integrations],
                })}
            </Route>
        </Switch>
    )
}
