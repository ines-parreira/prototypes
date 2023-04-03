import React from 'react'

import Button from 'pages/common/components/button/Button'
import AppDetails from 'pages/common/components/ProductDetail'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import ConnectLink from 'pages/integrations/components/ConnectLink'

export default function VoiceIntegrationDetails(): JSX.Element | null {
    const config = getIntegrationConfig(IntegrationType.Phone)

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
                        connectUrl={'/app/settings/channels/phone/new'}
                        integrationTitle={IntegrationType.Phone}
                    >
                        <Button>Add Voice</Button>
                    </ConnectLink>
                ),
            }}
        />
    )
}
