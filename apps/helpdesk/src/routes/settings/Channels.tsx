import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import { RevenueAddonApiClientProvider } from 'pages/convert/common/hooks/useConvertApi'
import IntegrationDetail from 'pages/integrations/integration/Integration'

import { renderAppSettings } from './helpers/settingsRenderer'

export function Channels() {
    const { path } = useRouteMatch()

    return (
        <RevenueAddonApiClientProvider>
            <Switch>
                <Route
                    path={`${path}/:integrationType/:integrationId?/:extra?/:subId?`}
                    exact
                >
                    {renderAppSettings(IntegrationDetail, {
                        roleParams: [ADMIN_ROLE, PageSection.Channels],
                    })}
                </Route>
            </Switch>
        </RevenueAddonApiClientProvider>
    )
}
