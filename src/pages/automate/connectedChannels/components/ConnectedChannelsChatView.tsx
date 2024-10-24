import classNames from 'classnames'
import {noop, startCase} from 'lodash'
import React, {useCallback, useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {TicketChannel} from 'business/types/ticket'
import {SegmentEvent, logEvent} from 'common/segment'
import {getPrimaryLanguageFromChatConfig} from 'config/integrations/gorgias_chat'
import {useGetHelpCenter} from 'models/helpCenter/queries'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {AutomateFeatures} from 'pages/automate/common/types'
import Spinner from 'pages/common/components/Spinner'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import css from './ConnectedChannelsChatView.less'
import {ConnectedChannelsEmptyView} from './ConnectedChannelsEmptyView'
import {CurrentlyViewingDropdown} from './CurrentlyViewingDropdown'
import {FeatureSettings} from './FeatureSettings'
import {FlowsSettings} from './FlowsSettings'

interface Props {
    channelId?: string
    shopName?: string
    shopType?: string
    hideDropdown?: boolean
}

export const ConnectedChannelsChatView = ({
    channelId,
    shopName: extShopName,
    shopType: extShopType,
    hideDropdown,
}: Props) => {
    const {shopType: shopTypeParam, shopName: shopNameParam} = useParams<{
        shopType: string
        shopName: string
    }>()

    const shopName = extShopName ?? shopNameParam
    const shopType = extShopType ?? shopTypeParam
    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const {data: workflowConfigurations = []} = useGetWorkflowConfigurations()

    const {data: helpCenterData, isError: helpCenterIsError} = useGetHelpCenter(
        selfServiceConfiguration?.articleRecommendationHelpCenterId ?? 0,
        {},
        {
            enabled:
                !!selfServiceConfiguration?.articleRecommendationHelpCenterId,
            retry: 1,
        }
    )

    const isHelpCenterSelfServiceDeleted =
        !!helpCenterData?.deleted_datetime ||
        helpCenterIsError ||
        !selfServiceConfiguration?.articleRecommendationHelpCenterId

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(() => {
        return channels.filter(
            (channel): channel is SelfServiceChatChannel =>
                channel.type === TicketChannel.Chat
        )
    }, [channels])

    const [selectedChannel, setSelectedChannel] = React.useState<string | null>(
        () => channelId ?? chatChannels[0]?.value.meta.app_id ?? null
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
        (key: 'articleRecommendation' | 'orderManagement') =>
            (value: boolean) => {
                if (!selectedChannel) return

                const applicationAutomationSettings =
                    applicationsAutomationSettings[selectedChannel]

                if (!applicationAutomationSettings) return

                const readableKey = startCase(key)
                void handleChatApplicationAutomationSettingsUpdate(
                    {
                        ...applicationsAutomationSettings[selectedChannel],
                        [key]: {enabled: value},
                    },
                    `${readableKey} ${value ? 'enabled' : 'disabled'}`
                )
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

    if (chatChannels.length === 0)
        return (
            <ConnectedChannelsEmptyView view={AutomateFeatures.AutomateChat} />
        )

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <Spinner color="dark" size="big" />
            </div>
        )
    }

    return (
        <div className={classNames('full-width', css.container)}>
            <div className={css.settingsContainer}>
                {!hideDropdown && (
                    <CurrentlyViewingDropdown
                        onConnect={noop}
                        channelType="chat"
                        channels={chatChannels}
                        value={selectedChannel ?? ''}
                        appId={currentChannel.value.id}
                        label={currentChannel.value.name}
                        onSelectedChannelChange={(value) =>
                            setSelectedChannel(String(value))
                        }
                        renderOption={(channel) => ({
                            label: channel.value.name,
                            value:
                                channel.value.meta.app_id ?? channel.value.name,
                        })}
                    />
                )}
                <FlowsSettings
                    channelType="chat"
                    channel={currentChannel}
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
                    onChange={(nextEntrypoints, action) => {
                        const readableAction =
                            action === 'add'
                                ? 'added'
                                : action === 'remove'
                                  ? 'removed'
                                  : 'order updated'
                        logEvent(
                            SegmentEvent.AutomateChannelUpdateFromChannels,
                            {
                                page: 'Channels',
                            }
                        )
                        const applicationAutomationSettings =
                            applicationsAutomationSettings?.[selectedChannel!]

                        void handleChatApplicationAutomationSettingsUpdate(
                            {
                                ...applicationAutomationSettings,
                                workflows: {
                                    ...applicationAutomationSettings.workflows,
                                    entrypoints: nextEntrypoints,
                                },
                            },
                            `${
                                action === 'reorder' ? 'Flows' : 'Flow'
                            } ${readableAction}`
                        )
                    }}
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
                    disabled={isHelpCenterSelfServiceDeleted}
                    externalLinkUrl={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                    showConfigurationRequiredAlert={
                        isHelpCenterSelfServiceDeleted
                    }
                    onToggle={updateSettings('articleRecommendation')}
                />
            </div>

            {selfServiceConfiguration && (
                <ConnectedChannelsPreview
                    channel={currentChannel}
                    selfServiceConfiguration={selfServiceConfiguration}
                    storeIntegration={storeIntegration}
                    contentContainerClassName={css.previewContentContainer}
                />
            )}
        </div>
    )
}
