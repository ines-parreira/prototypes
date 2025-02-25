import React from 'react'

import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { AGENT_ROLE } from 'config/user'
import { HelpCenterApiClientProvider } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import RuleDetailForm from 'pages/settings/rules/accountRules/RuleDetailForm'
import RulesLibrary from 'pages/settings/rules/RulesLibrary'
import RulesView from 'pages/settings/rules/RulesList'

import { renderAppSettings } from './helpers/settingsRenderer'

export function Rules() {
    const { path } = useRouteMatch()

    return (
        <HelpCenterApiClientProvider>
            <Switch>
                <Route path={`${path}`} exact>
                    {renderAppSettings(RulesView)}
                </Route>

                <Route path={`${path}/library`} exact>
                    {renderAppSettings(RulesLibrary)}
                </Route>

                <Route path={`${path}/new`} exact>
                    {renderAppSettings(RuleDetailForm, {
                        roleParams: [AGENT_ROLE, PageSection.SidebarSettings],
                    })}
                </Route>

                <Route path={`${path}/:ruleId`} exact>
                    {renderAppSettings(RuleDetailForm)}
                </Route>
            </Switch>
        </HelpCenterApiClientProvider>
    )
}
