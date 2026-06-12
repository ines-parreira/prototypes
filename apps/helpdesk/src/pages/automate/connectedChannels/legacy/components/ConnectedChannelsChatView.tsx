import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import type { Map } from 'immutable'
import { useParams } from 'react-router-dom'
import { noop } from '@gorgias/toolkit'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useGetHelpCenter } from 'models/helpCenter/queries'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { useSelfServiceChatChannels } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { useSelfServiceConfiguration } from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { AutomateFeatures } from 'pages/automate/common/types'
import { useConnectedChannelsContext } from 'pages/automate/connectedChannels/ConnectedChannelsContext'
import { useArticleRecommendation } from 'pages/automate/connectedChannels/revamp/hooks/useArticleRecommendation'
import { useFlows } from 'pages/automate/connectedChannels/revamp/hooks/useFlows'
import { useOrderManagement } from 'pages/automate/connectedChannels/revamp/hooks/useOrderManagement'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShouldShowChatSettingsRevamp'

import { ConnectedChannelsPreview } from '../ConnectedChannelsPreview'
import { ConnectedChannelsEmptyView } from './ConnectedChannelsEmptyView'
import { CurrentlyViewingDropdown } from './CurrentlyViewingDropdown'
import { FeatureSettings } from './FeatureSettings'
import { FlowsSettings } from './FlowsSettings'

import css from './ConnectedChannelsChatView.less'

interface Props {
    channelId?: number
    shopName?: string
    shopType?: string
    hideDropdown?: boolean
    integration?: Map<any, any>
}

export const ConnectedChannelsChatView = ({
    channelId: channelIdProp,
    shopName: extShopName,
    shopType: extShopType,
    hideDropdown,
}: Props) => {
    const { shopType: shopTypeParam, shopName: shopNameParam } = useParams<{
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

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const { channel, channels, onChannelChange } = useConnectedChannelsContext()
    const [localChannelId, setLocalChannelId] = useState<number | undefined>(
        channelIdProp,
    )
    const selectedChannelId = useMemo(
        () => channel?.value.id ?? localChannelId,
        [channel, localChannelId],
    )

    const setSelectedChannel = useCallback(
        (channelId: number) => {
            if (channel) {
                onChannelChange(channels.find((c) => c.value.id === channelId))
            } else {
                setLocalChannelId(channelId)
            }
        },
        [channel, channels, onChannelChange],
    )

    const selectedChannel = useMemo(() => {
        return selectedChannelId || channelIdProp || chatChannels[0]?.value.id
    }, [channelIdProp, selectedChannelId, chatChannels])

    useEffect(() => {
        setSelectedChannel(selectedChannel)
    }, [selectedChannel, setSelectedChannel])

    const currentChannel = useMemo(() => {
        return (
            chatChannels.find(
                (channel) => channel.value.id === selectedChannel,
            ) ?? chatChannels[0]
        )
    }, [chatChannels, selectedChannel])

    const {
        isLoading: isLoadingFlows,
        primaryLanguage,
        workflowEntrypoints,
        workflowConfigurations,
        automationSettingsWorkflows,
        handleFlowAdd,
        handleFlowRemove,
        handleFlowReorder,
    } = useFlows({ shopName, shopType, selectedChannelId: selectedChannel })

    const currentlyViewingDropdownRenderOption = useCallback(
        (channel: SelfServiceChannel) => {
            return {
                label: channel.value.name,
                value: channel.value.id,
            }
        },
        [],
    )
    const { shouldShowPreviewForRevamp } = useShouldShowChatSettingsRevamp(
        storeIntegration,
        selectedChannel,
    )

    const orderManagementExternalLink = useMemo(() => {
        return `/app/settings/order-management/${shopType}/${shopName}`
    }, [shopType, shopName])

    const articleRecommendationExternalLink = useMemo(() => {
        return `/app/settings/article-recommendations/${shopType}/${shopName}`
    }, [shopType, shopName])

    const { enabledInSettings } =
        useIsArticleRecommendationsEnabledWhileSunset()

    const {
        isLoading: isLoadingArticleRecommendation,
        isArticleRecommendationEnabled,
        handleToggle: handleArticleRecommendationToggle,
    } = useArticleRecommendation({ shopName, shopType })

    const {
        isLoading: isLoadingOrderManagement,
        isOrderManagementEnabled,
        handleToggle: handleOrderManagementToggle,
    } = useOrderManagement({ shopName, shopType })

    const isLoading =
        !selfServiceConfiguration ||
        isSelfServiceConfigurationFetchPending ||
        isLoadingFlows ||
        isLoadingArticleRecommendation ||
        isLoadingOrderManagement

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
                        channels={chatChannels}
                        value={selectedChannel ?? ''}
                        appId={currentChannel.value.id}
                        label={currentChannel.value.name}
                        onSelectedChannelChange={(value: number | string) =>
                            // Intentional to satisfy typing, will be removed when deleting legacy code
                            setSelectedChannel(value as number)
                        }
                        renderOption={currentlyViewingDropdownRenderOption}
                    />
                )}
                <FlowsSettings
                    channelType="chat"
                    channel={currentChannel}
                    shopType={shopType}
                    shopName={shopName}
                    workflowEntrypoints={workflowEntrypoints}
                    primaryLanguage={primaryLanguage}
                    configurations={workflowConfigurations ?? []}
                    automationSettingsWorkflows={automationSettingsWorkflows}
                    onChange={(nextEntrypoints, action) => {
                        switch (action) {
                            case 'add':
                                handleFlowAdd(nextEntrypoints)
                                break
                            case 'remove':
                                handleFlowRemove(nextEntrypoints)
                                break
                            case 'reorder':
                                handleFlowReorder(nextEntrypoints)
                                break
                            default:
                                break
                        }

                        logEvent(
                            SegmentEvent.AutomateChannelUpdateFromChannels,
                            {
                                page: 'Channels',
                            },
                        )
                    }}
                />

                <FeatureSettings
                    title="Order Management"
                    label="Enable Order Management"
                    labelSubtitle="Allow customers to track and manage their orders directly within your Chat."
                    enabled={isOrderManagementEnabled}
                    externalLinkUrl={orderManagementExternalLink}
                    onToggle={() =>
                        handleOrderManagementToggle(!isOrderManagementEnabled)
                    }
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
                        onToggle={() =>
                            handleArticleRecommendationToggle(
                                !isArticleRecommendationEnabled,
                            )
                        }
                    />
                )}
            </div>

            {selfServiceConfiguration &&
                !isSelfServiceConfigurationFetchPending &&
                shouldShowPreviewForRevamp && (
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
