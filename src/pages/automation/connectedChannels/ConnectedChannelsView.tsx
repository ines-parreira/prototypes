import React, {useMemo} from 'react'

import {Link, useParams} from 'react-router-dom'
import {Container} from 'reactstrap'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import useSelfServiceChannels from '../common/hooks/useSelfServiceChannels'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import useSelfServiceHelpCenterChannels from '../common/hooks/useSelfServiceHelpCenterChannels'
import useSelfServiceConfiguration from '../common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from '../articleRecommendation/hooks/useHelpCenterPublishedArticlesCount'

import ConnectedChannelAccordionItem from './components/ConnectedChannelAccordionItem'

import css from './ConnectedChannelsView.less'

const ConnectedChannelsView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const channels = useSelfServiceChannels(shopType, shopName)
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const helpCenterChannels = useSelfServiceHelpCenterChannels(
        shopType,
        shopName
    )

    const {selfServiceConfiguration} = useSelfServiceConfiguration(
        shopType,
        shopName
    )

    const helpCenterArticlesCount = useHelpCenterPublishedArticlesCount(
        selfServiceConfiguration?.article_recommendation_help_center_id
    )

    const chatApplicationIds: string[] = useMemo(
        () =>
            chatChannels
                .map(({value}) => value.meta.app_id)
                .filter(
                    (appId: string | undefined): appId is string =>
                        appId !== undefined
                ),
        [chatChannels]
    )

    const {
        applicationsAutomationSettings,
        isFetchPending: isChatsFetchPending,
        isUpdatePending: isChatUpdatePending,
    } = useApplicationsAutomationSettings(chatApplicationIds)

    const isLoading =
        isChatsFetchPending ||
        isChatUpdatePending ||
        chatApplicationIds.length >
            Object.keys(applicationsAutomationSettings).length

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
                                <p className="mb-1">
                                    Manage features enabled per channel
                                    connected to this store.
                                </p>
                            </div>

                            {channels.length ? (
                                <div className={css.channelsContainer}>
                                    <Accordion
                                        defaultExpandedItem={channels[0].value.id.toString()}
                                    >
                                        {channels.map((channel) => (
                                            <AccordionItem
                                                key={channel.value.id}
                                                id={channel.value.id.toString()}
                                            >
                                                <ConnectedChannelAccordionItem
                                                    channel={channel}
                                                    articleRecommendationHelpCenterId={
                                                        selfServiceConfiguration?.article_recommendation_help_center_id
                                                    }
                                                    emptyHelpCenter={
                                                        helpCenterArticlesCount ===
                                                        0
                                                    }
                                                    shopType={shopType}
                                                />
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            ) : null}

                            <div
                                className={classnames(
                                    css.alertsContainer,
                                    channels.length === 0 && css.noChannels
                                )}
                            >
                                {chatChannels.length === 0 && (
                                    <Alert
                                        icon
                                        type={AlertType.Warning}
                                        customActions={
                                            <Link
                                                to={`/app/settings/channels/gorgias_chat`}
                                            >
                                                Go To Chat
                                            </Link>
                                        }
                                    >
                                        Connect a chat widget to this store to
                                        use Automation Add-on features.
                                    </Alert>
                                )}

                                {helpCenterChannels.length === 0 &&
                                    shopType === 'shopify' && (
                                        <Alert
                                            icon
                                            type={AlertType.Warning}
                                            customActions={
                                                <Link
                                                    to={`/app/settings/help-center`}
                                                >
                                                    Go To Help Center
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
                    </>
                )}
            </Container>
        </div>
    )
}

export default ConnectedChannelsView
