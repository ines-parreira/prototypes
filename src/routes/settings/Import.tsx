import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'

import ImportZendeskDetail from 'pages/settings/importData/zendesk/ImportZendeskDetail'
import ImportData from 'pages/settings/importData/ImportData'
import ImportZendeskCreate from 'pages/settings/importData/zendesk/ImportZendeskCreate'

import {renderer} from './helpers/settingsRenderer'

export function Import() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={renderer(
                    ImportData,
                    ADMIN_ROLE,
                    PageSection.ImportData
                )}
            />
            <Route
                path={`${path}/zendesk`}
                exact
                render={renderer(
                    ImportZendeskCreate,
                    ADMIN_ROLE,
                    PageSection.ImportData
                )}
            />
            <Route
                path={`${path}/zendesk/:integrationId/:extra?`}
                exact
                render={renderer(
                    ImportZendeskDetail,
                    ADMIN_ROLE,
                    PageSection.ImportData
                )}
            />
        </Switch>
    )
}
