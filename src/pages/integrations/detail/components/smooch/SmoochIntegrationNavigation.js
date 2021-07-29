// @flow
import React from 'react'
import {type Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar.tsx'

type Props = {
    integration: Map<*, *>,
}

export default class SmoochIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
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
