import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {ChannelLanguage} from 'pages/automation/common/types'
import {TicketChannel} from 'business/types/ticket'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import {MAX_ACTIVE_QUICK_RESPONSES_AND_FLOWS} from '../../common/components/constants'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'
import AutomationSubscriptionAction from './AutomationSubscriptionAction'
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
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

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
        if (!hasAutomationAddOn) {
            return <AutomationSubscriptionAction />
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

    return (
        <>
            <ConnectedChannelWorkflowsFeature
                channelType={TicketChannel.Chat}
                channelId={`chat-${applicationId}`}
                integrationId={channel.value.id}
                channelLanguages={[
                    (channel.value.meta.language as ChannelLanguage) ?? 'en-US',
                ]}
                entrypoints={workflows.entrypoints || []}
                maxActiveWorkflows={maxActiveWorkflows}
                limitTooltipMessage={
                    <>
                        You have reached the maximum number of enabled flows in
                        this channel. Disable a flow or{' '}
                        <Link to={quickResponsesUrl}>quick response flow</Link>{' '}
                        in order to enable this flow.
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
                name="Quick response flows"
                value={quickResponses.enabled}
                onChange={updateSettings('quickResponses')}
                disabled={
                    isUpdatePending ||
                    !hasAutomationAddOn ||
                    cantReactivateQuickResponses
                }
                action={!hasAutomationAddOn && <AutomationSubscriptionAction />}
                tooltipMessage={
                    cantReactivateQuickResponses
                        ? 'Disable individual Flows and Quick response flows to have a maximum of 6 flows between them in order to turn on Quick response flows again.'
                        : undefined
                }
            />

            {isOrderManagementAvailable && (
                <ConnectedChannelFeatureToggle
                    name="Order management flows"
                    value={orderManagement.enabled}
                    onChange={updateSettings('orderManagement')}
                    disabled={isUpdatePending}
                />
            )}

            <ConnectedChannelFeatureToggle
                name="Article recommendation"
                description="Requires an active help center with published articles."
                value={
                    !!articleRecommendationHelpCenterId &&
                    articleRecommendation.enabled
                }
                onChange={updateSettings('articleRecommendation')}
                disabled={
                    isUpdatePending ||
                    !articleRecommendationHelpCenterId ||
                    !hasAutomationAddOn
                }
                action={renderArticleRecommendationAction()}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyChat
