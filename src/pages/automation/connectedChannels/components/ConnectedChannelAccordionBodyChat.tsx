import React from 'react'
import {Link} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

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
    } = useConnectedChannelsViewContext()

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
        <>
            <ConnectedChannelFeatureToggle
                name="Quick responses"
                value={quickResponses.enabled}
                onChange={updateSettings('quickResponses')}
                disabled={isUpdatePending}
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
                disabled={isUpdatePending || isHelpCenterEmpty}
                action={
                    articleRecommendationHelpCenterId && isHelpCenterEmpty ? (
                        <Link
                            to={`/app/settings/help-center/${articleRecommendationHelpCenterId}/articles`}
                        >
                            <Button size="small">
                                Add Articles To Your Help Center
                            </Button>
                        </Link>
                    ) : undefined
                }
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyChat
