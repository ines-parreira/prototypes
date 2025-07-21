import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ConditionalFieldForm from 'pages/settings/conditionalFields/ConditionalField'
import ConditionalFieldsComponent from 'pages/settings/conditionalFields/ConditionalFields'

import { renderAppSettings } from './helpers/settingsRenderer'

export function ConditionalFields() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/:id`} exact>
                {renderAppSettings(ConditionalFieldForm, {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
                })}
            </Route>
            <Route path={`${path}/`} exact>
                {renderAppSettings(ConditionalFieldsComponent, {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
                })}
            </Route>
        </Switch>
    )
}
