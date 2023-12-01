import React, {useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import Accordion from 'pages/common/components/accordion/Accordion'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {IntegrationType} from 'models/integration/constants'
import useSelfServiceChannels, {
    SelfServiceChannel,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'
import Button from 'pages/common/components/button/Button'
import useSearch from 'hooks/useSearch'
import useWorkflowConfigurations from 'pages/automate/common/hooks/useWorkflowConfigurations'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'

import {SegmentEvent} from 'common/segment'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../workflows/hooks/useWorkflowChannelSupport'
import {FeatureFlagKey} from '../../../config/featureFlags'
import {CHANNELS} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import ConnectedChannelAccordionItem from './components/ConnectedChannelAccordionItem'
import ConnectedChannelsPreview from './ConnectedChannelsPreview'
import ConnectedChannelsViewContext, {
    ConnectedChannelsViewContextType,
} from './ConnectedChannelsViewContext'

import css from './ConnectedChannelsView.less'

const ConnectedChannelsView = () => {
    useHistoryTracking(SegmentEvent.AutomateChannelsVisited)
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {type: defaultExpandedChannelType, id: defaultExpandedChannelId} =
        useSearch<{
            type: SelfServiceChannel['type']
            id: string
        }>()
    const channels = useSelfServiceChannels(shopType, shopName)
    const {selfServiceConfiguration, storeIntegration} =
        useSelfServiceConfiguration(shopType, shopName)
    const {isFetchPending: isWorkflowsFetchPending, workflowConfigurations} =
        useWorkflowConfigurations()
    const workflowChannelSupportContext = useWorkflowChannelSupport(
        shopType,
        shopName
    )
    const [expandedChannelIndex, setExpandedChannelIndex] = useState(() => {
        if (!defaultExpandedChannelType || !defaultExpandedChannelId) {
            return 0
        }

        const defaultExpandedChannelIdInt = parseInt(
            defaultExpandedChannelId,
            10
        )

        const index = channels.findIndex(
            (channel) =>
                channel.type === defaultExpandedChannelType &&
                channel.value.id === defaultExpandedChannelIdInt
        )

        return index !== -1 ? index : 0
    })

    const articleRecommendationHelpCenterId =
        selfServiceConfiguration?.article_recommendation_help_center_id
    const helpCenterArticlesCount = useHelpCenterPublishedArticlesCount(
        articleRecommendationHelpCenterId
    )

    const connectedChannelsViewContext =
        useMemo<ConnectedChannelsViewContextType>(
            () => ({
                articleRecommendationHelpCenterId,
                isHelpCenterEmpty: helpCenterArticlesCount === 0,
                isOrderManagementAvailable:
                    shopType === IntegrationType.Shopify,
                workflowConfigurations,
                workflowsEntrypoints:
                    selfServiceConfiguration?.workflows_entrypoints ?? [],
                workflowsUrl: `/app/automation/${shopType}/${shopName}/flows`,
                articleRecommendationUrl: `/app/automation/${shopType}/${shopName}/article-recommendation`,
                quickResponsesUrl: `/app/automation/${shopType}/${shopName}/quick-responses`,
                enabledQuickResponsesCount:
                    selfServiceConfiguration?.quick_response_policies.filter(
                        (quickResponse) => !quickResponse.deactivated_datetime
                    ).length ?? 0,
            }),
            [
                articleRecommendationHelpCenterId,
                helpCenterArticlesCount,
                shopType,
                shopName,
                selfServiceConfiguration?.workflows_entrypoints,
                selfServiceConfiguration?.quick_response_policies,
                workflowConfigurations,
            ]
        )

    const chatApplicationIds = useMemo(
        () =>
            channels
                .filter(
                    (channel): channel is SelfServiceChatChannel =>
                        channel.type === TicketChannel.Chat
                )
                .map(({value}) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
    )

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationIds)

    const handleExpandedChannelChange = (channelIndex: string | null) => {
        setExpandedChannelIndex(channelIndex ? parseInt(channelIndex, 10) : -1)
    }

    const hasChatChannel = channels.some(
        (channel) => channel.type === TicketChannel.Chat
    )
    const hasHelpCenterChannel = channels.some(
        (channel) => channel.type === TicketChannel.HelpCenter
    )
    const hasContactFormChannel = channels.some(
        (channel) => channel.type === TicketChannel.ContactForm
    )
    const hasChannels =
        hasChatChannel || hasHelpCenterChannel || hasContactFormChannel
    const isLoading =
        !selfServiceConfiguration ||
        isWorkflowsFetchPending ||
        chatApplicationIds.some((id) => !(id in applicationsAutomationSettings))

    const expandedChannel = channels[expandedChannelIndex]

    // Remove displayContactForms after we fully enable ContactFormOrderManagement
    const contactFormOrderManagementEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.ContactFormOrderManagement]
    const displayContactForms =
        connectedChannelsViewContext.workflowsEntrypoints.length > 0 ||
        contactFormOrderManagementEnabled

    return (
        <AutomateView title={CHANNELS} isLoading={isLoading}>
            <AutomateViewContent description="Manage your Automate features per channel.">
                {hasChannels && (
                    <div
                        className={css.channelsContainer}
                        data-testid="connected-channels"
                    >
                        <ConnectedChannelsViewContext.Provider
                            value={connectedChannelsViewContext}
                        >
                            <WorkflowChannelSupportContext.Provider
                                value={workflowChannelSupportContext}
                            >
                                <Accordion
                                    expandedItem={expandedChannelIndex.toString()}
                                    onChange={handleExpandedChannelChange}
                                >
                                    {channels.map((channel, index) => {
                                        if (
                                            channel.type ===
                                                TicketChannel.ContactForm &&
                                            !displayContactForms
                                        ) {
                                            return null
                                        }

                                        return (
                                            <ConnectedChannelAccordionItem
                                                key={index}
                                                index={index}
                                                channel={channel}
                                            />
                                        )
                                    })}
                                </Accordion>
                            </WorkflowChannelSupportContext.Provider>
                        </ConnectedChannelsViewContext.Provider>
                    </div>
                )}
                <div className={css.alertsContainer}>
                    {!hasChatChannel && (
                        <Alert
                            icon
                            type={AlertType.Warning}
                            customActions={
                                <Link
                                    to={`/app/settings/channels/gorgias_chat`}
                                >
                                    <Button size="small" fillStyle="ghost">
                                        Go To Chat
                                    </Button>
                                </Link>
                            }
                        >
                            Connect a Chat to this store to use Automate
                            features.
                        </Alert>
                    )}
                    {!hasHelpCenterChannel &&
                        shopType === IntegrationType.Shopify && (
                            <Alert
                                icon
                                type={AlertType.Warning}
                                customActions={
                                    <Link to={`/app/settings/help-center`}>
                                        <Button size="small" fillStyle="ghost">
                                            Go To Help Center
                                        </Button>
                                    </Link>
                                }
                            >
                                Connect a Help Center to this store to use
                                Automate features. Currently only available for
                                Shopify stores.
                            </Alert>
                        )}
                </div>
            </AutomateViewContent>
            <ConnectedChannelsPreview
                channel={expandedChannel}
                selfServiceConfiguration={selfServiceConfiguration!}
                storeIntegration={storeIntegration}
            />
        </AutomateView>
    )
}

export default ConnectedChannelsView
