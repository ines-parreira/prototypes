import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'

import AppDetail from 'pages/integrations/integration/components/app/App'
import IntegrationDetail from 'pages/integrations/integration/Integration'
import IntegrationsStore from 'pages/integrations/Store'
import MyIntegrations from 'pages/integrations/Store/Mine'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import {renderer} from './helpers/settingsRenderer'

export function Integrations() {
    const {path} = useRouteMatch()

    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/`}
                    exact
                    render={renderer(
                        IntegrationsStore,
                        ADMIN_ROLE,
                        PageSection.Integrations
                    )}
                />
                <Route
                    path={`${path}/mine`}
                    exact
                    render={renderer(
                        MyIntegrations,
                        ADMIN_ROLE,
                        PageSection.Integrations
                    )}
                />
                <Route
                    path={`${path}/app/:appId/:extra?`}
                    exact
                    render={renderer(AppDetail, ADMIN_ROLE)}
                />
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                    render={renderer(
                        IntegrationDetail,
                        ADMIN_ROLE,
                        PageSection.Integrations
                    )}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}
