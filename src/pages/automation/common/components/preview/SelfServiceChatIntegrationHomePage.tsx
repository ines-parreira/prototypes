import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import Collapse from 'pages/common/components/Collapse/Collapse'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {GorgiasChatIntegration} from 'models/integration/types'

import SelfServiceChatIntegrationFooter from './components/SelfServiceChatIntegrationFooter'
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
    } = useSelfServicePreviewContext()

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

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.contentContainer}>
                <Collapse isOpen={quickResponses.length > 0} memoizeOnExit>
                    <div className={css.listGroup}>
                        <div className={css.listGroupItemHeading}>
                            {sspTexts.quickResponses}
                        </div>
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
            <SelfServiceChatIntegrationFooter sspTexts={sspTexts} />
        </div>
    )
}

export default SelfServiceChatIntegrationHomePage
