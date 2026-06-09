import React, { useCallback, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import {
    Link as AxiomLink,
    LegacyLoadingSpinner as LoadingSpinner,
    Text,
} from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { ChannelToggle } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/ChannelToggle'
import type { InstallationStatusInjectedChatItem } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'

import { useFetchChatIntegrationsStatusData } from '../../hooks/pendingTasks/useFetchChatIntegrationsStatusData'
import { decideChatWarning } from '../PostOnboardingTasksSection/utils'

import css from './ChatToggle.less'

type ChatToggleProps = {
    isChatChannelEnabled: boolean
    isLoading: boolean
    isReadOnly?: boolean
    isTrialGated?: boolean
    storeConfiguration?: StoreConfiguration
    shopName: string
    shopType: string
    label?: string

    setIsChatChannelEnabled: (value: boolean) => void
    onChatToggle: (storeConfiguration: StoreConfiguration) => void
    onStartTrial?: () => void
}

export const ChatToggle = ({
    isChatChannelEnabled,
    isLoading,
    isReadOnly = false,
    isTrialGated = false,
    shopName,
    shopType,
    storeConfiguration,
    setIsChatChannelEnabled,
    onChatToggle,
    onStartTrial,
    label = 'Chat',
}: ChatToggleProps) => {
    const { routes } = useAiAgentNavigation({ shopName })
    const history = useHistory()
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

    const chatWarningDecision = useMemo(
        () =>
            decideChatWarning(
                chatChannelsWithAvailableFlag,
                storeConfiguration?.monitoredChatIntegrations?.map((id) =>
                    id.toString(),
                ),
                { deployChat: routes.deployChat },
            ),
        [
            chatChannelsWithAvailableFlag,
            routes.deployChat,
            storeConfiguration?.monitoredChatIntegrations,
        ],
    )

    const renderChatWarning = useCallback(() => {
        const action = chatWarningDecision.visible ? (
            <div className={css.customToggleWarning}>
                <Text size="sm" variant="regular">
                    <AxiomLink
                        size="sm"
                        onClick={() => history.push(chatWarningDecision.to)}
                    >
                        {chatWarningDecision.label}
                    </AxiomLink>{' '}
                    to enable the AI Agent
                </Text>
            </div>
        ) : null

        return {
            visible: chatWarningDecision.visible,
            hint: '',
            action,
        }
    }, [history, chatWarningDecision])

    const isChatChannelDisabled = chatWarningDecision.visible

    const handleChatToggle = () => {
        if (!storeConfiguration) return

        if (isTrialGated) {
            onStartTrial?.()
            return
        }

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
