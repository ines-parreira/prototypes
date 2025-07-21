import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ImportZendesk from 'pages/settings/importZendesk/ImportZendesk'
import ImportZendeskCreate from 'pages/settings/importZendesk/zendesk/ImportZendeskCreate'
import ImportZendeskDetail from 'pages/settings/importZendesk/zendesk/ImportZendeskDetail'

import { renderAppSettings } from './helpers/settingsRenderer'

export function ImportZendeskRoute() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(ImportZendesk, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportZendesk],
                })}
            </Route>

            <Route path={`${path}/zendesk`} exact>
                {renderAppSettings(ImportZendeskCreate, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportZendesk],
                })}
            </Route>

            <Route path={`${path}/zendesk/:integrationId/:extra?`} exact>
                {renderAppSettings(ImportZendeskDetail, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportZendesk],
                })}
            </Route>
        </Switch>
    )
}
