import React from 'react'

import {Route, Switch, useRouteMatch} from 'react-router-dom'

import {PageSection} from 'config/pages'
import {ADMIN_ROLE} from 'config/user'

import PhoneNumbersListContainer from 'pages/phoneNumbers/PhoneNumbersListContainer'
import PhoneNumberCreateContainer from 'pages/phoneNumbers/PhoneNumberCreateContainer'
import PhoneNumberDetailContainer from 'pages/phoneNumbers/PhoneNumberDetailContainer'

import {renderer} from './helpers/settingsRenderer'

export function PhoneNumbers() {
    const {path} = useRouteMatch()

    return (
        <Switch>
            <Route
                path={`${path}/`}
                exact
                render={renderer(
                    PhoneNumbersListContainer,
                    ADMIN_ROLE,
                    PageSection.PhoneNumbers
                )}
            />
            <Route
                path={`${path}/new`}
                exact
                render={renderer(
                    PhoneNumberCreateContainer,
                    ADMIN_ROLE,
                    PageSection.PhoneNumbers
                )}
            />
            <Route
                path={`${path}/:phoneNumberId`}
                exact
                render={renderer(
                    PhoneNumberDetailContainer,
                    ADMIN_ROLE,
                    PageSection.PhoneNumbers
                )}
            />
        </Switch>
    )
}
