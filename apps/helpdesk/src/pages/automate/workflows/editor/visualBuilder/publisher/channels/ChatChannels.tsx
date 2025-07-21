import React, { useCallback, useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { ChatApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { WorkflowConfiguration } from 'pages/automate/workflows/models/workflowConfiguration.types'

import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    channel,
    onlySupportedChannels,
    configuration,
    isLoading,
    applicationAutomationSettings,
    handleChatApplicationAutomationSettingsUpdate,
}: {
    appId: string
    channel: SelfServiceChatChannel
    onlySupportedChannels: SelfServiceChannelType[]
    configuration: WorkflowConfiguration
    isLoading: boolean
    applicationAutomationSettings: ChatApplicationAutomationSettings
    handleChatApplicationAutomationSettingsUpdate: (
        chatApplicationAutomationSettings: ChatApplicationAutomationSettings,
    ) => Promise<void>
}) => {
    const { entrypoints } = useMemo(() => {
        if (!applicationAutomationSettings) {
            return {
                entrypoints: [],
            }
        }
        return {
            entrypoints:
                applicationAutomationSettings.workflows.entrypoints || [],
        }
    }, [applicationAutomationSettings])

    const handleChatUpdate = useCallback(
        // TODO(React18): Find a solution to casting to any once we upgrade to React 18 types
        async (workflows: any) => {
            await handleChatApplicationAutomationSettingsUpdate({
                ...applicationAutomationSettings,
                workflows: {
                    ...applicationAutomationSettings?.workflows,
                    entrypoints: workflows,
                },
            })
        },
        [
            applicationAutomationSettings,
            handleChatApplicationAutomationSettingsUpdate,
        ],
    )

    return (
        <ChannelToggle
            configuration={configuration}
            channel={channel}
            isLoading={isLoading}
            workflows={entrypoints}
            handleAutomationSettingUpdate={handleChatUpdate}
            onlySupportedChannels={onlySupportedChannels}
        />
    )
}

const ChatChannels = ({
    chatChannels,
    configuration,
}: {
    configuration: WorkflowConfiguration
    chatChannels: SelfServiceChatChannel[]
}) => {
    const onlySupportedChannels = useOnlySupportedChannels(
        configuration,
        TicketChannel.Chat,
    )
    const appIds = useMemo(() => {
        return chatChannels.map((channel) => channel.value.meta.app_id!)
    }, [chatChannels])
    const {
        applicationsAutomationSettings,
        isUpdatePending,
        isFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appIds)
    return (
        <ChannelBlock channelType={TicketChannel.Chat}>
            {chatChannels
                .filter(
                    (
                        chat,
                    ): chat is SelfServiceChatChannel & {
                        value: { meta: { app_id: string } }
                    } => Boolean(chat.value.meta.app_id),
                )
                .map((channel) => (
                    <ChannelItem
                        applicationAutomationSettings={
                            applicationsAutomationSettings[
                                channel.value.meta.app_id
                            ]
                        }
                        handleChatApplicationAutomationSettingsUpdate={
                            handleChatApplicationAutomationSettingsUpdate
                        }
                        isLoading={isUpdatePending || isFetchPending}
                        key={channel.value.id}
                        channel={channel}
                        appId={channel.value.meta.app_id}
                        onlySupportedChannels={onlySupportedChannels}
                        configuration={configuration}
                    />
                ))}
        </ChannelBlock>
    )
}
export default ChatChannels
