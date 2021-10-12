import React from 'react'
import {NavLink} from 'react-router-dom'
import {Map} from 'immutable'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
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
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/voicemail`} exact>
                Voicemail
            </NavLink>
            <NavLink to={`${baseURL}/greeting-message`} exact>
                Greeting Message
            </NavLink>
        </SecondaryNavbar>
    )
}
