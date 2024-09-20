import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {ADMIN_ROLE} from 'config/user'
import {PageSection} from 'config/pages'

import AgentList from 'pages/settings/users/List'
import AgentDetail from 'pages/settings/users/Detail'

import {renderer} from './helpers/settingsRenderer'

export function Users() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={renderer(AgentList, ADMIN_ROLE, PageSection.Users)}
            />
            <Route
                path={`${path}/add`}
                exact
                render={renderer(AgentDetail, ADMIN_ROLE, PageSection.Users)}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={renderer(AgentDetail, ADMIN_ROLE, PageSection.Users)}
            />
        </Switch>
    )
}
