import { UserRole } from '@repo/utils'
import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import HistoricalImports from 'pages/settings/historicalImports/Import'

import { renderAppSettings } from './helpers/settingsRenderer'

export function HistoricalImportsRoute() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(HistoricalImports, {
                    roleParams: [UserRole.Admin, PageSection.HistoricalImports],
                })}
            </Route>
        </Switch>
    )
}
