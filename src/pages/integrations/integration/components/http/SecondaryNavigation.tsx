import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import {BASE_PATH, INTEGRATIONS_LIST_PATH, EVENTS_PATH} from './constants'
import {useRouteParser} from './useRouteParser'

export default function SecondaryNavigation() {
    const {integration, integrationId} = useRouteParser()
    if (!integration) {
        return (
            <SecondaryNavbar>
                <NavLink to={BASE_PATH} exact>
                    About
                </NavLink>
                <NavLink to={`${BASE_PATH}/${INTEGRATIONS_LIST_PATH}`} exact>
                    Manage
                </NavLink>
            </SecondaryNavbar>
        )
    }

    return (
        <SecondaryNavbar>
            <NavLink to={`${BASE_PATH}/${integrationId}`} exact>
                Settings
            </NavLink>
            <NavLink to={`${BASE_PATH}/${integrationId}/${EVENTS_PATH}`}>
                Events
            </NavLink>
        </SecondaryNavbar>
    )
}
