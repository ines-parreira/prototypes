import React, {useCallback, useMemo} from 'react'
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
import Spinner from 'pages/common/components/Spinner'
import {SegmentEvent, logEvent} from 'common/segment'
import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import {FlowsSettings} from './FlowsSettings'
import css from './ConnectedChannelsChatView.less'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'
import {FeatureSettings} from './FeatureSettings'

export const ConnectedChannelsChatView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
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

    const {
        applicationsAutomationSettings,
        isFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(
        chatChannels
            .map((c) => c.value.meta?.app_id)
            .filter((c): c is string => !!c)
    )

    // check if one of the id in the chatChannels in the automationSettings

    const automationExistsInChannel = chatChannels.some((chat) => {
        if (!applicationsAutomationSettings) return false
        if (
            chat.value.meta?.app_id &&
            chat.value.meta.app_id in applicationsAutomationSettings
        ) {
            return true
        }
        return false
    })

    const isLoading =
        !selfServiceConfiguration ||
        isSelfServiceConfigurationFetchPending ||
        isFetchPending ||
        !automationExistsInChannel

    const updateSettings = useCallback(
        (key: 'articleRecommendation' | 'orderManagement' | 'quickResponses') =>
            (value: boolean) => {
                if (!selectedChannel) return

                const applicationAutomationSettings =
                    applicationsAutomationSettings[selectedChannel]

                if (!applicationAutomationSettings) return

                void handleChatApplicationAutomationSettingsUpdate({
                    ...applicationsAutomationSettings[selectedChannel],
                    [key]: {enabled: value},
                })
            },
        [
            applicationsAutomationSettings,
            selectedChannel,
            handleChatApplicationAutomationSettingsUpdate,
        ]
    )

    const automationSettingsWorkflows = useMemo(() => {
        if (!selectedChannel) return []

        return (
            applicationsAutomationSettings?.[selectedChannel]?.workflows
                ?.entrypoints ?? []
        )
    }, [applicationsAutomationSettings, selectedChannel])

    const isQuickResponsesEnabled = useMemo(() => {
        if (!selectedChannel) return false

        return (
            applicationsAutomationSettings?.[selectedChannel]?.quickResponses
                .enabled ?? false
        )
    }, [applicationsAutomationSettings, selectedChannel])

    const isOrderManagementEnabled = useMemo(() => {
        if (!selectedChannel) return false

        return (
            applicationsAutomationSettings?.[selectedChannel]?.orderManagement
                .enabled ?? false
        )
    }, [applicationsAutomationSettings, selectedChannel])

    const isArticleRecommendationEnabled = useMemo(() => {
        if (!selectedChannel) return false

        return (
            applicationsAutomationSettings?.[selectedChannel]
                ?.articleRecommendation.enabled ?? false
        )
    }, [applicationsAutomationSettings, selectedChannel])

    if (chatChannels.length === 0) return null

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <Spinner color="dark" className={css.spinner} />
            </div>
        )
    }

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                <CurrentlyViewingDropdown
                    onConnect={noop}
                    channelType="chat"
                    channels={chatChannels}
                    value={selectedChannel ?? ''}
                    label={currentChannel.value.name}
                    onSelectedChannelChange={(value) =>
                        setSelectedChannel(String(value))
                    }
                    renderOption={(channel) => ({
                        label: channel.value.name,
                        value: channel.value.meta.app_id ?? channel.value.name,
                    })}
                />
                <FlowsSettings
                    channelType="chat"
                    shopType={shopType}
                    shopName={shopName}
                    workflowEntrypoints={
                        selfServiceConfiguration?.workflowsEntrypoints
                    }
                    primaryLanguage={getPrimaryLanguageFromChatConfig(
                        currentChannel.value.meta
                    )}
                    configurations={workflowConfigurations ?? []}
                    automationSettingsWorkflows={automationSettingsWorkflows}
                    onChange={(nextEntrypoints) => {
                        logEvent(
                            SegmentEvent.AutomateChannelUpdateFromChannels,
                            {
                                page: 'Channels',
                            }
                        )
                        const applicationAutomationSettings =
                            applicationsAutomationSettings?.[selectedChannel!]

                        void handleChatApplicationAutomationSettingsUpdate({
                            ...applicationAutomationSettings,
                            workflows: {
                                ...applicationAutomationSettings.workflows,
                                entrypoints: nextEntrypoints,
                            },
                        })
                    }}
                />

                <FeatureSettings
                    title="Quick Responses"
                    label="Enable Quick Responses"
                    labelSubtitle="Display up to 6 Flows or Quick Responses on your Chat to proactively resolve top customer requests."
                    enabled={isQuickResponsesEnabled}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/flows/quick-responses`}
                    onToggle={updateSettings('quickResponses')}
                />

                <FeatureSettings
                    title="Order Management"
                    label="Enable Order Management"
                    labelSubtitle="Allow customers to track and manage their orders directly within your Chat."
                    enabled={isOrderManagementEnabled}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/order-management`}
                    onToggle={updateSettings('orderManagement')}
                />

                <FeatureSettings
                    title="Article Recommendation"
                    label="Enable Article Recommendation"
                    subtitle="Requires an active Help Center with published articles"
                    labelSubtitle="Automatically send Help Center articles in response to customer questions in Chat, if a relevant article exists. If a customer requests more help, a ticket will be created for an agent to handle."
                    enabled={isArticleRecommendationEnabled}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                    onToggle={updateSettings('articleRecommendation')}
                />
            </div>

            {selfServiceConfiguration && (
                <ConnectedChannelsPreview
                    channel={currentChannel}
                    selfServiceConfiguration={selfServiceConfiguration}
                    storeIntegration={storeIntegration}
                />
            )}
        </div>
    )
}
