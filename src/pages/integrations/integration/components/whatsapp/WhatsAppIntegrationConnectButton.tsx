import React from 'react'

import Button from 'pages/common/components/button/Button'
import history from 'pages/history'

type Props = {
    isHorizontal?: boolean
}

export default function WhatsAppIntegrationConnectButton({
    isHorizontal,
}: Props) {
    return isHorizontal ? (
        <>
            <MigrateButton isHorizontal />
            <ConnectButton />
        </>
    ) : (
        <>
            <ConnectButton />
            <MigrateButton />
        </>
    )
}

function ConnectButton() {
    return (
        <Button
            onClick={() => {
                window.open(
                    window.GORGIAS_STATE.integrations.authentication.whatsapp
                        ?.redirect_uri ?? '',
                )
            }}
        >
            Connect WhatsApp Business
        </Button>
    )
}

function MigrateButton({ isHorizontal }: Props) {
    return (
        <Button
            className={isHorizontal ? 'mr-3' : 'mt-2'}
            fillStyle={isHorizontal ? 'fill' : 'ghost'}
            onClick={() =>
                history.push(`/app/settings/integrations/whatsapp/migration`)
            }
            intent="secondary"
        >
            Migrate From Another Provider
        </Button>
    )
}
