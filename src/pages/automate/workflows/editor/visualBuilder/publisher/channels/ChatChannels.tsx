import React, {useCallback, useMemo} from 'react'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import {TicketChannel} from 'business/types/ticket'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {ChatApplicationAutomationSettings} from 'models/chatApplicationAutomationSettings/types'
import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    enabledQuickResponsesCount,
    channel,
    onlySupportedChannels,
    configuration,
    isLoading,
    applicationAutomationSettings,
    handleChatApplicationAutomationSettingsUpdate,
}: {
    appId: string
    enabledQuickResponsesCount: number
    channel: SelfServiceChatChannel
    onlySupportedChannels: SelfServiceChannelType[]
    configuration: WorkflowConfiguration
    isLoading: boolean
    applicationAutomationSettings: ChatApplicationAutomationSettings
    handleChatApplicationAutomationSettingsUpdate: (
        chatApplicationAutomationSettings: ChatApplicationAutomationSettings
    ) => Promise<void>
}) => {
    const {entrypoints, quickResponsesEnabled} = useMemo(() => {
        if (!applicationAutomationSettings) {
            return {
                entrypoints: [],
                quickResponsesEnabled: false,
            }
        }
        return {
            entrypoints:
                applicationAutomationSettings.workflows.entrypoints || [],
            quickResponsesEnabled:
                applicationAutomationSettings.quickResponses.enabled,
        }
    }, [applicationAutomationSettings])

    const handleChatUpdate = useCallback(
        async (workflows) => {
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
        ]
    )

    return (
        <ChannelToggle
            configuration={configuration}
            channel={channel}
            isLoading={isLoading}
            workflows={entrypoints}
            handleAutomationSettingUpdate={handleChatUpdate}
            enabledQuickResponsesCount={enabledQuickResponsesCount}
            isQuickResponseEnabled={quickResponsesEnabled}
            onlySupportedChannels={onlySupportedChannels}
        />
    )
}

const ChatChannels = ({
    enabledQuickResponsesCount,
    chatChannels,
    configuration,
}: {
    configuration: WorkflowConfiguration
    enabledQuickResponsesCount: number
    chatChannels: SelfServiceChatChannel[]
}) => {
    const onlySupportedChannels = useOnlySupportedChannels(
        configuration,
        TicketChannel.Chat
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
                        chat
                    ): chat is SelfServiceChatChannel & {
                        value: {meta: {app_id: string}}
                    } => Boolean(chat.value.meta.app_id)
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
                        enabledQuickResponsesCount={enabledQuickResponsesCount}
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
