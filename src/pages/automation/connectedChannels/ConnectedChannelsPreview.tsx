import React, {useMemo} from 'react'
import {createMemoryHistory} from 'history'

import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import SelfServicePreview from 'pages/automation/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automation/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automation/common/components/preview/SelfServicePreviewContext'
import {SELF_SERVICE_PREVIEW_ROUTES} from 'pages/automation/common/components/preview/constants'
import {StoreIntegration} from 'models/integration/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {getShopUrlFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import useAppSelector from 'hooks/useAppSelector'
import {getChatsApplicationAutomationSettings} from 'state/entities/chatsApplicationAutomationSettings/selectors'
import {TicketChannel} from 'business/types/ticket'
import {getContactFormsAutomationSettings} from 'state/entities/contactForm/contactFormsAutomationSettings'
import {getHelpCentersAutomationSettings} from 'state/entities/helpCenter/helpCentersAutomationSettings'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../settings/helpCenter/utils/helpCenter.utils'
import {PREVIEW_MODE_QUERY_PARAM} from '../../../constants/preview-mode'
import {HELP_CENTER_DEFAULT_LOCALE} from '../../settings/helpCenter/constants'

type Props = {
    channel?: SelfServiceChannel
    selfServiceConfiguration: SelfServiceConfiguration
    storeIntegration?: StoreIntegration
}

const ConnectedChannelsPreview = ({
    channel,
    selfServiceConfiguration,
    storeIntegration,
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
    const helpCentersAutomationSettings = useAppSelector(
        getHelpCentersAutomationSettings
    )
    const contactFormsAutomationSettings = useAppSelector(
        getContactFormsAutomationSettings
    )

    let isArticleRecommendationEnabled = false
    let areQuickResponsesEnabled = false
    let isOrderManagementEnabled = false
    let workflowsEntrypoints:
        | {workflow_id: string; enabled: boolean}[]
        | undefined

    if (channel?.type === TicketChannel.Chat) {
        const {
            articleRecommendation,
            orderManagement,
            quickResponses,
            workflows,
        } = applicationsAutomationSettings[channel.value.meta.app_id!]

        isArticleRecommendationEnabled = articleRecommendation.enabled
        isOrderManagementEnabled = orderManagement.enabled
        areQuickResponsesEnabled = quickResponses.enabled
        workflowsEntrypoints = workflows.entrypoints
    } else if (channel?.type === TicketChannel.HelpCenter) {
        isOrderManagementEnabled =
            !channel.value.self_service_deactivated_datetime

        const automationSettings =
            helpCentersAutomationSettings[channel.value.id]

        if (automationSettings !== undefined) {
            workflowsEntrypoints = automationSettings.workflows.map(
                ({id, enabled}) => ({workflow_id: id, enabled})
            )
        }
    } else if (channel?.type === TicketChannel.ContactForm) {
        const automationSettings =
            contactFormsAutomationSettings[channel.value.id]

        if (automationSettings !== undefined) {
            isOrderManagementEnabled =
                automationSettings.order_management.enabled
            workflowsEntrypoints = automationSettings.workflows.map(
                ({id, enabled}) => ({workflow_id: id, enabled})
            )
        }
    }

    const previewUrl = useMemo(() => {
        switch (channel?.type) {
            case TicketChannel.Chat: {
                if (!storeIntegration) return undefined

                const shopUrl = getShopUrlFromStoreIntegration(storeIntegration)

                return shopUrl
                    ? `${shopUrl}?${PREVIEW_MODE_QUERY_PARAM}=true`
                    : undefined
            }
            case TicketChannel.ContactForm:
                return `${channel.value.url_template}?${PREVIEW_MODE_QUERY_PARAM}=true`
            case TicketChannel.HelpCenter:
                return getAbsoluteUrl({
                    domain: getHelpCenterDomain(channel.value),
                    locale: HELP_CENTER_DEFAULT_LOCALE,
                    queryString: `${PREVIEW_MODE_QUERY_PARAM}=true`,
                })
            default:
                return undefined
        }
    }, [channel, storeIntegration])

    return (
        <SelfServicePreviewContainer channel={channel} previewUrl={previewUrl}>
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
                        workflowsEntrypoints,
                    }}
                >
                    <SelfServicePreview channel={channel} history={history} />
                </SelfServicePreviewContext.Provider>
            )}
        </SelfServicePreviewContainer>
    )
}

export default ConnectedChannelsPreview
