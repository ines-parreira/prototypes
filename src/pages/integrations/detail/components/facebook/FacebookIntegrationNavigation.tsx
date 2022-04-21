import React, {Component} from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<any, any>
}

export default class FacebookIntegrationNavigation extends Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId: number = integration.get('id')
        const baseURL = `/app/settings/integrations/facebook/${integrationId}`
        const instagramAdsEnabled = integration.getIn([
            'meta',
            'settings',
            'instagram_ads_enabled',
        ])

        const links = [
            [`${baseURL}/overview`, 'Overview'],
            [`${baseURL}/customer_chat`, 'Customer chat'],
            [`${baseURL}/preferences`, 'Preferences'],
        ]

        if (instagramAdsEnabled) {
            links.push([`${baseURL}/ads`, 'Instagram ads'])
        }

        return (
            <SecondaryNavbar>
                {links.map(([to, text]) => (
                    <NavLink key={to} to={to} exact>
                        {text}
                    </NavLink>
                ))}
            </SecondaryNavbar>
        )
    }
}
