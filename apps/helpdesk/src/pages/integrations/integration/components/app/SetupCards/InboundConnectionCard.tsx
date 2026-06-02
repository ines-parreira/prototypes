import { useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    Box,
    Button,
    Modal,
    OverlayHeader,
    Text,
    toast,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { disconnectApp } from 'models/integration/resources'
import AlloyConnectButton from 'pages/integrations/components/AlloyConnectButton'
import ConnectLink from 'pages/integrations/components/ConnectLink'

import SetupCard from './SetupCard'

type InboundConnectionCardProps = {
    appId: string
    appTitle: string
    connectUrl: string
    isConnected: boolean
    isDisconnectDisabled: boolean
    alloyIntegrationId?: string
    onDisconnected?: () => void | Promise<void>
}

export default function InboundConnectionCard({
    appId,
    appTitle,
    connectUrl,
    isConnected,
    isDisconnectDisabled,
    alloyIntegrationId,
    onDisconnected,
}: InboundConnectionCardProps) {
    return (
        <SetupCard
            title={`Let ${appTitle} read your Gorgias data`}
            description={`${appTitle} can pull in your Gorgias tickets, users, reports, and views to use inside its own app.`}
            action={
                <InboundAction
                    appId={appId}
                    appTitle={appTitle}
                    connectUrl={connectUrl}
                    isConnected={isConnected}
                    isDisconnectDisabled={isDisconnectDisabled}
                    alloyIntegrationId={alloyIntegrationId}
                    onDisconnected={onDisconnected}
                />
            }
        />
    )
}

function InboundAction({
    appId,
    appTitle,
    connectUrl,
    isConnected,
    isDisconnectDisabled,
    alloyIntegrationId,
    onDisconnected,
}: InboundConnectionCardProps) {
    if (alloyIntegrationId) {
        return (
            <AlloyConnectButton
                appId={appId}
                integrationId={alloyIntegrationId}
                name={appTitle}
            />
        )
    }

    if (isConnected) {
        return (
            <DisconnectAction
                appId={appId}
                appTitle={appTitle}
                isDisconnectDisabled={isDisconnectDisabled}
                onDisconnected={onDisconnected}
            />
        )
    }

    return (
        <ConnectLink connectUrl={connectUrl} isApp integrationTitle={appTitle}>
            <Button size="sm" variant="secondary">
                Authorize
            </Button>
        </ConnectLink>
    )
}

type DisconnectActionProps = {
    appId: string
    appTitle: string
    isDisconnectDisabled: boolean
    onDisconnected?: () => void | Promise<void>
}

function DisconnectAction({
    appId,
    appTitle,
    isDisconnectDisabled,
    onDisconnected,
}: DisconnectActionProps) {
    const [isLoading, setLoading] = useState(false)
    const [isModalOpen, setModalOpen] = useState(false)

    const handleAppDisconnection = async () => {
        logEvent(SegmentEvent.IntegrationDisconnectClicked, {
            integration: appTitle.toLowerCase(),
            is_openchannel_app: true,
        })
        setLoading(true)
        try {
            const isUninstalled = await disconnectApp(appId)
            if (!isUninstalled) {
                throw new Error(`Not disconnected`)
            }
            toast.success(`${appTitle} has been disconnected.`)
            await onDisconnected?.()
        } catch {
            toast.error(
                `Sorry, something went wrong. ${appTitle} is still connected.`,
            )
        } finally {
            setModalOpen(false)
            setLoading(false)
        }
    }

    const disconnectButton = (
        <Button
            size="sm"
            intent="destructive"
            variant="secondary"
            isDisabled={isDisconnectDisabled}
            onClick={() => setModalOpen(true)}
        >
            Disconnect
        </Button>
    )

    return (
        <>
            {isDisconnectDisabled ? (
                <Tooltip placement="top" trigger={disconnectButton}>
                    <TooltipContent title="App cannot be disconnected while accounts are still integrated with Gorgias. Please disconnect all integrated accounts before disconnecting the app." />
                </Tooltip>
            ) : (
                disconnectButton
            )}
            <Modal isOpen={isModalOpen} onOpenChange={setModalOpen} size="sm">
                <Box flexDirection="column" gap="md">
                    <OverlayHeader title={`Disconnect ${appTitle}?`} />
                    <Text>
                        Disconnecting the app revokes its permission to send or
                        receive your Gorgias data.
                    </Text>
                    <Box justifyContent="flex-end" gap="sm">
                        <Button
                            variant="secondary"
                            isDisabled={isLoading}
                            onClick={() => setModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent="destructive"
                            isLoading={isLoading}
                            onClick={handleAppDisconnection}
                        >
                            {isLoading ? 'Disconnecting' : 'Disconnect'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}
