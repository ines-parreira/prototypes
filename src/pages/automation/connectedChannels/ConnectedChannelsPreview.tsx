import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import useAppSelector from 'hooks/useAppSelector'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import {TicketChannel} from 'business/types/ticket'

type Props = {
    channel: SelfServiceChannel
    selfServiceConfiguration: SelfServiceConfiguration
}

const ConnectedChannelsPreview = ({
    channel,
    selfServiceConfiguration,
}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.HOME],
            }),
        []
    )
    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings
    )

    let isArticleRecommendationEnabled = false
    let areQuickResponsesEnabled = false
    let isOrderManagementEnabled = false

    if (channel.type === TicketChannel.Chat) {
        const {articleRecommendation, orderManagement, quickResponses} =
            applicationsAutomationSettings[channel.value.meta.app_id!]

        isArticleRecommendationEnabled = articleRecommendation.enabled
        isOrderManagementEnabled = orderManagement.enabled
        areQuickResponsesEnabled = quickResponses.enabled
    } else {
        isOrderManagementEnabled =
            !channel.value.self_service_deactivated_datetime
    }

    return (
        <SelfServicePreviewContainer channel={channel}>
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        selfServiceConfiguration: {
                            ...selfServiceConfiguration,
                            report_issue_policy: isOrderManagementEnabled
                                ? selfServiceConfiguration.report_issue_policy
                                : {
                                      ...selfServiceConfiguration.report_issue_policy,
                                      enabled: false,
                                  },
                            track_order_policy: isOrderManagementEnabled
                                ? selfServiceConfiguration.track_order_policy
                                : {
                                      ...selfServiceConfiguration.track_order_policy,
                                      enabled: false,
                                  },
                            cancel_order_policy: isOrderManagementEnabled
                                ? selfServiceConfiguration.cancel_order_policy
                                : {
                                      ...selfServiceConfiguration.cancel_order_policy,
                                      enabled: false,
                                  },
                            return_order_policy: isOrderManagementEnabled
                                ? selfServiceConfiguration.return_order_policy
                                : {
                                      ...selfServiceConfiguration.return_order_policy,
                                      enabled: false,
                                  },
                            quick_response_policies: areQuickResponsesEnabled
                                ? selfServiceConfiguration.quick_response_policies
                                : [],
                        },
                        isArticleRecommendationEnabled:
                            isArticleRecommendationEnabled &&
                            Boolean(
                                selfServiceConfiguration.article_recommendation_help_center_id
                            ),
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default ConnectedChannelsPreview
