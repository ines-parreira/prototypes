import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'

import {SLAForm, SLAList, SLATemplateList} from 'pages/settings/SLAs'

import {renderAppSettings} from './helpers/settingsRenderer'

export function SLA() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route path={path} exact>
                {renderAppSettings(SLAList, {
                    roleParams: [AGENT_ROLE, PageSection.SLAPolicies],
                })}
            </Route>

            <Route path={`${path}/templates`}>
                {renderAppSettings(SLATemplateList, {
                    roleParams: [AGENT_ROLE, PageSection.SLAPolicies],
                })}
            </Route>

            <Route path={`${path}/:policyId`} exact>
                {renderAppSettings(SLAForm, {
                    roleParams: [AGENT_ROLE, PageSection.SLAPolicies],
                })}
            </Route>
        </Switch>
    )
}
