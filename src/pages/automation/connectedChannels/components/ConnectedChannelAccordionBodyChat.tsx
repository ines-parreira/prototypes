import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
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

    return (
        <>
            <ConnectedChannelWorkflowsFeature
                channelId={`chat-${applicationId}`}
                entrypoints={workflows.entrypoints}
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
                disabled={isUpdatePending || !hasAutomationAddOn}
                action={!hasAutomationAddOn && <AutomationSubscriptionAction />}
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
                value={articleRecommendation.enabled}
                onChange={updateSettings('articleRecommendation')}
                disabled={
                    isUpdatePending || isHelpCenterEmpty || !hasAutomationAddOn
                }
                action={renderArticleRecommendationAction()}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyChat
