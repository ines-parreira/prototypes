// @flow
import React from 'react'
import {type Map} from 'immutable'
import {Link} from 'react-router'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<*,*>
}


export default class SmoochIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
        const baseURL = `/app/settings/integrations/smooch/${integrationId}`

        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/overview`}>
                    Overview
                </Link>
                <Link to={`${baseURL}/preferences`}>
                    Preferences
                </Link>
            </SecondaryNavbar>
        )
    }
}
