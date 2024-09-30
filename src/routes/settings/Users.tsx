import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {ADMIN_ROLE} from 'config/user'
import {PageSection} from 'config/pages'

import AgentList from 'pages/settings/users/List'
import AgentDetail from 'pages/settings/users/Detail'

import {renderAppSettings} from './helpers/settingsRenderer'

export function Users() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(AgentList, {
                    roleParams: [ADMIN_ROLE, PageSection.Users],
                })}
            </Route>

            <Route path={`${path}/add`} exact>
                {renderAppSettings(AgentDetail, {
                    roleParams: [ADMIN_ROLE, PageSection.Users],
                })}
            </Route>

            <Route path={`${path}/:id`} exact>
                {renderAppSettings(AgentDetail, {
                    roleParams: [ADMIN_ROLE, PageSection.Users],
                })}
            </Route>
        </Switch>
    )
}
