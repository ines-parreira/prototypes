import React, {useMemo} from 'react'

import {createMemoryHistory} from 'history'

import {HelpCenter} from 'models/helpCenter/types'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import UncontrolledSelfServicePreviewContainer from 'pages/automation/common/components/preview/UncontrolledSelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'

import {DisabledOnChannelAlert} from './ArticleRecommendationAlerts'

interface Props {
    shopName: string
    shopType: string
    helpCenter: HelpCenter | undefined
}

const ArticleRecommendationPreview = ({
    shopName,
    shopType,
    helpCenter,
}: Props) => {
    const chatIntegrations = useSelfServiceChatChannels(shopType, shopName)
    const chatApplicationsIds = useMemo(
        () =>
            chatIntegrations
                .map((v) => v.value.meta.app_id)
                .filter(
                    (appId: string | undefined): appId is string =>
                        appId !== undefined
                ),
        [chatIntegrations]
    )

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationsIds)

    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [
                    SELF_SERVICE_PREVIEW_ROUTES.ARTICLE_RECOMMENDATION,
                ],
            }),
        []
    )

    return (
        <UncontrolledSelfServicePreviewContainer<SelfServiceChatChannel>
            channels={helpCenter !== undefined ? chatIntegrations : []}
            alert={
                helpCenter && {
                    message:
                        'Connect a chat to your store to use this feature.',
                    action: {
                        message: 'Go To Chat Settings',
                        href: '/app/settings/channels/gorgias_chat',
                    },
                }
            }
        >
            {(channel) => {
                const applicationId = channel.value.meta.app_id
                const articleRecommendationDisabled =
                    applicationsAutomationSettings[applicationId ?? '']
                        ?.articleRecommendation.enabled === false

                if (articleRecommendationDisabled) {
                    return (
                        <DisabledOnChannelAlert
                            shopName={shopName}
                            shopType={shopType}
                        />
                    )
                }

                return (
                    helpCenter && (
                        <SelfServicePreviewContext.Provider value={{}}>
                            <SelfServicePreview
                                channel={channel}
                                history={history}
                            />
                        </SelfServicePreviewContext.Provider>
                    )
                )
            }}
        </UncontrolledSelfServicePreviewContainer>
    )
}

export default ArticleRecommendationPreview
