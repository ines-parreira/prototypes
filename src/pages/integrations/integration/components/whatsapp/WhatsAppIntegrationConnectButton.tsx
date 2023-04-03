import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import history from 'pages/history'

type Props = {
    isHorizontal?: boolean
}

export default function WhatsAppIntegrationConnectButton({
    isHorizontal,
}: Props) {
    const enableMigration = useFlags()[FeatureFlagKey.EnableWhatsAppMigrations]

    return (
        <>
            <Button
                onClick={() => {
                    window.open(
                        window.GORGIAS_STATE.integrations.authentication
                            .whatsapp?.redirect_uri ?? ''
                    )
                }}
            >
                Connect WhatsApp Business
            </Button>
            {enableMigration && (
                <Button
                    className={isHorizontal ? 'ml-3' : 'mt-2'}
                    fillStyle={isHorizontal ? 'fill' : 'ghost'}
                    onClick={() =>
                        history.push(
                            `/app/settings/integrations/whatsapp/migration`
                        )
                    }
                    intent="secondary"
                >
                    Migrate From Another Provider
                </Button>
            )}
        </>
    )
}
