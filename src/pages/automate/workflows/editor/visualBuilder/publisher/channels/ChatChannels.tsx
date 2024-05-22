import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import {TicketChannel} from 'business/types/ticket'
import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {WorkflowConfiguration} from 'pages/automate/workflows/models/workflowConfiguration.types'
import ChannelBlock from '../helper/ChannelBlock'
import useOnlySupportedChannels from '../helper/useOnlySupportedChannels'
import ChannelToggle from './ChannelToggle'

const ChannelItem = ({
    appId,
    enabledQuickResponsesCount,
    channel,
    onlySupportedChannels,
    configuration,
}: {
    appId: string
    enabledQuickResponsesCount: number
    channel: SelfServiceChatChannel
    onlySupportedChannels: SelfServiceChannelType[]
    configuration: WorkflowConfiguration
}) => {
    const [appIds, setAppIds] = useState<string[]>([])
    useEffect(() => {
        setAppIds([appId])
    }, [appId])

    const {
        applicationsAutomationSettings,
        isUpdatePending,
        isFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(appIds)

    const {entrypoints, quickResponsesEnabled} = useMemo(() => {
        if (
            !applicationsAutomationSettings ||
            !applicationsAutomationSettings[appId]
        ) {
            return {
                entrypoints: [],
                quickResponsesEnabled: false,
            }
        }
        return {
            entrypoints:
                applicationsAutomationSettings[appId].workflows.entrypoints ||
                [],
            quickResponsesEnabled:
                applicationsAutomationSettings[appId].quickResponses.enabled,
        }
    }, [appId, applicationsAutomationSettings])

    const applicationAutomationSettings = applicationsAutomationSettings[appId]

    const handleUpdate = useCallback(
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
            isLoading={isUpdatePending || isFetchPending}
            workflows={entrypoints}
            handleAutomationSettingUpdate={handleUpdate}
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
