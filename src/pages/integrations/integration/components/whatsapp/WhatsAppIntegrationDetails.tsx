import React from 'react'

import { IntegrationType } from 'models/integration/constants'
import AppDetails from 'pages/common/components/ProductDetail'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

import WhatsAppIntegrationConnectButton from './WhatsAppIntegrationConnectButton'

export default function WhatsAppIntegrationDetails(): JSX.Element | null {
    const config = getIntegrationConfig(IntegrationType.WhatsApp)

    if (!config) {
        return null
    }

    const detailProps = mapAppToDetail(config)

    return (
        <AppDetails
            {...detailProps}
            infocard={{
                ...detailProps.infocard,
                CTA: <WhatsAppIntegrationConnectButton />,
            }}
        />
    )
}
