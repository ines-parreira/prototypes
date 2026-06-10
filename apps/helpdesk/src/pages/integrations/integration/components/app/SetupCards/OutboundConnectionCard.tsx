import { useRef } from 'react'

import { useTrackstarLink } from '@trackstar/react-trackstar-link'

import { Button } from '@gorgias/axiom'
import { useLinkTrackstar } from '@gorgias/workflows-queries'

import type { OutboundAuth } from 'models/integration/types/app'

import SetupCard from './SetupCard'

type OutboundConnectionCardProps = {
    appTitle: string
    outboundAuth: OutboundAuth
    isSubmitting: boolean
    onOpenAuthModal: () => void
    onTrackstarAuthCode: (authCode: string) => void | Promise<void>
}

export default function OutboundConnectionCard({
    appTitle,
    outboundAuth,
    isSubmitting,
    onOpenAuthModal,
    onTrackstarAuthCode,
}: OutboundConnectionCardProps) {
    const isTrackstarConnect =
        outboundAuth.vendor === 'trackstar' &&
        !!outboundAuth.trackstar_integration_name

    const action = isTrackstarConnect ? (
        <TrackstarConnectButton
            integrationName={outboundAuth.trackstar_integration_name!}
            isSubmitting={isSubmitting}
            onAuthCode={onTrackstarAuthCode}
        />
    ) : (
        <Button size="sm" onClick={onOpenAuthModal}>
            Connect
        </Button>
    )

    return (
        <SetupCard
            title={`Let Gorgias take action in ${appTitle}`}
            description={`Gorgias can do things in ${appTitle} on your behalf — like fetching fulfillment information, or canceling orders.`}
            action={action}
        />
    )
}

type TrackstarConnectButtonProps = {
    integrationName: string
    isSubmitting: boolean
    onAuthCode: (authCode: string) => void | Promise<void>
}

function TrackstarConnectButton({
    integrationName,
    isSubmitting,
    onAuthCode,
}: TrackstarConnectButtonProps) {
    const { mutateAsync: createLink } = useLinkTrackstar()
    const pendingAuthCodeRef = useRef<string | null>(null)
    const { open } = useTrackstarLink({
        integrationAllowList: [integrationName],
        onSuccess: (authCode: string) => {
            pendingAuthCodeRef.current = authCode
        },
        onClose: () => {
            const authCode = pendingAuthCodeRef.current
            if (!authCode) return
            pendingAuthCodeRef.current = null
            void onAuthCode(authCode)
        },
        getLinkToken: async () => {
            const res = await createLink({ connectionId: '' })
            return res.data.link_token
        },
    })
    return (
        <Button
            size="sm"
            onClick={() => open({})}
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
        >
            Connect
        </Button>
    )
}
