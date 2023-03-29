import React from 'react'
import {Link, useParams} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import useAppSelector from 'hooks/useAppSelector'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'
import AutomationSubscriptionAction from './AutomationSubscriptionAction'

import css from './ConnectedChannelAccordionBodyChat.less'

type Props = {
    channel: SelfServiceChatChannel
}

const ConnectedChannelAccordionBodyChat = ({channel}: Props) => {
    const isflowsBetaEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.FlowsBeta]
    const applicationId = channel.value.meta.app_id!

    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
        isUpdatePending,
    } = useApplicationsAutomationSettings([applicationId])
    const {
        articleRecommendationHelpCenterId,
        isHelpCenterEmpty,
        isOrderManagementAvailable,
    } = useConnectedChannelsViewContext()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const applicationAutomationSettings =
        applicationsAutomationSettings[applicationId]

    const {articleRecommendation, orderManagement, quickResponses, workflows} =
        applicationAutomationSettings

    const updateSettings =
        (
            key:
                | 'articleRecommendation'
                | 'orderManagement'
                | 'quickResponses'
                | 'workflows'
        ) =>
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
                <Link
                    to={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                >
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
            {isflowsBetaEnabled && (
                <ConnectedChannelFeatureToggle
                    name="Flows"
                    value={workflows.enabled}
                    onChange={updateSettings('workflows')}
                    disabled={isUpdatePending || !hasAutomationAddOn}
                    action={
                        !hasAutomationAddOn && <AutomationSubscriptionAction />
                    }
                />
            )}

            <ConnectedChannelFeatureToggle
                name="Quick responses"
                value={quickResponses.enabled}
                onChange={updateSettings('quickResponses')}
                disabled={isUpdatePending || !hasAutomationAddOn}
                action={!hasAutomationAddOn && <AutomationSubscriptionAction />}
            />

            {isOrderManagementAvailable && (
                <ConnectedChannelFeatureToggle
                    name="Order management"
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
