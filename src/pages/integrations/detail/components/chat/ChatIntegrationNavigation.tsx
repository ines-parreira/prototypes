import React from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<any, any>
}

export default function ChatIntegrationNavigation({integration}: Props) {
    const baseURL = `/app/settings/integrations/smooch_inside/${
        integration.get('id') as number
    }`

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/migration`} exact>
                Migration
            </NavLink>
            <NavLink to={`${baseURL}/appearance`} exact>
                Appearance
            </NavLink>
            <NavLink to={`${baseURL}/installation`} exact>
                Installation
            </NavLink>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/campaigns`} exact>
                Campaigns
            </NavLink>
            <NavLink to={`${baseURL}/quick_replies`} exact>
                Quick replies
            </NavLink>
        </SecondaryNavbar>
    )
}
