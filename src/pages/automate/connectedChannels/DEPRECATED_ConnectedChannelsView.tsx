import React, {useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import Accordion from 'pages/common/components/accordion/Accordion'
import {IntegrationType} from 'models/integration/constants'
import useSelfServiceChannels, {
    isSelfServiceChatChannel,
    isSelfServiceStandaloneContactFormChannel,
    SelfServiceChannel,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'
import useSearch from 'hooks/useSearch'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import useEffectOnce from 'hooks/useEffectOnce'

import {SegmentEvent, logEvent} from 'common/segment'
import {useGetWorkflowConfigurations} from 'models/workflows/queries'
import useWorkflowChannelSupport, {
    WorkflowChannelSupportContext,
} from '../workflows/hooks/useWorkflowChannelSupport'
import {FeatureFlagKey} from '../../../config/featureFlags'
import {CHANNELS} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import useContactFormsAutomationSettings from '../common/hooks/useContactFormsAutomationSettings'
import NoChannelsAlert from '../workflows/editor/visualBuilder/publisher/helper/NoChannelAlert'
import ConnectedChannelAccordionItem from './components/ConnectedChannelAccordionItem'
import ConnectedChannelsPreview from './ConnectedChannelsPreview'
import ConnectedChannelsViewContext, {
    ConnectedChannelsViewContextType,
} from './ConnectedChannelsViewContext'

import css from './DEPRECATED_ConnectedChannelsView.less'

/**
 * @deprecated Use ConnectedChannelsView.tsx instead
 */
const DEPRECATED_ConnectedChannelsView = () => {
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

    const {isLoading: isWorkflowsFetchPending, data: workflowConfigurations} =
        useGetWorkflowConfigurations()
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
        selfServiceConfiguration?.articleRecommendationHelpCenterId
    const helpCenterArticlesCount = useHelpCenterPublishedArticlesCount(
        articleRecommendationHelpCenterId
    )
    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Connected Channels',
        })
    })

    const connectedChannelsViewContext =
        useMemo<ConnectedChannelsViewContextType>(
            () => ({
                articleRecommendationHelpCenterId,
                isHelpCenterEmpty: helpCenterArticlesCount === 0,
                isOrderManagementAvailable:
                    shopType === IntegrationType.Shopify,
                workflowConfigurations: workflowConfigurations ?? [],
                workflowsEntrypoints:
                    selfServiceConfiguration?.workflowsEntrypoints ?? [],
                workflowsUrl: `/app/automation/${shopType}/${shopName}/flows`,
                articleRecommendationUrl: `/app/automation/${shopType}/${shopName}/article-recommendation`,
                quickResponsesUrl: `/app/automation/${shopType}/${shopName}${
                    isImprovedNavigationEnabled ? '/flows' : ''
                }/quick-responses`,
                enabledQuickResponsesCount:
                    selfServiceConfiguration?.quickResponsePolicies.filter(
                        (quickResponse) => !quickResponse.deactivatedDatetime
                    ).length ?? 0,
            }),
            [
                articleRecommendationHelpCenterId,
                helpCenterArticlesCount,
                shopType,
                isImprovedNavigationEnabled,
                shopName,
                selfServiceConfiguration?.workflowsEntrypoints,
                selfServiceConfiguration?.quickResponsePolicies,
                workflowConfigurations,
            ]
        )

    const chatApplicationIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceChatChannel)
                .map(({value}) => value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
    )
    const contactFormIds = useMemo(
        () =>
            channels
                .filter(isSelfServiceStandaloneContactFormChannel)
                .map(({value}) => value.id),
        [channels]
    )

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationIds)
    const {contactFormsAutomationSettings} =
        useContactFormsAutomationSettings(contactFormIds)

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
        chatApplicationIds.some(
            (id) => !(id in applicationsAutomationSettings)
        ) ||
        contactFormIds.some(
            (id) => !(id.toString() in contactFormsAutomationSettings)
        )

    const expandedChannel = channels[expandedChannelIndex]

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
                                    {channels.map((channel, index) => (
                                        <ConnectedChannelAccordionItem
                                            key={index}
                                            index={index}
                                            channel={channel}
                                        />
                                    ))}
                                </Accordion>
                            </WorkflowChannelSupportContext.Provider>
                        </ConnectedChannelsViewContext.Provider>
                    </div>
                )}
                <div className={css.alertsContainer}>
                    {!hasChatChannel && (
                        <NoChannelsAlert channelType={TicketChannel.Chat} />
                    )}
                    {!hasHelpCenterChannel &&
                        shopType === IntegrationType.Shopify && (
                            <NoChannelsAlert
                                channelType={TicketChannel.HelpCenter}
                            />
                        )}
                    {!hasContactFormChannel && (
                        <NoChannelsAlert
                            channelType={TicketChannel.ContactForm}
                        />
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

export default DEPRECATED_ConnectedChannelsView
