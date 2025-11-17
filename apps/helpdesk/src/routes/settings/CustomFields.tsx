import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import { OBJECT_TYPES } from 'custom-fields/constants'
import type { CustomFieldObjectTypes } from 'custom-fields/types'
import AddCustomField from 'pages/settings/customFields/AddCustomField'
import CustomFieldsComponent from 'pages/settings/customFields/CustomFields'
import EditCustomField from 'pages/settings/customFields/EditCustomField'

import { renderAppSettings } from './helpers/settingsRenderer'

export function CustomFields({
    objectType,
}: {
    objectType: CustomFieldObjectTypes
}) {
    const { path } = useRouteMatch()
    const isCustomerFields = objectType === OBJECT_TYPES.CUSTOMER

    return (
        <Switch>
            <Route path={`${path}/add`} exact>
                {renderAppSettings(AddCustomField, {
                    componentProps: {
                        objectType: objectType,
                    },
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
                    componentProps: {
                        objectType: objectType,
                    },
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
                    componentProps: {
                        objectType: objectType,
                    },
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
