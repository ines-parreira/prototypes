import React from 'react'
import {NavLink} from 'react-router-dom'
import {Map} from 'immutable'

import SecondaryNavbar from '../../../../common/components/SecondaryNavbar/SecondaryNavbar'
import {IntegrationType} from '../../../../../models/integration/types'
import {PhoneFunction} from '../../../../../business/twilio'

type Props = {
    integration: Map<string, any>
}

export default function PhoneIntegrationNavigation({
    integration,
}: Props): JSX.Element {
    const integrationId: number = integration.get('id')
    const baseURL = `/app/settings/channels/${IntegrationType.Phone}/${integrationId}`

    const isIvr = integration.getIn(['meta', 'function']) === PhoneFunction.Ivr

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
