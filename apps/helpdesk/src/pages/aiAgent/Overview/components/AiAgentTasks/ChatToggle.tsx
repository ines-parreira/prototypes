import React, { useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { LoadingSpinner, Text } from '@gorgias/axiom'

import { StoreConfiguration } from 'models/aiAgent/types'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import { InstallationStatusInjectedChatItem } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { useFetchChatIntegrationsStatusData } from '../../hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { decideChatWarning } from '../PostOnboardingTasksSection/utils'

import css from './ChatToggle.less'

type ChatToggleProps = {
    isChatChannelEnabled: boolean
    isLoading: boolean
    isReadOnly?: boolean
    storeConfiguration?: StoreConfiguration
    shopName: string
    shopType: string
    label?: string

    setIsChatChannelEnabled: (value: boolean) => void
    onChatToggle: (storeConfiguration: StoreConfiguration) => void
}

export const ChatToggle = ({
    isChatChannelEnabled,
    isLoading,
    isReadOnly = false,
    shopName,
    shopType,
    storeConfiguration,
    setIsChatChannelEnabled,
    onChatToggle,
    label = 'Chat',
}: ChatToggleProps) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const chatChannels: InstallationStatusInjectedChatItem[] =
        useSelfServiceChatChannels(shopType, shopName)

    const chatIds = useMemo(() => {
        return chatChannels.map((chat) => chat.value.id)
    }, [chatChannels])

    const {
        data: chatIntegrationStatus,
        isLoading: isChatIntegrationsStatusLoading,
    } = useFetchChatIntegrationsStatusData({
        enabled: !!chatIds.length,
        chatIds,
    })

    const chatChannelsWithAvailableFlag = useMemo(() => {
        const chatIntegrationStatusMap = Object.fromEntries(
            chatIntegrationStatus?.map((status) => [status.chatId, status]) ??
                [],
        )

        const availableChatsSet = new Set(
            chatChannels
                .filter(
                    (chat) =>
                        !!chatIntegrationStatusMap?.[chat.value.id]?.installed,
                )
                .map((chat) => chat.value.id),
        )
        chatChannels.forEach((chatChannel) => {
            const isAvailable = availableChatsSet.has(chatChannel.value.id)
            chatChannel.value.isUninstalled =
                !isAvailable && !isChatIntegrationsStatusLoading
        })

        return [...chatChannels]
    }, [chatChannels, chatIntegrationStatus, isChatIntegrationsStatusLoading])

    const renderChatWarning = useCallback(() => {
        const decision = decideChatWarning(
            chatChannelsWithAvailableFlag,
            storeConfiguration?.monitoredChatIntegrations?.map((id) =>
                id.toString(),
            ),
            { deployChat: routes.deployChat },
        )

        const action = decision.visible ? (
            <Link to={decision.to} className={css.customToggleWarning}>
                <Text size="sm" variant="regular">
                    <span className={css.chatAddress}>{decision.label}</span> to
                    enable the AI Agent
                </Text>
            </Link>
        ) : null

        return { visible: decision.visible, hint: '', action }
    }, [
        chatChannelsWithAvailableFlag,
        routes.deployChat,
        storeConfiguration?.monitoredChatIntegrations,
    ])

    const isChatChannelDisabled = useMemo(() => {
        const warnings = renderChatWarning()
        return warnings.visible
    }, [renderChatWarning])

    const handleChatToggle = () => {
        if (!storeConfiguration) return

        setIsChatChannelEnabled(true)
        onChatToggle({
            ...storeConfiguration,
            chatChannelDeactivatedDatetime: null,
        })
    }

    return (
        <div className={css.toggleContainer}>
            <ChannelToggle
                className={css.customToggle}
                color="var(--surface-inverted-default)"
                label={
                    <Text size="md" variant="regular">
                        {label}
                    </Text>
                }
                checked={isChatChannelEnabled}
                disabled={isChatChannelDisabled || isLoading || isReadOnly}
                onChange={handleChatToggle}
                warnings={[renderChatWarning()]}
                tooltip={{
                    visible: false,
                    content: '',
                }}
            />
            {isChatChannelEnabled && isLoading && (
                <LoadingSpinner size="small" />
            )}
        </div>
    )
}
