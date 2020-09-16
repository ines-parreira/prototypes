// @flow
import React from 'react'
import {type Map} from 'immutable'
import {Link} from 'react-router'

import {GORGIAS_CHAT_INTEGRATION_TYPE} from '../../../../../constants/integration'
import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<*, *>,
}

export default class GorgiasChatIntegrationNavigation extends React.Component<Props> {
    render() {
        const {integration} = this.props
        const integrationId = integration.get('id')
        const baseURL = `/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}/${integrationId}`

        return (
            <SecondaryNavbar>
                <Link to={`${baseURL}/appearance`}>Appearance</Link>
                <Link to={`${baseURL}/installation`}>Installation</Link>
                <Link to={`${baseURL}/preferences`}>Preferences</Link>
                <Link to={`${baseURL}/quick_replies`}>Quick replies</Link>
            </SecondaryNavbar>
        )
    }
}
