import React, {ReactNode} from 'react'
import classnames from 'classnames'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {HelpCenter} from 'models/helpCenter/types'
import trackIcon from 'assets/img/self-service/track.svg'
import returnIcon from 'assets/img/self-service/return.svg'
import cancelIcon from 'assets/img/self-service/cancel.svg'
import reportIssueIcon from 'assets/img/self-service/report-issue.svg'

import {useSelfServicePreviewContext} from './SelfServicePreviewContext'

import css from './SelfServiceHelpCenterHomePage.less'

const OrderManagementFlowItem = ({
    isHighlighted,
    icon,
    children,
}: {
    isHighlighted: boolean
    icon: string
    children: ReactNode
}) => {
    return (
        <div
            className={classnames(css.item, {
                [css.isHighlighted]: isHighlighted,
            })}
        >
            <img src={icon} alt="" />
            {children}
        </div>
    )
}

type Props = {
    helpCenter: HelpCenter
}

const SelfServiceHelpCenterHomePage = ({helpCenter}: Props) => {
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()

    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[helpCenter.default_locale]

    return (
        <div className={css.container}>
            <div className={css.title}>{sspTexts.manageYourOrders}</div>
            <div className={css.itemsContainer}>
                {selfServiceConfiguration.track_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={trackIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'track_order_policy'
                        }
                    >
                        {sspTexts.track}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.return_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={returnIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'return_order_policy'
                        }
                    >
                        {sspTexts.return}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.cancel_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={cancelIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'cancel_order_policy'
                        }
                    >
                        {sspTexts.cancel}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.report_issue_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={reportIssueIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'report_issue_policy'
                        }
                    >
                        {sspTexts.reportIssue}
                    </OrderManagementFlowItem>
                )}
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterHomePage
