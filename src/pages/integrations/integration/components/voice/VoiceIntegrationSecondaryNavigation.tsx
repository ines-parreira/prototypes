import React from 'react'
import {NavLink} from 'react-router-dom'

import {PhoneFunction} from 'business/twilio'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType, PhoneIntegration} from 'models/integration/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {getPhoneIntegrations} from 'state/integrations/selectors'

import {getDefaultRoutes} from '../../utils/defaultRoutes'

type Props = {
    integration?: PhoneIntegration
}

export default function VoiceIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)

    if (!integration) {
        const routes = getDefaultRoutes(
            '/app/settings/channels/phone',
            phoneIntegrations
        )

        return (
            <SecondaryNavbar>
                <NavLink to={routes.about[0]} exact>
                    About
                </NavLink>
                <NavLink to={routes.integrations[0]} exact>
                    Integrations
                </NavLink>
            </SecondaryNavbar>
        )
    }

    const integrationId: number = integration.id
    const baseURL = `/app/settings/channels/${IntegrationType.Phone}/${integrationId}`

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
                <NavLink to={`${baseURL}/greetings-music`} exact>
                    Greetings & Music
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
