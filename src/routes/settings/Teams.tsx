import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {ADMIN_ROLE} from 'config/user'
import {PageSection} from 'config/pages'

import TeamsList from 'pages/settings/teams/List'
import TeamsForm from 'pages/settings/teams/Form'
import List from 'pages/settings/teams/members/List'

import {renderAppSettings} from './helpers/settingsRenderer'

export function Teams() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(TeamsList, {
                    roleParams: [ADMIN_ROLE, PageSection.Teams],
                })}
            </Route>

            <Route path={`${path}/:id`} exact>
                {renderAppSettings(TeamsForm, {
                    roleParams: [ADMIN_ROLE, PageSection.Teams],
                })}
            </Route>

            <Route path={`${path}/:id/members`} exact>
                {renderAppSettings(List, {
                    roleParams: [ADMIN_ROLE, PageSection.Teams],
                })}
            </Route>
        </Switch>
    )
}
