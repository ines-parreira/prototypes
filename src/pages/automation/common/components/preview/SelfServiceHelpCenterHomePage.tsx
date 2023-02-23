import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'

import {HELP_CENTER_TEXTS} from 'config/helpCenter'
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
    const history = useHistory()
    const {selfServiceConfiguration, hoveredOrderManagementFlow} =
        useSelfServicePreviewContext()

    const helpCenterTexts = HELP_CENTER_TEXTS[helpCenter.default_locale]
    const isInitialEntry = history.length === 1

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.title}>
                {helpCenterTexts.homepageManageOrdersTitle}
            </div>
            <div className={css.itemsContainer}>
                {selfServiceConfiguration.track_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={trackIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'track_order_policy'
                        }
                    >
                        {helpCenterTexts.orderFlowTrack}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.return_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={returnIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'return_order_policy'
                        }
                    >
                        {helpCenterTexts.orderFlowReturn}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.cancel_order_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={cancelIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'cancel_order_policy'
                        }
                    >
                        {helpCenterTexts.orderFlowCancel}
                    </OrderManagementFlowItem>
                )}
                {selfServiceConfiguration.report_issue_policy.enabled && (
                    <OrderManagementFlowItem
                        icon={reportIssueIcon}
                        isHighlighted={
                            hoveredOrderManagementFlow === 'report_issue_policy'
                        }
                    >
                        {helpCenterTexts.orderFlowReport}
                    </OrderManagementFlowItem>
                )}
            </div>
        </div>
    )
}

export default SelfServiceHelpCenterHomePage
