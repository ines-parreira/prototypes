import React from 'react'

import { Route, Switch, useRouteMatch } from 'react-router-dom'

import { PageSection } from 'config/pages'
import { ADMIN_ROLE } from 'config/user'
import PhoneNumberCreateContainer from 'pages/phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from 'pages/phoneNumbers/PhoneNumberDetailContainer'
import PhoneNumbersListContainer from 'pages/phoneNumbers/PhoneNumbersListContainer'

import { renderAppSettings } from './helpers/settingsRenderer'

export function PhoneNumbers() {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/`} exact>
                {renderAppSettings(PhoneNumbersListContainer, {
                    roleParams: [ADMIN_ROLE, PageSection.PhoneNumbers],
                })}
            </Route>

            <Route path={`${path}/new`} exact>
                {renderAppSettings(PhoneNumberCreateContainer, {
                    roleParams: [ADMIN_ROLE, PageSection.PhoneNumbers],
                })}
            </Route>

            <Route path={`${path}/:phoneNumberId`} exact>
                {renderAppSettings(PhoneNumberDetailContainer, {
                    roleParams: [ADMIN_ROLE, PageSection.PhoneNumbers],
                })}
            </Route>
        </Switch>
    )
}
