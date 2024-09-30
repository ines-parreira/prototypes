import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'

import MacrosSettingsContent from 'pages/settings/macros/MacrosSettingsContent'
import MacrosSettingsForm from 'pages/settings/macros/MacrosSettingsForm'

import {renderAppSettings} from './helpers/settingsRenderer'

export function Macros() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}`} exact>
                {renderAppSettings(MacrosSettingsContent)}
            </Route>

            <Route path={`${path}/new`} exact>
                {renderAppSettings(MacrosSettingsForm, {
                    roleParams: [AGENT_ROLE, PageSection.SidebarSettings],
                })}
            </Route>

            <Route path={`${path}/:macroId`} exact>
                {renderAppSettings(MacrosSettingsForm)}
            </Route>
        </Switch>
    )
}
