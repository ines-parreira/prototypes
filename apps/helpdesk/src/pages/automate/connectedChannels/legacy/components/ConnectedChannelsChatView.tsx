import React, { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import type { Map } from 'immutable'
import { noop, startCase } from 'lodash'
import { useHistory, useLocation, useParams } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import { useSearchParam } from 'hooks/useSearchParam'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import { IntegrationType } from 'models/integration/constants'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import useSelfServiceChannels from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { AutomateFeatures } from 'pages/automate/common/types'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import useShouldShowChatSettingsRevamp from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import ConnectedChannelsPreview from '../ConnectedChannelsPreview'
import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'
import { CurrentlyViewingDropdown } from './CurrentlyViewingDropdown'
import { FeatureSettings } from './FeatureSettings'
import { FlowsSettings } from './FlowsSettings'

import css from './ConnectedChannelsChatView.less'

interface Props {
    channelId?: string
    shopName?: string
    shopType?: string
    hideDropdown?: boolean
    integration?: Map<any, any>
}

export const ConnectedChannelsChatView = ({
    channelId,
    shopName: extShopName,
    shopType: extShopType,
    hideDropdown,
    integration,
}: Props) => {
    const { shopType: shopTypeParam, shopName: shopNameParam } = useParams<{
        shopType: string
        shopName: string
    }>()
    const isAutomateSettings = useIsAutomateSettings()
    const history = useHistory()
    const location = useLocation()
    const [channelIdParam] = useSearchParam('channel-id')
    const shopName = extShopName ?? shopNameParam
    const shopType = extShopType ?? shopTypeParam
    const {
        selfServiceConfiguration,
        storeIntegration,
        isFetchPending: isSelfServiceConfigurationFetchPending,
    } = useSelfServiceConfiguration(shopType, shopName)
    const { data: workflowConfigurations = [] } = useGetWorkflowConfigurations()

    const { data: helpCenterData, isError: helpCenterIsError } =
        useGetHelpCenter(
            selfServiceConfiguration?.articleRecommendationHelpCenterId ?? 0,
            {},
            {
                enabled:
                    !!selfServiceConfiguration?.articleRecommendationHelpCenterId,
                retry: 1,
            },
        )

    const isHelpCenterSelfServiceDeleted =
        !!helpCenterData?.deleted_datetime ||
        helpCenterIsError ||
        !selfServiceConfiguration?.articleRecommendationHelpCenterId

    const channels = useSelfServiceChannels(shopType, shopName)

    const chatChannels = useMemo(() => {
        return channels.filter(
            (channel): channel is SelfServiceChatChannel =>
                channel.type === TicketChannel.Chat,
        )
    }, [channels])

    const [selectedChannel, setSelectedChannel] = React.useState<string | null>(
        () =>
            channelId ??
            channelIdParam ??
            chatChannels[0]?.value.meta.app_id ??
            null,
    )

    const currentChannel =
        chatChannels.find(
            (channel) => channel.value.meta.app_id === selectedChannel,
        ) ?? chatChannels[0]

    const {
        applicationsAutomationSettings,
        isFetchPending,
        handleChatApplicationAutomationSettingsUpdate,
    } = useApplicationsAutomationSettings(
        chatChannels
            .map((c) => c.value.meta?.app_id)
            .filter((c): c is string => !!c),
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

    const currentlyViewingDropdownOptions = useMemo(
        () => (isAutomateSettings ? channels : chatChannels),
        [channels, chatChannels, isAutomateSettings],
    )

    const currentlyViewingDropdownRenderOption = useCallback(
        (channel: SelfServiceChannel) => {
            switch (channel.type) {
                case TicketChannel.Chat:
                    return {
                        label: channel.value.name,
                        value: channel.value.meta.app_id ?? channel.value.name,
                    }
                case TicketChannel.HelpCenter:
                    return {
                        label: channel.value.name,
                        value: channel.value.id ?? channel.value.name,
                    }
                default:
                    return {
                        label: channel.value.name,
                        value: channel.value.id ?? channel.value.name,
                    }
            }
        },
        [],
    )

    const onSelectedChannelChange = useCallback(
        (value: string | number) => {
            if (!isAutomateSettings) {
                setSelectedChannel(String(value))
                return
            }

            const selectedChannel = channels.find((channel) => {
                if (channel.type === TicketChannel.Chat) {
                    return channel.value.meta?.app_id === value
                }
                return channel.value.id === value
            })

            if (!selectedChannel) return

            const [baseURL] = location.pathname.split(shopType)

            switch (selectedChannel.type) {
                // Current channel type, no redirect
                case TicketChannel.Chat:
                    setSelectedChannel(String(value))
                    break
                case TicketChannel.HelpCenter:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels/help-center?channel-id=${value}`,
                    )
                    break
                case TicketChannel.ContactForm:
                    history.push(
                        `${baseURL}${shopType}/${shopName}/channels/contact-form?channel-id=${value}`,
                    )
                    break
                default:
                    break
            }
        },
        [
            channels,
            history,
            shopName,
            shopType,
            location.pathname,
            isAutomateSettings,
        ],
    )

    const { shouldShowPreviewForRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        integration?.get('id') ?? currentChannel?.value?.id,
    )

    const orderManagementExternalLink = useMemo(() => {
        if (!isAutomateSettings)
            return `/app/automation/${shopType}/${shopName}/order-management`
        return `/app/settings/order-management/${shopType}/${shopName}`
    }, [isAutomateSettings, shopType, shopName])

    const articleRecommendationExternalLink = useMemo(() => {
        if (!isAutomateSettings)
            return `/app/automation/${shopType}/${shopName}/article-recommendation`
        return `/app/settings/article-recommendations/${shopType}/${shopName}`
    }, [isAutomateSettings, shopType, shopName])

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
                        [key]: { enabled: value },
                    },
                    `${readableKey} ${value ? 'enabled' : 'disabled'}`,
                )
            },
        [
            applicationsAutomationSettings,
            selectedChannel,
            handleChatApplicationAutomationSettingsUpdate,
        ],
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

    const { enabledInSettings } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const isArticleRecommendationEnabled = useMemo(() => {
        if (!selectedChannel) return false

        if (
            storeIntegration?.type === IntegrationType.Shopify &&
            !enabledInSettings
        ) {
            return false
        }

        return applicationsAutomationSettings?.[selectedChannel]
            ?.articleRecommendation.enabled
    }, [
        selectedChannel,
        storeIntegration?.type,
        enabledInSettings,
        applicationsAutomationSettings,
    ])

    if (chatChannels.length === 0)
        return (
            <ConnectedChannelsEmptyView view={AutomateFeatures.AutomateChat} />
        )

    if (isLoading) {
        return (
            <div className={css.loadingContainer}>
                <LoadingSpinner size="big" />
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
                        channels={currentlyViewingDropdownOptions}
                        value={selectedChannel ?? ''}
                        appId={currentChannel.value.id}
                        label={currentChannel.value.name}
                        onSelectedChannelChange={onSelectedChannelChange}
                        renderOption={currentlyViewingDropdownRenderOption}
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
                        currentChannel.value.meta,
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
                            },
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
                            } ${readableAction}`,
                        )
                    }}
                />

                <FeatureSettings
                    title="Order Management"
                    label="Enable Order Management"
                    labelSubtitle="Allow customers to track and manage their orders directly within your Chat."
                    enabled={isOrderManagementEnabled}
                    externalLinkUrl={orderManagementExternalLink}
                    onToggle={updateSettings('orderManagement')}
                />

                {enabledInSettings && (
                    <FeatureSettings
                        title="Article Recommendation"
                        label="Enable Article Recommendation"
                        subtitle="Requires an active Help Center with published articles"
                        labelSubtitle="Automatically send Help Center articles in response to customer questions in Chat, if a relevant article exists. If a customer requests more help, a ticket will be created for an agent to handle."
                        enabled={isArticleRecommendationEnabled}
                        disabled={isHelpCenterSelfServiceDeleted}
                        externalLinkUrl={articleRecommendationExternalLink}
                        showConfigurationRequiredAlert={
                            isHelpCenterSelfServiceDeleted
                        }
                        onToggle={updateSettings('articleRecommendation')}
                    />
                )}
            </div>

            {selfServiceConfiguration && shouldShowPreviewForRevamp && (
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
