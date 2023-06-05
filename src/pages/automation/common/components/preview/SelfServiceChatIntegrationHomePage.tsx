import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import Collapse from 'pages/common/components/Collapse/Collapse'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'

import SelfServiceChatIntegrationFooter from './components/SelfServiceChatIntegrationFooter'
import SelfServiceChatIntegrationArticleRecommendationFooter from './components/SelfServiceChatIntegrationArticleRecommendationFooter'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'

import css from './SelfServiceChatIntegrationHomePage.less'

const ChevronRightIcon = () => (
    <i className={classnames('material-icons', css.chevronRightIcon)}>
        chevron_right
    </i>
)

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationHomePage = ({integration}: Props) => {
    const history = useHistory()
    const {
        selfServiceConfiguration,
        hoveredQuickResponseId,
        hoveredOrderManagementFlow,
        isArticleRecommendationEnabled,
    } = useSelfServicePreviewContext()
    const currentUser = useAppSelector(getCurrentUser)
    const workflowsEntrypoints = useWorkflowsEntrypoints()

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[integration.meta.language || 'en-US']

    const quickResponses =
        selfServiceConfiguration?.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        ) ?? []
    const canTrackOrders = selfServiceConfiguration?.track_order_policy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.report_issue_policy.enabled ||
        selfServiceConfiguration?.cancel_order_policy.enabled ||
        selfServiceConfiguration?.return_order_policy.enabled
    const isInitialEntry = history.length === 1

    if (
        !quickResponses.length &&
        !canManageOrders &&
        !workflowsEntrypoints.length
    ) {
        return (
            <MessageContent
                conversationColor={integration.decoration.conversation_color}
                currentUser={currentUser}
                customerInitialMessages={[]}
                agentMessages={[]}
                hideConversationTimestamp
            />
        )
    }

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.contentContainer}>
                <Collapse
                    isOpen={
                        quickResponses.length > 0 ||
                        workflowsEntrypoints.length > 0
                    }
                    memoizeOnExit
                >
                    <div className={css.listGroup}>
                        <div className={css.listGroupItemHeading}>
                            {sspTexts.quickResponses}
                        </div>
                        {workflowsEntrypoints.map((entrypoint) => (
                            <div
                                key={entrypoint.workflow_id}
                                className={css.listGroupItem}
                            >
                                {entrypoint.label}
                                <ChevronRightIcon />
                            </div>
                        ))}
                        {quickResponses.map((quickResponse) => (
                            <div
                                key={quickResponse.id}
                                className={classnames(css.listGroupItem, {
                                    [css.isHighlighted]:
                                        quickResponse.id ===
                                        hoveredQuickResponseId,
                                })}
                            >
                                {quickResponse.title}
                                <ChevronRightIcon />
                            </div>
                        ))}
                    </div>
                </Collapse>
                <Collapse isOpen={canManageOrders} memoizeOnExit>
                    <div className={css.listGroup}>
                        <div
                            className={classnames(css.listGroupItemHeading, {
                                [css.isHighlighted]: Boolean(
                                    hoveredOrderManagementFlow
                                ),
                            })}
                        >
                            {canTrackOrders
                                ? sspTexts.trackAndManageMyOrders
                                : sspTexts.manageMyOrders}
                            <ChevronRightIcon />
                        </div>
                    </div>
                </Collapse>
            </div>
            {isArticleRecommendationEnabled ? (
                <SelfServiceChatIntegrationArticleRecommendationFooter
                    sspTexts={sspTexts}
                />
            ) : (
                <SelfServiceChatIntegrationFooter
                    sspTexts={sspTexts}
                    color={integration.decoration.main_color}
                />
            )}
        </div>
    )
}

export default SelfServiceChatIntegrationHomePage
