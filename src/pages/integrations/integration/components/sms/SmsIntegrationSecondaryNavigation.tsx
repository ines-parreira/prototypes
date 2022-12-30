import React from 'react'
import {NavLink} from 'react-router-dom'

import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {SmsIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getSmsIntegrations} from 'state/integrations/selectors'
import {getDefaultRoutes} from '../../utils/defaultRoutes'

type Props = {
    integration?: SmsIntegration
}

export default function SmsIntegrationSecondaryNavigation({
    integration,
}: Props): JSX.Element | null {
    const smsIntegrations = useAppSelector(getSmsIntegrations)

    if (integration) {
        return null
    }

    const routes = getDefaultRoutes(
        '/app/settings/channels/sms',
        smsIntegrations
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
