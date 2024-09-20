import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'

import {SLAForm, SLAList, SLATemplateList} from 'pages/settings/SLAs'

import {renderer} from './helpers/settingsRenderer'

export function SLA() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={path}
                exact
                render={renderer(SLAList, AGENT_ROLE, PageSection.SLAPolicies)}
            />

            <Route
                path={`${path}/templates`}
                render={renderer(
                    SLATemplateList,
                    AGENT_ROLE,
                    PageSection.SLAPolicies
                )}
            />
            <Route
                path={`${path}/:policyId`}
                exact
                render={renderer(SLAForm, AGENT_ROLE, PageSection.SLAPolicies)}
            />
        </Switch>
    )
}
