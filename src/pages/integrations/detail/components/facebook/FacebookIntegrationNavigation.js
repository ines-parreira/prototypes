// @flow
import React from 'react'
import {type Map} from 'immutable'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar.tsx'

type Props = {
    integration: Map<*, *>,
}

export default class FacebookIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
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
