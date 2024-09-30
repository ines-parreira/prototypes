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

import {renderAppSettings} from './helpers/settingsRenderer'

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
            <Route path={`${path}/add`} exact>
                {renderAppSettings(AddCustomField, {
                    roleParams: [
                        ADMIN_ROLE,
                        isCustomerFields
                            ? PageSection.CustomerFields
                            : PageSection.TicketFields,
                    ],
                })}
            </Route>
            <Route path={`${path}/:id/edit`} exact>
                {renderAppSettings(EditCustomField, {
                    roleParams: [
                        ADMIN_ROLE,
                        isCustomerFields
                            ? PageSection.CustomerFields
                            : PageSection.TicketFields,
                    ],
                })}
            </Route>
            <Route exact path={`${path}/`}>
                <Redirect to={`${path}/active`} />
            </Route>
            <Route path={`${path}/:activeTab`} exact>
                {renderAppSettings(CustomFieldsComponent, {
                    roleParams: [
                        ADMIN_ROLE,
                        isCustomerFields
                            ? PageSection.CustomerFields
                            : PageSection.TicketFields,
                    ],
                })}
            </Route>
        </Switch>
    )
}
