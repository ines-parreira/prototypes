import { NavLink } from 'react-router-dom'

import { PhoneFunction } from 'business/twilio'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, PhoneIntegration } from 'models/integration/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { getPhoneIntegrations } from 'state/integrations/selectors'

import { getDefaultRoutes } from '../../utils/defaultRoutes'
import { PHONE_INTEGRATION_BASE_URL } from './constants'

type Props = {
    integration?: PhoneIntegration
}

export default function VoiceIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element | null {
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)

    if (!integration) {
        const routes = getDefaultRoutes(
            PHONE_INTEGRATION_BASE_URL,
            phoneIntegrations,
        )

        return (
            <SecondaryNavbar>
                <NavLink to={routes.about[0]} exact>
                    About
                </NavLink>
                <NavLink to={routes.integrations[0]} exact>
                    Integrations
                </NavLink>
                <NavLink to={`${PHONE_INTEGRATION_BASE_URL}/queues`} exact>
                    Queues
                </NavLink>
            </SecondaryNavbar>
        )
    }

    const integrationId: number = integration.id
    const baseURL = `/app/settings/channels/${IntegrationType.Phone}/${integrationId}`

    const isIvr = integration.meta?.function === PhoneFunction.Ivr

    if (isIvr) {
        return (
            <SecondaryNavbar>
                <NavLink to={`${baseURL}/preferences`} exact>
                    Preferences
                </NavLink>
                <NavLink to={`${baseURL}/voicemail`} exact>
                    Voicemail
                </NavLink>

                <NavLink to={`${baseURL}/ivr`} exact>
                    IVR
                </NavLink>
            </SecondaryNavbar>
        )
    }

    return null
}
