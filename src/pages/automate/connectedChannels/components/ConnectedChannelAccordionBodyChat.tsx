import React from 'react'
import {Link} from 'react-router-dom'

import classNames from 'classnames'
import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomate} from 'state/billing/selectors'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {ChannelLanguage} from 'pages/automate/common/types'
import {TicketChannel} from 'business/types/ticket'

import {getLanguagesFromChatConfig} from 'config/integrations/gorgias_chat'
import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import {
    ARTICLE_RECOMMENDATION,
    MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS,
    ORDER_MANAGEMENT,
    QUICK_RESPONSES,
} from '../../common/components/constants'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'
import AutomateSubscriptionAction from './AutomateSubscriptionAction'
import ConnectedChannelWorkflowsFeature from './ConnectedChannelWorkflowsFeature'

import css from './ConnectedChannelAccordionBodyChat.less'

type Props = {
    channel: SelfServiceChatChannel
}

const ConnectedChannelAccordionBodyChat = ({channel}: Props) => {
    const applicationId = channel.value.meta.app_id!

    const {
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
        isUpdatePending,
    } = useApplicationsAutomationSettings([applicationId])
    const {
        articleRecommendationHelpCenterId,
        isHelpCenterEmpty,
        isOrderManagementAvailable,
        articleRecommendationUrl,
        enabledQuickResponsesCount,
        quickResponsesUrl,
    } = useConnectedChannelsViewContext()
    const hasAutomate = useAppSelector(getHasAutomate)

    const applicationAutomationSettings =
        applicationsAutomationSettings[applicationId]

    const {articleRecommendation, orderManagement, quickResponses, workflows} =
        applicationAutomationSettings

    const updateSettings =
        (key: 'articleRecommendation' | 'orderManagement' | 'quickResponses') =>
        (value: boolean) =>
            handleChatApplicationAutomationSettingsUpdate({
                ...applicationAutomationSettings,
                [key]: {enabled: value},
            })

    const renderArticleRecommendationAction = () => {
        if (!hasAutomate) {
            return <AutomateSubscriptionAction />
        }

        if (!articleRecommendationHelpCenterId) {
            return (
                <Link to={articleRecommendationUrl}>
                    <Button fillStyle="ghost" size="small">
                        <ButtonIconLabel
                            icon="warning"
                            className={css.connectHelpCenterWarning}
                        >
                            Select a help center to enable
                        </ButtonIconLabel>
                    </Button>
                </Link>
            )
        }

        if (isHelpCenterEmpty) {
            return (
                <Link
                    to={`/app/settings/help-center/${articleRecommendationHelpCenterId}/articles`}
                >
                    <Button size="small">
                        Add Articles To Your Help Center
                    </Button>
                </Link>
            )
        }
    }

    const maxActiveWorkflows = Math.max(
        MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS -
            enabledQuickResponsesCount * Number(quickResponses.enabled),
        0
    )

    const enabledEntrypointsCount =
        workflows.entrypoints?.filter((entrypoint) => entrypoint.enabled)
            .length ?? 0
    const cantReactivateQuickResponses =
        enabledEntrypointsCount + enabledQuickResponsesCount >
            MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS && !quickResponses.enabled

    const channelLanguages = getLanguagesFromChatConfig(
        channel.value.meta
    ) as ChannelLanguage[]

    return (
        <>
            <ConnectedChannelWorkflowsFeature
                channelType={TicketChannel.Chat}
                channelId={`chat-${applicationId}`}
                integrationId={channel.value.id}
                channelLanguages={channelLanguages}
                entrypoints={workflows.entrypoints || []}
                maxActiveWorkflows={maxActiveWorkflows}
                limitTooltipMessage={
                    <>
                        You have reached the maximum number of enabled Flows in
                        this channel. Disable a Flow or{' '}
                        <Link to={quickResponsesUrl}>Quick Response</Link> in
                        order to enable this Flow.
                    </>
                }
                onChange={(nextEntrypoints) => {
                    void handleChatApplicationAutomationSettingsUpdate({
                        ...applicationAutomationSettings,
                        workflows: {
                            ...workflows,
                            entrypoints: nextEntrypoints,
                        },
                    })
                }}
            />

            <ConnectedChannelFeatureToggle
                name={QUICK_RESPONSES}
                value={quickResponses.enabled}
                onChange={updateSettings('quickResponses')}
                disabled={
                    isUpdatePending ||
                    !hasAutomate ||
                    cantReactivateQuickResponses
                }
                action={!hasAutomate && <AutomateSubscriptionAction />}
                tooltipMessage={
                    cantReactivateQuickResponses
                        ? 'Disable individual Flows and Quick Responses to have a maximum of 6 Flows between them in order to turn on Quick Response again.'
                        : undefined
                }
            />

            {isOrderManagementAvailable && (
                <ConnectedChannelFeatureToggle
                    name={ORDER_MANAGEMENT}
                    value={orderManagement.enabled}
                    onChange={updateSettings('orderManagement')}
                    disabled={isUpdatePending}
                />
            )}

            <ConnectedChannelFeatureToggle
                name={
                    <span>
                        <i className={classNames('material-icons', css.AIIcon)}>
                            auto_awesome
                        </i>
                        {' ' + ARTICLE_RECOMMENDATION}
                    </span>
                }
                description="Requires an active Help Center with published articles."
                value={
                    !!articleRecommendationHelpCenterId &&
                    articleRecommendation.enabled
                }
                onChange={updateSettings('articleRecommendation')}
                disabled={
                    isUpdatePending ||
                    !articleRecommendationHelpCenterId ||
                    !hasAutomate
                }
                action={renderArticleRecommendationAction()}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyChat
