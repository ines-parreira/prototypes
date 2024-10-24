import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {formatPhoneNumberInternational} from 'pages/phoneNumbers/utils'
import {getIntegrationById} from 'state/integrations/selectors'

type Props = {
    integrationId: number
    phoneNumber?: string
}

function VoiceIntegrationBasicLabel({integrationId, phoneNumber}: Props) {
    const integration = useAppSelector(getIntegrationById(integrationId))
    const formattedPhoneNumber = formatPhoneNumberInternational(phoneNumber)
    const integrationName = integration?.get('name')

    if (!integrationName) {
        return <>{formattedPhoneNumber || 'Unknown integration'}</>
    }
    return <>{integrationName}</>
}

export default VoiceIntegrationBasicLabel
