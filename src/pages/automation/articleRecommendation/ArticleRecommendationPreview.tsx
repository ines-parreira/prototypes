import React, {useMemo} from 'react'

import {createMemoryHistory} from 'history'

import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import UncontrolledSelfServicePreviewContainer from 'pages/automation/common/components/preview/UncontrolledSelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {SelfServiceChatChannel} from 'pages/automation/common/hooks/useSelfServiceChatChannels'
import useApplicationsAutomationSettings from 'pages/automation/common/hooks/useApplicationsAutomationSettings'
import SelfServiceFeatureDisabledOnChannelAlert from 'pages/automation/common/components/preview/SelfServiceFeatureDisabledOnChannelAlert'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

interface Props {
    channels: SelfServiceChatChannel[]
    selfServiceConfiguration: SelfServiceConfiguration
    isHelpCenterSelected: boolean
}

const ArticleRecommendationPreview = ({
    channels,
    selfServiceConfiguration,
    isHelpCenterSelected,
}: Props) => {
    const chatApplicationsIds = useMemo(
        () =>
            channels
                .map((v) => v.value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
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
        <UncontrolledSelfServicePreviewContainer
            channels={isHelpCenterSelected ? channels : []}
            alert={
                isHelpCenterSelected
                    ? {
                          message:
                              'Connect a chat to your store to use this feature.',
                          action: {
                              message: 'Go To Chat Settings',
                              href: '/app/settings/channels/gorgias_chat',
                          },
                      }
                    : undefined
            }
        >
            {(channel) => {
                const applicationId = channel.value.meta.app_id!
                const isArticleRecommendationDisabled =
                    applicationsAutomationSettings[applicationId]
                        ?.articleRecommendation.enabled === false

                if (isArticleRecommendationDisabled) {
                    return (
                        <SelfServiceFeatureDisabledOnChannelAlert
                            shopName={selfServiceConfiguration.shop_name}
                            shopType={selfServiceConfiguration.type}
                        />
                    )
                }

                return (
                    <SelfServicePreviewContext.Provider value={{}}>
                        <SelfServicePreview
                            channel={channel}
                            history={history}
                        />
                    </SelfServicePreviewContext.Provider>
                )
            }}
        </UncontrolledSelfServicePreviewContainer>
    )
}

export default ArticleRecommendationPreview
