import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ImportEmails from 'pages/settings/historicalImports/Import'

import { renderAppSettings } from './helpers/settingsRenderer'

export function ImportEmailsRoute() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(ImportEmails, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportEmail],
                })}
            </Route>
        </Switch>
    )
}
