import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType, WhatsAppIntegration} from 'models/integration/types'

type Props = {
    integration?: WhatsAppIntegration
}

export default function WhatsAppIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element {
    if (!integration) {
        return (
            <SecondaryNavbar>
                <NavLink
                    to={`/app/settings/integrations/${IntegrationType.WhatsApp}`}
                    exact
                >
                    About
                </NavLink>
                <NavLink
                    to={`/app/settings/integrations/${IntegrationType.WhatsApp}/integrations`}
                    exact
                >
                    Integrations
                </NavLink>
            </SecondaryNavbar>
        )
    }

    const integrationId: number = integration.id
    const baseURL = `/app/settings/integrations/${IntegrationType.WhatsApp}/${integrationId}`

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
        </SecondaryNavbar>
    )
}
