import React from 'react'

import classnames from 'classnames'
import trackIcon from 'assets/img/self-service/track.svg'
import returnIcon from 'assets/img/self-service/return.svg'
import cancelIcon from 'assets/img/self-service/cancel.svg'
import reportIssueIcon from 'assets/img/self-service/report-issue.svg'

import {PolicyKey} from 'models/selfServiceConfiguration/types'
import css from './HelpCenterPreviewAutomation.less'

const getOrderManagementIcon = (orderManagement: PolicyKey) => {
    switch (orderManagement) {
        case 'cancel_order_policy':
            return cancelIcon
        case 'report_issue_policy':
            return reportIssueIcon
        case 'track_order_policy':
            return trackIcon
        case 'return_order_policy':
            return returnIcon
        default:
            return null
    }
}

const getOrderManagementLabel = (orderManagement: PolicyKey) => {
    switch (orderManagement) {
        case 'cancel_order_policy':
            return 'Cancel'
        case 'report_issue_policy':
            return 'Report Issue'
        case 'track_order_policy':
            return 'Track'
        case 'return_order_policy':
            return 'Return'
        default:
            return null
    }
}

type HelpCenterPreviewAutomationProps = {
    flows: string[]
    // Readonly is used to simplify type casting and using `as const`
    orderManagement: Readonly<PolicyKey[]>
    highlightedOrderManagement?: Maybe<PolicyKey>
    primaryColor?: string
    primaryFont?: string
}

const HelpCenterPreviewAutomation = ({
    flows,
    orderManagement,
    primaryFont,
    primaryColor,
    highlightedOrderManagement,
}: HelpCenterPreviewAutomationProps) => {
    return (
        <div
            className={css.container}
            style={
                // React `style` accept only css properties
                {
                    '--preview-primary-color': primaryColor,
                    '--preview-primary-font': primaryFont,
                } as React.CSSProperties
            }
        >
            {flows.map((flow) => (
                <div key={flow} className={css.flowItem}>
                    <span className={css.flowName}>{flow}</span>
                    <span className={css.flowIcon}>
                        <i className="material-icons">chevron_right</i>
                    </span>
                </div>
            ))}
            {orderManagement.map((orderManagement) => {
                const imgSrc = getOrderManagementIcon(orderManagement)
                return (
                    <div
                        key={orderManagement}
                        className={classnames(css.flowItem, {
                            [css.highlightedItem]:
                                highlightedOrderManagement === orderManagement,
                        })}
                    >
                        {imgSrc && (
                            <img
                                className={css.flowImg}
                                src={imgSrc}
                                alt={`${orderManagement} icon`}
                            />
                        )}
                        <span className={css.flowName}>
                            {getOrderManagementLabel(orderManagement)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default HelpCenterPreviewAutomation
