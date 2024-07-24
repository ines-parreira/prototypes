import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'
import classNames from 'classnames'
import {noop} from 'lodash'
import {TicketChannel} from 'business/types/ticket'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import {getPrimaryLanguageFromChatConfig} from 'config/integrations/gorgias_chat'
import {FlowsSettings} from './FlowsSettings'
import css from './ConnectedChannelsChatView.less'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'

export const ConnectedChannelsChatView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {selfServiceConfiguration} = useSelfServiceConfiguration(
        shopType,
        shopName
    )
    const {data: workflowConfigurations = []} = useGetWorkflowConfigurations()

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(() => {
        return channels.filter(
            (channel): channel is SelfServiceChatChannel =>
                channel.type === TicketChannel.Chat
        )
    }, [channels])

    const [selectedChannel, setSelectedChannel] = React.useState<string | null>(
        () => chatChannels[0]?.value.meta.app_id ?? null
    )

    const currentChannel =
        chatChannels.find(
            (channel) => channel.value.meta.app_id === selectedChannel
        ) ?? chatChannels[0]

    const {applicationsAutomationSettings} = useApplicationsAutomationSettings([
        selectedChannel ?? '',
    ])

    const automationSettingsWorkflows = useMemo(() => {
        if (!selectedChannel) return []

        return (
            applicationsAutomationSettings?.[selectedChannel]?.workflows
                ?.entrypoints ?? []
        )
    }, [applicationsAutomationSettings, selectedChannel])

    if (chatChannels.length === 0) return null

    return (
        <div className={classNames('full-width', css.container)}>
            <CurrentlyViewingDropdown
                onConnect={noop}
                channelType="chat"
                channels={chatChannels}
                value={selectedChannel ?? ''}
                label={currentChannel.value.name}
                onSelectedChannelChange={setSelectedChannel}
                renderOption={(channel) => ({
                    label: channel.value.name,
                    value: channel.value.meta.app_id ?? channel.value.name,
                })}
            />
            <FlowsSettings
                workflowEntrypoints={
                    selfServiceConfiguration?.workflowsEntrypoints
                }
                primaryLanguage={getPrimaryLanguageFromChatConfig(
                    currentChannel.value.meta
                )}
                configurations={workflowConfigurations ?? []}
                automationSettingsWorkflows={automationSettingsWorkflows}
            />
        </div>
    )
}
