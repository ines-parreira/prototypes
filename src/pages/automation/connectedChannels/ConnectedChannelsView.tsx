import React, {useMemo, useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Container} from 'reactstrap'
import classnames from 'classnames'

import {TicketChannel} from 'business/types/ticket'
import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Accordion from 'pages/common/components/accordion/Accordion'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {IntegrationType} from 'models/integration/constants'
import useSelfServiceChannels from 'pages/automation/common/hooks/useSelfServiceChannels'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from 'pages/automation/common/hooks/useHelpCenterPublishedArticlesCount'
import Button from 'pages/common/components/button/Button'

import ConnectedChannelAccordionItem from './components/ConnectedChannelAccordionItem'
import ConnectedChannelsPreview from './ConnectedChannelsPreview'
import ConnectedChannelsViewContext, {
    ConnectedChannelsViewContextType,
} from './ConnectedChannelsViewContext'

import css from './ConnectedChannelsView.less'

const ConnectedChannelsView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const channels = useSelfServiceChannels(shopType, shopName)
    const {selfServiceConfiguration} = useSelfServiceConfiguration(
        shopType,
        shopName
    )
    const [expandedChannelIndex, setExpandedChannelIndex] = useState(0)

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
            }),
            [
                articleRecommendationHelpCenterId,
                helpCenterArticlesCount,
                shopType,
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
        if (channelIndex) {
            setExpandedChannelIndex(parseInt(channelIndex, 10))
        }
    }

    const hasChatChannel = channels.some(
        (channel) => channel.type === TicketChannel.Chat
    )
    const hasHelpCenterChannel = channels.some(
        (channel) => channel.type === TicketChannel.HelpCenter
    )
    const hasChannels = hasChatChannel || hasHelpCenterChannel
    const isLoading =
        !selfServiceConfiguration ||
        chatApplicationIds.some((id) => !(id in applicationsAutomationSettings))

    const expandedChannel = channels[expandedChannelIndex]

    return (
        <div className="full-width">
            <PageHeader title="Connected channels" />
            <Container
                fluid
                className={classnames({
                    [css.container]: !isLoading,
                })}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        <div className={css.content}>
                            <div className={css.descriptionContainer}>
                                Manage features enabled per channel connected to
                                this store.
                            </div>

                            {hasChannels && (
                                <div className={css.channelsContainer}>
                                    <ConnectedChannelsViewContext.Provider
                                        value={connectedChannelsViewContext}
                                    >
                                        <Accordion
                                            expandedItem={expandedChannelIndex.toString()}
                                            onChange={
                                                handleExpandedChannelChange
                                            }
                                        >
                                            {channels.map((channel, index) => (
                                                <ConnectedChannelAccordionItem
                                                    key={index}
                                                    index={index}
                                                    channel={channel}
                                                />
                                            ))}
                                        </Accordion>
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
                                                <Button
                                                    size="small"
                                                    fillStyle="ghost"
                                                >
                                                    Go To Chat
                                                </Button>
                                            </Link>
                                        }
                                    >
                                        Connect a chat widget to this store to
                                        use Automation Add-on features.
                                    </Alert>
                                )}

                                {!hasHelpCenterChannel &&
                                    shopType === IntegrationType.Shopify && (
                                        <Alert
                                            icon
                                            type={AlertType.Warning}
                                            customActions={
                                                <Link
                                                    to={`/app/settings/help-center`}
                                                >
                                                    <Button
                                                        size="small"
                                                        fillStyle="ghost"
                                                    >
                                                        Go To Help Center
                                                    </Button>
                                                </Link>
                                            }
                                        >
                                            Connect a Help Center to this store
                                            to use Automation Add-on features.
                                            Currently only available for Shopify
                                            stores.
                                        </Alert>
                                    )}
                            </div>
                        </div>
                        {expandedChannel && (
                            <ConnectedChannelsPreview
                                channel={expandedChannel}
                                selfServiceConfiguration={
                                    selfServiceConfiguration!
                                }
                            />
                        )}
                    </>
                )}
            </Container>
        </div>
    )
}

export default ConnectedChannelsView
