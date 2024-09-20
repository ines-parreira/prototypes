import React from 'react'

import {Redirect, Route, Switch, useRouteMatch} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'common/flags'
import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'
import NoMatch from 'pages/common/components/NoMatch'

import CustomFieldsComponent from 'pages/settings/customFields/CustomFields'
import AddCustomField from 'pages/settings/customFields/AddCustomField'
import EditCustomField from 'pages/settings/customFields/EditCustomField'

import {renderer} from './helpers/settingsRenderer'

export function CustomFields() {
    const {path} = useRouteMatch()
    const isCustomerFields = path.includes('customer-fields')
    const hasCustomerFieldsEnabled = useFlag(
        FeatureFlagKey.CustomerFields,
        false
    )

    if (isCustomerFields && !hasCustomerFieldsEnabled) return <NoMatch />

    return (
        <Switch>
            <Route
                path={`${path}/add`}
                exact
                render={renderer(
                    AddCustomField,
                    ADMIN_ROLE,
                    isCustomerFields
                        ? PageSection.CustomerFields
                        : PageSection.TicketFields
                )}
            />
            <Route
                path={`${path}/:id/edit`}
                exact
                render={renderer(
                    EditCustomField,
                    ADMIN_ROLE,
                    isCustomerFields
                        ? PageSection.CustomerFields
                        : PageSection.TicketFields
                )}
            />
            <Route exact path={`${path}/`}>
                <Redirect to={`${path}/active`} />
            </Route>
            <Route
                path={`${path}/:activeTab`}
                exact
                render={renderer(
                    CustomFieldsComponent,
                    ADMIN_ROLE,
                    isCustomerFields
                        ? PageSection.CustomerFields
                        : PageSection.TicketFields
                )}
            />
        </Switch>
    )
}
