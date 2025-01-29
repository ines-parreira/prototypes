import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import {useFlag} from 'core/flags'

import NoMatch from 'pages/common/components/NoMatch'

import ConditionalFieldForm from 'pages/settings/conditionalFields/ConditionalField'
import ConditionalFieldsComponent from 'pages/settings/conditionalFields/ConditionalFields'

import {renderAppSettings} from './helpers/settingsRenderer'

export function ConditionalFields() {
    const {path} = useRouteMatch()
    const isTicketConditionalFieldsEnabled = useFlag(
        FeatureFlagKey.TicketConditionalFields
    )

    if (!isTicketConditionalFieldsEnabled) return <NoMatch />

    return (
        <Switch>
            <Route path={`${path}/:id`} exact>
                {renderAppSettings(ConditionalFieldForm, {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
                })}
            </Route>
            <Route path={`${path}/`} exact>
                {renderAppSettings(ConditionalFieldsComponent, {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
                })}
            </Route>
        </Switch>
    )
}
