import React from 'react'
import {NavLink, useLocation} from 'react-router-dom'

import {IntegrationType, WhatsAppIntegration} from 'models/integration/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration?: WhatsAppIntegration
    enableTemplates: boolean
}

export default function WhatsAppIntegrationSecondaryNavigation({
    integration,
    enableTemplates,
}: Props): JSX.Element | null {
    const {pathname} = useLocation()
    if (pathname.endsWith('/migration')) {
        return null
    }

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
            {enableTemplates && (
                <NavLink to={`${baseURL}/templates`} exact>
                    Templates
                </NavLink>
            )}
        </SecondaryNavbar>
    )
}
