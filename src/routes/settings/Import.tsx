import React from 'react'

import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import ImportData from 'pages/settings/importData/ImportData'
import ImportZendeskCreate from 'pages/settings/importData/zendesk/ImportZendeskCreate'
import ImportZendeskDetail from 'pages/settings/importData/zendesk/ImportZendeskDetail'

import { renderAppSettings } from './helpers/settingsRenderer'

export function Import() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(ImportData, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportData],
                })}
            </Route>

            <Route path={`${path}/zendesk`} exact>
                {renderAppSettings(ImportZendeskCreate, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportData],
                })}
            </Route>

            <Route path={`${path}/zendesk/:integrationId/:extra?`} exact>
                {renderAppSettings(ImportZendeskDetail, {
                    roleParams: [ADMIN_ROLE, PageSection.ImportData],
                })}
            </Route>
        </Switch>
    )
}
