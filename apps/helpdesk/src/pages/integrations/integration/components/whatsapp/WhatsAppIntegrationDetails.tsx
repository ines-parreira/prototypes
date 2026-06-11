import { IntegrationType } from 'models/integration/constants'
import { Detail as AppDetails } from 'pages/common/components/ProductDetail'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

import { WhatsAppIntegrationConnectButton } from './WhatsAppIntegrationConnectButton'

export function WhatsAppIntegrationDetails(): JSX.Element | null {
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
