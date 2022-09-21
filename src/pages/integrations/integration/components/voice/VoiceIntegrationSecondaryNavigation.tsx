import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType, PhoneIntegration} from 'models/integration/types'
import {PhoneFunction} from 'business/twilio'

type Props = {
    integration?: PhoneIntegration
}

export default function VoiceIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element {
    if (!integration) {
        return (
            <SecondaryNavbar>
                <NavLink to="/app/settings/integrations/phone" exact>
                    About
                </NavLink>
                <NavLink
                    to="/app/settings/integrations/phone/integrations"
                    exact
                >
                    Integrations
                </NavLink>
            </SecondaryNavbar>
        )
    }

    const integrationId: number = integration.id
    const baseURL = `/app/settings/integrations/${IntegrationType.Phone}/${integrationId}`

    const isIvr = integration.meta?.function === PhoneFunction.Ivr

    return (
        <SecondaryNavbar>
            <NavLink to={`${baseURL}/preferences`} exact>
                Preferences
            </NavLink>
            <NavLink to={`${baseURL}/voicemail`} exact>
                Voicemail
            </NavLink>
            {!isIvr && (
                <NavLink to={`${baseURL}/greeting-message`} exact>
                    Greeting Message
                </NavLink>
            )}
            {isIvr && (
                <NavLink to={`${baseURL}/ivr`} exact>
                    IVR
                </NavLink>
            )}
        </SecondaryNavbar>
    )
}
