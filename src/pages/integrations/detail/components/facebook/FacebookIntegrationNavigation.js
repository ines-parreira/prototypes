// @flow
import React from 'react'
import {type Map} from 'immutable'
import {Link} from 'react-router'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'


type Props = {
    integration: Map<*, *>
}

export default class FacebookIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
        const baseURL = `/app/settings/integrations/facebook/${integrationId}`
        const adsEnabled = integration.getIn(['facebook', 'settings', 'instagram_ads_enabled'])

        const links = [
            [`${baseURL}/overview`, 'Overview'],
            [`${baseURL}/customer_chat`, 'Customer chat'],
            [`${baseURL}/preferences`, 'Preferences'],
        ]

        if (adsEnabled) {
            links.push([`${baseURL}/ads`, 'Ads'])
        }

        return (
            <SecondaryNavbar>
                {links.map(([to, text]) => (
                    <Link
                        key={to}
                        to={to}
                    >
                        {text}
                    </Link>
                ))}
            </SecondaryNavbar>
        )
    }
}
