import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'

import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'

import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

import css from './ConnectedChannelAccordionItem.less'

export type ConnectedChannelAccordionBodyChatProps = {
    channel: SelfServiceChatChannel
    shopType: string
    articleRecommendationHelpCenterId: Maybe<number>
    emptyHelpCenter: boolean
}

const ConnectedChannelAccordionBodyChat = ({
    channel,
    articleRecommendationHelpCenterId,
    emptyHelpCenter,
    shopType,
}: ConnectedChannelAccordionBodyChatProps) => {
    const applicationId = channel.value.meta.app_id!

    const {
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
        isUpdatePending,
    } = useApplicationsAutomationSettings([applicationId])

    const applicationAutomationSettings =
        applicationsAutomationSettings[applicationId]

    const {articleRecommendation, orderManagement, quickResponses} =
        applicationAutomationSettings

    const updateSettings =
        (key: 'articleRecommendation' | 'orderManagement' | 'quickResponses') =>
        (value: boolean) =>
            handleChatApplicationAutomationSettingsUpdate({
                ...applicationAutomationSettings,
                [key]: {enabled: value},
            })

    return (
        <div className={css.featureList}>
            <ConnectedChannelFeatureToggle
                name="Quick responses"
                value={quickResponses.enabled}
                onChange={updateSettings('quickResponses')}
                disabled={isUpdatePending}
            />

            {shopType === 'shopify' && (
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
                disabled={isUpdatePending || emptyHelpCenter}
                action={
                    articleRecommendationHelpCenterId && emptyHelpCenter ? (
                        <Link
                            to={`/app/settings/help-center/${articleRecommendationHelpCenterId}/articles`}
                        >
                            <Button>Add Articles To Your Help Center</Button>
                        </Link>
                    ) : undefined
                }
            />
        </div>
    )
}

export default ConnectedChannelAccordionBodyChat
