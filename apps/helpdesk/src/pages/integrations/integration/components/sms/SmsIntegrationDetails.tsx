import { Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import { Detail as AppDetails } from 'pages/common/components/ProductDetail'
import { ConnectLink } from 'pages/integrations/components/ConnectLink'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

export function SmsIntegrationDetails(): JSX.Element | null {
    const config = getIntegrationConfig(IntegrationType.Sms)

    if (!config) {
        return null
    }

    const detailProps = mapAppToDetail(config)

    return (
        <AppDetails
            {...detailProps}
            infocard={{
                ...detailProps.infocard,
                CTA: (
                    <ConnectLink
                        connectUrl={'/app/settings/channels/sms/new'}
                        integrationTitle={IntegrationType.Sms}
                    >
                        <Button>Add SMS</Button>
                    </ConnectLink>
                ),
            }}
        />
    )
}
