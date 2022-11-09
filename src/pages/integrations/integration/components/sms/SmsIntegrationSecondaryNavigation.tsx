import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {SmsIntegration} from 'models/integration/types'

type Props = {
    integration?: SmsIntegration
}

export default function SmsIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element | null {
    if (integration) {
        return null
    }

    return (
        <SecondaryNavbar>
            <NavLink to="/app/settings/channels/sms" exact>
                About
            </NavLink>
            <NavLink to="/app/settings/channels/sms/integrations" exact>
                Integrations
            </NavLink>
        </SecondaryNavbar>
    )
}
