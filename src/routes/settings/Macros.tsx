import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'

import MacrosSettingsContent from 'pages/settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from 'pages/settings/macros/MacrosSettingsForm'

import {renderer} from './helpers/settingsRenderer'

export function Macros() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}`}
                exact
                render={renderer(MacrosSettingsContent)}
            />
            <Route
                path={`${path}/new`}
                exact
                render={renderer(
                    MacrosSettingsForm,
                    AGENT_ROLE,
                    PageSection.SidebarSettings
                )}
            />
            <Route
                path={`${path}/:macroId`}
                exact
                render={renderer(MacrosSettingsForm)}
            />
        </Switch>
    )
}
