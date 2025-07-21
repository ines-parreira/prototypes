import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import {
    StoreManagementPage,
    StoreManagementProvider,
} from 'pages/settings/storeManagement'
import StoreDetailsPage from 'pages/settings/storeManagement/storeDetailsPage/StoreDetailsPage'

import { renderAppSettings } from './helpers/settingsRenderer'

export function StoreManagement() {
    const { path } = useRouteMatch()
    return (
        <StoreManagementProvider>
            <Switch>
                <Route path={`${path}/`} exact>
                    {renderAppSettings(StoreManagementPage, {
                        roleParams: [ADMIN_ROLE, PageSection.StoreManagement],
                    })}
                </Route>

                <Route path={`${path}/:id`}>
                    {renderAppSettings(StoreDetailsPage, {
                        roleParams: [ADMIN_ROLE, PageSection.StoreDetails],
                    })}
                </Route>
            </Switch>
        </StoreManagementProvider>
    )
}
