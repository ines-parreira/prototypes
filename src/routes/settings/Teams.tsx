import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {ADMIN_ROLE} from 'config/user'
import {PageSection} from 'config/pages'

import TeamsList from 'pages/settings/teams/List'
import TeamsForm from 'pages/settings/teams/Form'
import List from 'pages/settings/teams/members/List'

import {renderer} from './helpers/settingsRenderer'

export function Teams() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={renderer(TeamsList, ADMIN_ROLE, PageSection.Teams)}
            />
            <Route
                path={`${path}/:id`}
                exact
                render={renderer(TeamsForm, ADMIN_ROLE, PageSection.Teams)}
            />
            <Route
                path={`${path}/:id/members`}
                exact
                render={renderer(List, ADMIN_ROLE, PageSection.Teams)}
            />
        </Switch>
    )
}
