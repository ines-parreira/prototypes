import React from 'react'
import {useHistory} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import AppDetails from 'pages/common/components/ProductDetail'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import Button from 'pages/common/components/button/Button'

import {getIntegrationConfig} from 'state/integrations/helpers'
import {IntegrationType} from 'models/integration/constants'
import {FeatureFlagKey} from 'config/featureFlags'

export default function WhatsAppIntegrationDetails(): JSX.Element | null {
    const history = useHistory()
    const config = getIntegrationConfig(IntegrationType.WhatsApp)
    const enableMigration = useFlags()[FeatureFlagKey.EnableWhatsAppMigrations]

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
                    <>
                        <ConnectLink
                            connectUrl={
                                window.GORGIAS_STATE.integrations.authentication
                                    .whatsapp?.redirect_uri ?? ''
                            }
                            integrationTitle={IntegrationType.WhatsApp}
                            isExternal
                        >
                            <Button>Connect WhatsApp Business</Button>
                        </ConnectLink>
                        {enableMigration && (
                            <Button
                                className="mt-2"
                                fillStyle="ghost"
                                onClick={() =>
                                    history.push(
                                        `/app/settings/integrations/whatsapp/migration`
                                    )
                                }
                            >
                                Migrate WhatsApp from another provider
                            </Button>
                        )}
                    </>
                ),
            }}
        />
    )
}
