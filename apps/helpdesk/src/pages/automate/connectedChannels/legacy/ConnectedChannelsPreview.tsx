import React, { useMemo } from 'react'

import { createMemoryHistory } from 'history'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'
import { getShopUrlFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { SELF_SERVICE_PREVIEW_ROUTES } from 'pages/automate/common/components/preview/constants'
import SelfServicePreview from 'pages/automate/common/components/preview/SelfServicePreview'
import SelfServicePreviewContainer from 'pages/automate/common/components/preview/SelfServicePreviewContainer'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import { getChatsApplicationAutomationSettings } from 'state/entities/chatsApplicationAutomationSettings/selectors'
import { getContactFormsAutomationSettings } from 'state/entities/contactForm/contactFormsAutomationSettings'
import { getHelpCentersAutomationSettings } from 'state/entities/helpCenter/helpCentersAutomationSettings'

import { PREVIEW_MODE_QUERY_PARAM } from '../../../../constants/preview-mode'
import { HELP_CENTER_DEFAULT_LOCALE } from '../../../settings/helpCenter/constants'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../../settings/helpCenter/utils/helpCenter.utils'

type Props = {
    channel?: SelfServiceChannel
    selfServiceConfiguration: SelfServiceConfiguration
    storeIntegration?: StoreIntegration
    contentContainerClassName?: string
}

const ConnectedChannelsPreview = ({
    channel,
    selfServiceConfiguration,
    storeIntegration,
    contentContainerClassName,
}: Props) => {
    const history = useMemo(
        () =>
            createMemoryHistory({
                initialEntries: [SELF_SERVICE_PREVIEW_ROUTES.HOME],
            }),
        [],
    )
    const applicationsAutomationSettings = useAppSelector(
        getChatsApplicationAutomationSettings,
    )

    const helpCentersAutomationSettings = useAppSelector(
        getHelpCentersAutomationSettings,
    )
    const contactFormsAutomationSettings = useAppSelector(
        getContactFormsAutomationSettings,
    )

    let isArticleRecommendationEnabled = false
    let isOrderManagementEnabled = false
    let workflowsEntrypoints:
        | { workflow_id: string; enabled: boolean }[]
        | undefined

    if (channel?.type === TicketChannel.Chat) {
        const { articleRecommendation, orderManagement, workflows } =
            applicationsAutomationSettings[channel.value.meta.app_id!]

        isArticleRecommendationEnabled = articleRecommendation.enabled
        isOrderManagementEnabled = orderManagement.enabled
        workflowsEntrypoints = workflows.entrypoints
    } else if (channel?.type === TicketChannel.HelpCenter) {
        isOrderManagementEnabled =
            !channel.value.self_service_deactivated_datetime

        const automationSettings =
            helpCentersAutomationSettings[channel.value.id]

        if (automationSettings !== undefined) {
            workflowsEntrypoints = automationSettings.workflows.map(
                ({ id, enabled }) => ({ workflow_id: id, enabled }),
            )
        }
    } else if (channel?.type === TicketChannel.ContactForm) {
        const automationSettings =
            contactFormsAutomationSettings[channel.value.id]

        if (automationSettings !== undefined) {
            isOrderManagementEnabled =
                automationSettings.order_management.enabled
            workflowsEntrypoints = automationSettings.workflows.map(
                ({ id, enabled }) => ({ workflow_id: id, enabled }),
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
        <SelfServicePreviewContainer
            channel={channel}
            previewUrl={previewUrl}
            contentContainerClassName={contentContainerClassName}
        >
            {(channel) => (
                <SelfServicePreviewContext.Provider
                    value={{
                        selfServiceConfiguration: {
                            ...selfServiceConfiguration,
                            reportIssuePolicy: isOrderManagementEnabled
                                ? selfServiceConfiguration.reportIssuePolicy
                                : {
                                      ...selfServiceConfiguration.reportIssuePolicy,
                                      enabled: false,
                                  },
                            trackOrderPolicy: isOrderManagementEnabled
                                ? selfServiceConfiguration.trackOrderPolicy
                                : {
                                      ...selfServiceConfiguration.trackOrderPolicy,
                                      enabled: false,
                                  },
                            cancelOrderPolicy: isOrderManagementEnabled
                                ? selfServiceConfiguration.cancelOrderPolicy
                                : {
                                      ...selfServiceConfiguration.cancelOrderPolicy,
                                      enabled: false,
                                  },
                            returnOrderPolicy: isOrderManagementEnabled
                                ? selfServiceConfiguration.returnOrderPolicy
                                : {
                                      ...selfServiceConfiguration.returnOrderPolicy,
                                      enabled: false,
                                  },
                        },
                        isArticleRecommendationEnabled:
                            isArticleRecommendationEnabled &&
                            Boolean(
                                selfServiceConfiguration.articleRecommendationHelpCenterId,
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
