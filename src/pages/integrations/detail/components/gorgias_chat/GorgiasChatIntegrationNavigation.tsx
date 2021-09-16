import React, {Component} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'

type Props = {
    integration: Map<any, any>
}

export default class GorgiasChatIntegrationNavigation extends Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId: number = integration.get('id')
        const baseURL = `/app/settings/integrations/${IntegrationType.GorgiasChatIntegrationType}/${integrationId}`

        return (
            <SecondaryNavbar>
                <NavLink to={`${baseURL}/appearance`} exact>
                    Appearance
                </NavLink>
                <NavLink to={`${baseURL}/installation`} exact>
                    Installation
                </NavLink>
                <NavLink to={`${baseURL}/preferences`} exact>
                    Preferences
                </NavLink>
                <NavLink to={`${baseURL}/quick_replies`} exact>
                    Quick replies
                </NavLink>
                <NavLink to={`${baseURL}/campaigns`} exact>
                    Campaigns
                </NavLink>
                <NavLink to={`${baseURL}/self_service`} exact>
                    Self-service
                </NavLink>
            </SecondaryNavbar>
        )
    }
}
