import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {AGENT_ROLE} from 'config/user'
import {HelpCenterApiClientProvider} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'

import RulesLibrary from 'pages/settings/rules/RulesLibrary'
import RulesView from 'pages/settings/rules/RulesList'
import RuleDetailForm from 'pages/settings/rules/accountRules/RuleDetailForm'

import {renderer} from './helpers/settingsRenderer'

export function Rules() {
    const {path} = useRouteMatch()

    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route path={`${path}`} exact render={renderer(RulesView)} />
                <Route
                    path={`${path}/library`}
                    exact
                    render={renderer(RulesLibrary)}
                />
                <Route
                    path={`${path}/new`}
                    exact
                    render={renderer(
                        RuleDetailForm,
                        AGENT_ROLE,
                        PageSection.SidebarSettings
                    )}
                />
                <Route
                    path={`${path}/:ruleId`}
                    exact
                    render={renderer(RuleDetailForm)}
                />
            </Switch>
        </HelpCenterApiClientProvider>
    )
}
