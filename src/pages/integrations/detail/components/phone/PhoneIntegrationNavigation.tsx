import React from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar.js'
import {IntegrationType} from '../../../../../models/integration/types'

type Props = {
    integration: Map<string, any>
}

export default function PhoneIntegrationNavigation({
    integration,
}: Props): JSX.Element {
    const integrationId: number = integration.get('id')
    const baseURL = `/app/settings/integrations/${IntegrationType.PhoneIntegrationType}/${integrationId}`

    return (
        <SecondaryNavbar>
            <Link to={`${baseURL}/preferences`}>Preferences</Link>
            <Link to={`${baseURL}/voicemail`}>Voicemail</Link>
        </SecondaryNavbar>
    )
}
