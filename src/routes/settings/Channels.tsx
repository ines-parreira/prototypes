import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {RevenueAddonApiClientProvider} from 'pages/convert/common/hooks/useConvertApi'

import IntegrationDetail from 'pages/integrations/integration/Integration'

import {renderer} from './helpers/settingsRenderer'

export function Channels() {
    const {path} = useRouteMatch()

    return (
        <HelpCenterApiClientProvider>
            <RevenueAddonApiClientProvider>
                <Switch>
                    <Route
                        path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                        exact
                        render={renderer(
                            IntegrationDetail,
                            ADMIN_ROLE,
                            PageSection.Channels
                        )}
                    />
                </Switch>
            </RevenueAddonApiClientProvider>
        </HelpCenterApiClientProvider>
    )
}
