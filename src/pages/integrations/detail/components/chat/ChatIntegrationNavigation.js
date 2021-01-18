// @flow
import React from 'react'
import {type Map} from 'immutable'
import {Link} from 'react-router-dom'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'

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
                <Link to={`${baseURL}/migration`}>Migration</Link>
                <Link to={`${baseURL}/appearance`}>Appearance</Link>
                <Link to={`${baseURL}/installation`}>Installation</Link>
                <Link to={`${baseURL}/preferences`}>Preferences</Link>
                <Link to={`${baseURL}/campaigns`}>Campaigns</Link>
                <Link to={`${baseURL}/quick-replies`}>Quick replies</Link>
            </SecondaryNavbar>
        )
    }
}
