import { useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

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
    onAuthorizeReturn?: () => void | Promise<void>
}

export default function InboundConnectionCard({
    appId,
    appTitle,
    connectUrl,
    isConnected,
    isDisconnectDisabled,
    alloyIntegrationId,
    onDisconnected,
    onAuthorizeReturn,
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
                    onAuthorizeReturn={onAuthorizeReturn}
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
    onAuthorizeReturn,
}: InboundConnectionCardProps) {
    const [isPollingForAuth, setIsPollingForAuth] = useState(false)

    useEffect(() => {
        if (isConnected && isPollingForAuth) {
            setIsPollingForAuth(false)
        }
    }, [isConnected, isPollingForAuth])

    useEffect(() => {
        if (!isPollingForAuth || !onAuthorizeReturn) return
        const intervalId = setInterval(() => {
            void onAuthorizeReturn()
        }, Duration.seconds(3))
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId)
            setIsPollingForAuth(false)
        }, Duration.minutes(5))
        return () => {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
        }
    }, [isPollingForAuth, onAuthorizeReturn])

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
        <ConnectLink
            connectUrl={connectUrl}
            isApp
            integrationTitle={appTitle}
            onClick={() => setIsPollingForAuth(true)}
        >
            <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsPollingForAuth(true)}
            >
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
            toast.success(`Access to ${appTitle} has been revoked.`)
            await onDisconnected?.()
        } catch {
            toast.error(
                `Sorry, something went wrong. Access to ${appTitle} was not revoked.`,
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
            Revoke
        </Button>
    )

    return (
        <>
            {isDisconnectDisabled ? (
                <Tooltip placement="top" trigger={disconnectButton}>
                    <TooltipContent title="Access cannot be revoked while accounts are still integrated with Gorgias. Please disconnect all integrated accounts first." />
                </Tooltip>
            ) : (
                disconnectButton
            )}
            <Modal isOpen={isModalOpen} onOpenChange={setModalOpen} size="sm">
                <Box flexDirection="column" gap="md">
                    <OverlayHeader title={`Revoke access for ${appTitle}?`} />
                    <Text>
                        Revoking access removes {appTitle}&apos;s permission to
                        send or receive your Gorgias data.
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
                            {isLoading ? 'Revoking' : 'Revoke'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}
