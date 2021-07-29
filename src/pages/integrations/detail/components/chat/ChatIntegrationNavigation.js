// @flow
import React from 'react'
import {type Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar.tsx'

type Props = {
    integration: Map<*, *>,
}

export default class ChatIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
        const baseURL = `/app/settings/integrations/smooch_inside/${integrationId}`

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
}
