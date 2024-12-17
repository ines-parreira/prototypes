import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'

import NoMatch from 'pages/common/components/NoMatch'
import AddConditionalField from 'pages/settings/conditionalFields/AddConditionalField'
import ConditionalFieldsComponent from 'pages/settings/conditionalFields/ConditionalFields'
import EditConditionalField from 'pages/settings/conditionalFields/EditConditionalField'

import {renderAppSettings} from './helpers/settingsRenderer'

export function ConditionalFields() {
    const {path} = useRouteMatch()
    const isTicketConditionalFieldsEnabled = useFlag(
        FeatureFlagKey.TicketConditionalFields,
        false
    )

    if (!isTicketConditionalFieldsEnabled) return <NoMatch />

    return (
        <Switch>
            <Route path={`${path}/add`} exact>
                {renderAppSettings(AddConditionalField, {
                    roleParams: [ADMIN_ROLE, PageSection.ConditionalFields],
                })}
            </Route>
            <Route path={`${path}/:id/edit`} exact>
                {renderAppSettings(EditConditionalField, {
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
