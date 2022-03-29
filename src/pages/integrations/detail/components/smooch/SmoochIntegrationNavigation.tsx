import React from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<any, any>
}

export default class SmoochIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id') as number
        const baseURL = `/app/settings/integrations/smooch/${integrationId}`

        return (
            <SecondaryNavbar>
                <NavLink to={`${baseURL}/overview`} exact>
                    Overview
                </NavLink>
                <NavLink to={`${baseURL}/preferences`} exact>
                    Preferences
                </NavLink>
            </SecondaryNavbar>
        )
    }
}
