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
        const baseURL = `/app/settings/channels/${IntegrationType.GorgiasChat}/${integrationId}`

        const shopName: string | undefined | null = integration.getIn([
            'meta',
            'shop_name',
        ])

        return (
            <SecondaryNavbar>
                <NavLink to={`${baseURL}/campaigns`}>Campaigns</NavLink>
                <NavLink to={`${baseURL}/quick_replies`} exact>
                    Quick replies
                </NavLink>
                <NavLink to={`${baseURL}/appearance`} exact>
                    Appearance
                </NavLink>
                <NavLink to={`${baseURL}/preferences`} exact>
                    Preferences
                </NavLink>
                {shopName ? (
                    <NavLink to={`${baseURL}/automation`} exact>
                        Automation
                    </NavLink>
                ) : null}
                <NavLink to={`${baseURL}/installation`} exact>
                    Installation
                </NavLink>
            </SecondaryNavbar>
        )
    }
}
